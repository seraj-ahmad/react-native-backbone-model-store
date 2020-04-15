//
//  Sqlite.js
//  Borrowed from MoneyInbox (c) Seraj Ahmad 2016
//
//  Created by Seraj Ahmad on 01/28/2017.
//  Copyright © 2016 Seraj Ahmad. All rights reserved.
//

var SQLite = require('react-native-sqlite-storage');
var  _ = require("underscore");
import Table from './table';
import dst from './debug-style';

var errorCB = function(err) {
  __DEV__ && console.log("\tSQLITE: Error: ", err, arguments);
};

var sqlMsg = function(msg, data={}) {
  __DEV__ && console.log(`%cSQLITE: \u2713 ${msg}`, dst('gw'), data);
}
var sqlError = function(msg, err, data) {
  __DEV__ && console.log(`%cSQLITE ERROR: ${msg} => ${err}`, dst('rw'), data);
}

export default class Sqlite {
  constructor(name, sql_type:string='sqlite') {
    __DEV__ && console.log('\tSQLITE: db create', name, sql_type);
    this.db_name = name;
    this.sql_type = sql_type || 'sqlite';
    this.tables = {};
  }

  loadTables(schemas) {
    schemas.forEach((schema) => {
      this.tables[schema.name] = new Table(schema, this);
    });
  }

  init() {
    if(this.sql_type == 'websql') {
      this.db = window.openDatabase(this.db_name, '1.0', 'Live Ink', 5*1024*1024);
      return Promise.resolve();
    } else {
      __DEV__ && console.log('open database:', this.db_name);
      return new Promise((resolve, reject) => {
        this.db = SQLite.openDatabase({name: this.db_name, location:2}, 
          () => {
            sqlMsg(`db ${this.db_name} opened`);
            resolve();
          },
          (err) => {
            sqlError(`db ${this.db_name} open`, err, {err})
            reject(err);
          })
      });
    };
  }

  clear() {
    __DEV__ && console.log('\tSQLITE: db drop');
    var self = this;
    if(this.sql_type == 'sqlite') {
      return new Promise((resolve, reject) => {
        SQLite.deleteDatabase({name: this.db_name, location:2},
          () => {
            sqlMsg(`db ${this.db_name} dropped`);
            resolve();
          },
          (err) => {
            sqlError(`db ${this.db_name} drop`, err, {err})
            reject(err);
          });
      });
    }
  }

  async reset() {
    await this.clear();
    await this.init();
  }

  async safeExec(description, stmts) {
    __DEV__ && console.log(`SQLITE EXECUTE -- ${description}`, stmts);
    try {
      let result = await this.execute(stmts);
      return result;
    } catch(e) {
      console.error(`SQLITE ERROR: ${description} failed`, e);
    }
  }

  execute(stmts) {
    stmts = _.isArray(stmts) ? stmts : [stmts];
    return new Promise((resolve, reject) => {
      let results = [];
      this.db.transaction((tx) => {
        //BEGIN TXN
        stmts.forEach((stmt) => {
          // EXECUTE STMT
          if(_.isString(stmt)) {
            tx.executeSql(stmt, null, (tx, res) => {
              results.push(res);
            }, (err) => {
              reject({err, stmt});
            });
          } else {
            tx.executeSql(stmt.stmt, stmt.values, (tx, res) => {
              results.push(res);
            }, (err) => {
              reject({err, stmt});
            });
          }
          // END STMT
        });
        // END TXNS
      }, (err) => {
        reject({err, stmts});
      }, () => {
        resolve(results.length == 1 ? results[0]: results);
      });
    });
  }

  iterExec(stmtIterator, tag) {
    return new Promise((resolve, reject) => {
      let results = [];
      this.db.transaction((tx) => {
        //BEGIN TXN
        let stmts = stmtIterator();
        for(let stmt of stmts) {
          tx.executeSql(stmt.stmt, stmt.values, (res) => {
            results.push(res);
          }, (err) => {
            reject({err, stmt});
          })
        }
        // END TXNS
      }, (err) => {
        reject({err, tag});
      }, () => {
        resolve(results);
      });
    });
  }
}

module.exports = Sqlite;
