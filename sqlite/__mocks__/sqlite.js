var  _ = require("underscore");
import Table from '../table';

let __DEV__ = 0

export default class Sqlite {
  constructor(name, schemas, sql_type:string='sqlite') {
    this.db_name = name;
    this.sql_type = sql_type || 'sqlite';
    this.tables = {};
    this.txns = [];
    this.mockedResults = [];
  }

  loadTables(schemas) {
    schemas.forEach((schema) => {
      this.tables[schema.name] = new Table(schema, this);
    });
  }

  setResult(r) {
    if(_.isArray(r)) {
      this.mockedResults = this.mockedResults.concat(r);
    } else {
      this.mockedResults.push(r);
    }
    __DEV__ && console.log('MOCK RESULTS:', this.mockedResults);
  }

  _payload(data) {
    return {
      rows: {
        item: function(i) {
          return data[i];
        },
        length: data.length
      },
      rowsAffected: data.length || 0,
      insertId: void 0
    }
  }

  getResult(s) {
    for(var i=0; i < this.mockedResults.length; i++) {
      let r = this.mockedResults[i];
      //__DEV__ && console.log('MATCHING,', r.pattern, s)
      if(r.pattern.test(s.stmt)) {
        __DEV__ && console.log('MATCHED PATTERN,', r.pattern, s)
        if(!r.criteria || _.isEqual(r.criteria,s.values)) {
          __DEV__ && console.log('MATCHED CRITERIA,', r.pattern, s)
          return this._payload(r.data);
        }
      }
    }
    return null;
  }

  init() {}

  clear() {
    this.txns = [];
  }

  execute(stmts) {
    __DEV__ && console.log('MOCK EXEC:', stmts);
    this.txns.push(stmts);
    __DEV__ && console.log('TXNS:', this.txns);
    if(this.mockedResults.length > 0) {
      return _.isArray(stmts) ? stmts.map(s => this.getResult(s)): this.getResult(stmts);
    }
  }

  safeExec(description, stmts) {
    __DEV__ && console.log(`SQLITE EXECUTE -- ${description}`, stmts);
    try {
      let result = this.execute(stmts);
      return result;
    } catch(e) {
      console.error(`SQLITE ERROR: ${description} failed`, e);
    }
  }

  iterExec(stmtIterator, tag) {
    let stmtsIter = stmtIterator();
    let stmts = []
    for(let stmt of stmtsIter) {
      stmts.push(stmt);
    }
    this.execute(stmts);
  }
}


module.exports = Sqlite;
