import _ from 'underscore';
import Select from './select';

const json2SqlFieldTypeMapping = {
  'Int': 'INTEGER',
  'Number': 'FLOAT',
  'String': 'VARCHAR(256)',
  'Object': 'TEXT',
  'Boolean': 'INTEGER',
  'Id': 'VARCHAR(24)',
  'Text': 'TEXT',
  'Date': 'VARCHAR(64)',
  'Array': 'TEXT',
  'Stack': 'TEXT',
};

var splitData = function(data) {
  var keys = _.keys(data).sort();
  var values = keys.map( k => data[k]);

  return [keys, values];
};

//var VALID_CONFLICTS = [ 'REPLACE', 'ROLLBACK', 'ABORT', 'FAIL', 'IGNORE' ];
//var dequote = function(x) { return x.substring(1, x.length-1);};

let quote = function(x) { return '"' + x  + '"'; };
let setClause = function (keys) {
  return keys.length > 0 ? `SET ${keys.join(' = ?,')}  = ?` : '';
};

let whereClause = function (keys) {
  return keys.length > 0 ? `WHERE ${keys.join(' = ? AND ')} = ?` : '';
};


let jsonToSql = function(obj_json) {
  var flat_json = {};
  _.each(obj_json, function(fval, fname) {
    flat_json[quote(fname)] = JSON.stringify(fval);
  });
  return flat_json;
};

export default class TableStmt {
  constructor(name, model, fields) {
    this.name = name;
    this.model = model;
    this._fields = fields;
    if (!this.model) throw new Error('a valid model is required');
  }

  static FIELD_TYPE_MAP = json2SqlFieldTypeMapping;

  get schema() {
    return `PRAGMA table_info(${this.name})`;
  }

  get drop() {
    return `DROP TABLE IF EXISTS ${this.name}`;
  }

  get create() {
    let columns = this.getSqlColumns();
    return `CREATE TABLE IF NOT EXISTS ${this.name}(${columns})`;
  }

  get dropIndexes() {
    let indexes = this.model.indexes || [];
    return indexes.map(index => `DROP INDEX IF EXISTS ${index.name}`);
  }

  get createIndexes() {
    let indexes = this.model.indexes || [];
    return indexes.map((index) => {
      let cols = index.fields.map(quote);
      return `CREATE INDEX IF NOT EXISTS ${index.name} ON ${this.name} (${cols})`;
    });
  }

  get reset() {
    return [this.drop, ...this.dropIndexes, this.create, ...this.createIndexes];
  }

  get init() {
    return [ this.create, ...this.createIndexes];
  }

  insert(model) {
    let [keys, values] = splitData(this.prepareData(model));
    let wildcards = keys.map(k => '?');
    let stmt = `INSERT OR REPLACE INTO ${this.name} (${keys}) VALUES (${wildcards})`;
    return {stmt, values}
  }

  update1(delta, criteria) {
    let [dkeys, dvalues] = splitData(this.prepareData(delta));
    let [ckeys, cvalues] = splitData(this.jsonToSql(criteria));
    let stmt = `UPDATE OR REPLACE ${this.name} ${setClause(dkeys)} ${whereClause(ckeys)}`;
    let values = dvalues.concat(cvalues);
    return {stmt, values};
  }

  update(delta, criteria) {
    let [clauses, dvalues] = this.getUpdateClauses(delta);
    let [ckeys, cvalues] = splitData(this.jsonToSql(criteria));

    let stmt = `UPDATE OR REPLACE ${this.name} SET ${clauses.join(', ')} ${whereClause(ckeys)}`;
    let values = dvalues.concat(cvalues);
    return {stmt, values};
  }

  updateIterator(changes) {
    var self = this;
    return function* () {
      for(var i=0; i < changes.length; i++) {
        yield self.update(...changes[i]);
      }
    }
  }

  remove(criteria) {
    //let [keys, values] = splitData(this.jsonToSql(criteria));
    //criteria = this.jsonToSql(criteria);
    /*if(keys.length) {
      let toClause = k => _.isArray(values[k]) ? `${k} in ?` : `${k} = ?`;
      let clauses = keys.map(toClause);
      stmt += ` WHERE ${clauses.join(' AND ')}`;
    }*/

    let values = [];
    let whereClause = Select.getWhereClause(criteria, values);
    var stmt = `DELETE FROM ${this.name}${whereClause}`;

    return {stmt, values};
  }

  update2(delta, criteria, conflict) {
    conflict = conflict || 'REPLACE';
    //data = this.jsonToSql(data);
    let [dkeys, dvalues] = splitData(this.prepareData(delta, true));

    var stmt = `UPDATE OR ${conflict} ${this.name} SET `;
    stmt += dkeys.join(' = ?,') + ' = ?';

    let [ckeys, cvalues] = this.splitData(this.jsonToSql(criteria));
    if(ckeys.length) {
      stmt += ' WHERE ' + ckeys.join(' = ? AND ') + ' = ?';
    }

    let values = dvalues.concat(cvalues);
    return {stmt, values}
  }

  getSqlColumns() {
    let fields = [];

    // add schema version field
    fields.push(`"_s" INTEGER DEFAULT ${this.model.version}`);

    this.model.fields.forEach(f => fields.push(f.ref.getSqlDataSpec()));

    if(this.model.uniqueTogether) {
      let pkfields = this.model.uniqueTogether.map(quote);
      let primaryClause = `PRIMARY KEY (${pkfields})`;
      fields.push(primaryClause);
    }

    __DEV__ && console.log('\tSQLITE TABLE STMT: model:', this.name, 'fields:', fields);
    return fields;
  }

  get fieldNames() {
    if(!this._fieldNames) {
      this._fieldNames = this.model.fields.map(f => f.name);
    }
    return this._fieldNames;
  }

  jsonToSql(obj_json) {
    let d = {};
    _.each(obj_json, (fval, fname) => {
      let field = this._fields[fname];
      d[quote(fname)] = field.toDB(fval);
    });
    return d;
  };

  prepareData(data:object) {
    let d = _.pick(data, ...this.fieldNames);

    d = this.jsonToSql(d);
    __DEV__ && console.log('\tSQLITE: prepared data =', d);
    return d;
  }

  getUpdateClauses(delta: object) {
    let d = _.pick(delta, ...this.fieldNames);
    let keys = Object.keys(d).sort();
    let clauses = [];
    let values = [];

    for(var i=0; i < keys.length; i++) {
      let k = keys[i];
      let v = d[k];
      if(_.has(v, "$expr")) {
        let expr = v['$expr'];
        clauses.push(`${k} = ${expr}`);
      } else {
        clauses.push(`"${k}" = ?`);
        values.push(JSON.stringify(v));
      }
    }
    return [clauses, values];
  };
}
