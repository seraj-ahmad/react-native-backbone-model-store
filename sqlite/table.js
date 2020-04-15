//
//  Sqlite.js
//  Borrowed from MoneyInbox (c) Seraj Ahmad 2016
//
//  Created by Seraj Ahmad on 01/28/2017.
//  Copyright © 2016 Seraj Ahmad. All rights reserved.
//

import Select from './select';
import SCHEMAS from './schema';
import TableStmt from './table-stmts';
import getTableFields from './fields';
import dst from '../common/debug-style';
import _ from 'underscore';

export default class Table {
  constructor(schema, db) {
    this.ns = schema.name;
    this.db = db;
    this.name = Table.ns2tbl(this.ns);
    this.seq = Table.seq++;

    this.schema = schema;
    this.fields = getTableFields(this.schema);
    this.stmts = new TableStmt(this.name, this.schema, this.fields);
    this.log = console.log.bind(
      console,
      `%c[SQLITE - ${this.name}]:`,
      dst('yb'),
    );
  }

  static seq = 0;

  static ns2tbl(ns) {
    return ns.replace('/', '_');
  }

  static createAll(db) {
    let tables = {};
    SCHEMAS.forEach(schema => {
      tables[schema.name] = new Table(schema, db);
    });
    return tables;
  }

  async safeExec(description, stmts) {
    __DEV__ && this.log(`SQLITE EXECUTE -- ${description}`, stmts);
    try {
      let result = await this.db.execute(stmts);
      return result;
    } catch (e) {
      console.error(`SQLITE ERROR: ${description} failed on ${this.name}`, e);
    }
  }

  async drop() {
    let stmts = [...this.stmts.dropIndexes, this.stmts.drop];
    let result = await this.safeExec('table drop', stmts);
    return result;
  }

  async getSqliteSchema() {
    let stmts = [this.stmts.schema];
    let result = await this.safeExec('[SQLITE]: table schema', stmts);
    let specs = [];
    for (var i = 0; i < result.rows.length; i++) {
      let s = result.rows.item(i);
      specs.push(s);
    }
    return specs;
  }

  async create() {
    let stmts = [this.stmts.create, ...this.stmts.createIndexes];
    let result = await this.safeExec('table create', stmts);
    return result;
  }

  async recreate() {
    let stmts = this.stmts.reset;
    let result = await this.safeExec('table recreate', stmts);
    return result;
  }

  async insert(model: object, conflict: string) {
    let stmt = this.stmts.insert(model);
    let result = await this.safeExec('insert one', stmt);
    return result;
  }

  iterator(models, fn) {
    return function*() {
      for (var i = 0; i < models.length; i++) {
        yield fn(models[i]);
      }
    };
  }

  async insertMulti(models, conflict) {
    if (models.length > 0) {
      __DEV__ && console.groupCollapsed(`MULTI INSERT ${this.name}`);
      let genStmt = this.iterator(models, m => this.stmts.insert(m));
      let result = await this.db.iterExec(genStmt, 'bulk insert');
      __DEV__ && console.groupEnd();
      return result;
    }
  }

  async remove(criteria) {
    let stmt = this.stmts.remove(criteria);
    let result = await this.safeExec('remove', stmt);
    return result;
  }

  sqlToJson(item) {
    var data = {};
    _.each(item, (val, attr) => {
      //__DEV__ && console.log('ATTR:', attr, 'F:', f, 'VALUE:', val);
      //data[attr] = _.clone(JSON.parse(val));
      try {
        //__DEV__ && console.log(`SQLTOJSON:, val="${val}" type=${typeof val} attr=${attr}`);
        data[attr] = this.fields[attr].fromDB(val);
      } catch (e) {
        __DEV__ && this.log(`PARSE ERROR:, val=${val}, attr=${attr}`, e);
        data[attr] = val;
      }
    });
    //__DEV__ && this.log('\tSQLITE: sql2json =', data);
    return data;
  }

  async query(criteria, fields, options) {
    const __QUERY__ = 1;
    __QUERY__ &&
      console.groupCollapsed(
        `QUERY ${this.name} - ${JSON.stringify(criteria)}`,
      );

    let {stmt, values} = new Select(this.name, criteria, fields, options);
    let results = await this.db.execute({stmt, values});
    __QUERY__ && this.log('query =', criteria);
    __QUERY__ && this.log('results =', results);
    let rows = [];
    if (results) {
      for (var i = 0; i < results.rows.length; i++) {
        var item = results.rows.item(i);
        __QUERY__ && this.log('read', item);
        var json_data = this.sqlToJson(item);
        rows.push(json_data);
      }
    }
    __QUERY__ && console.groupEnd();
    return rows;
  }

  async count(criteria) {
    let values = [];
    let whereClause = Select.getWhereClause(criteria, values);
    let stmt = `SELECT COUNT(*) FROM ${this.name} ${whereClause}`;
    let results = await this.safeExec('table count', {stmt, values});

    //let results = await this.db.execute({stmt, values});
    __DEV__ && this.log('count result', stmt, values, results);
    if (results) {
      let rowCount = results.rows.item(0)['COUNT(*)'];
      __DEV__ && this.log('row count', rowCount);
      return rowCount;
    } else {
      return 0;
    }
  }

  async selectExpr(expr, criteria) {
    let label = `exec select expr - ${expr}`;

    let values = [];
    let whereClause = Select.getWhereClause(criteria, values);
    let stmt = `SELECT ${expr} FROM ${this.name} ${whereClause}`;

    let retVal = await this.safeExec(label, {stmt, values});
    __DEV__ && this.log(label, stmt, values, retVal);

    if (retVal) {
      let result = retVal.rows.item(0)[expr];
      __DEV__ && this.log(label, 'result=', result);
      return result;
    } else {
      return null;
    }
  }

  async update(delta, criteria, conflict) {
    if (_.isEmpty(delta)) {
      throw new Error('DELTA IS EMPTY');
    }
    let stmt = this.stmts.update(delta, criteria);
    let result = await this.safeExec('update', stmt);

    __DEV__ && console.log('update finished', result);
    return result;
  }

  async updateMulti(models, delta) {
    if (models.length > 0) {
      let genStmt = delta
        ? m => this.stmts.update(delta, m)
        : this.stmts.update(...m);
      let iterStmts = this.iterator(changes, genStmt);
      let result = await this.db.iterExec(iterStmts, 'bulk update');
      return result;
    }
  }

  async find(query, fields, options) {
    let data = await this.query(query, fields, options);
    return data;
  }

  async findOne(query, fields) {
    //TODO: check the cached data before querying the table

    let results = await this.query(query, fields);
    return results.length > 0 ? results[0] : null;
  }

  async getPages(w, page_size = 50) {
    var count = await this.count({w});
    __DEV__ && this.log('get pages for %s count %d', w, count);

    let table = this;
    function* iterPages() {
      let numPages = Math.ceil(count / page_size);
      for (var page = 1; page < numPages + 1; page++) {
        __DEV__ && this.log('querying %s  page %d', w, page);
        yield table.query({w}, null, {paging: {page_size, page}});
      }
    }
    return iterPages();
  }

  async getPage(w, page, page_size) {
    var count = await this.count({w});
    __DEV__ && this.log('get page w = %s, count = %d', w, count);

    let result = await this.table.query({w}, null, {paging: {page_size, page}});
    return result;
  }
}

module.exports = Table;
