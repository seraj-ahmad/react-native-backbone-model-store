__DEV__ = false;
jest.mock('../../storage/sqlite');

import fixture from './fixtures/sqlite';
import SCHEMAS from './fixtures/schema';

let _ = require('underscore');

let Sqlite, Table, Select, cordova;
let extended_match = function(sql_stmts, exp_stmts) {
  for(let i=0; i < sql_stmts.length; i++) {
    let s = sql_stmts[i];
    let e = exp_stmts[i];
    expect(s.stmt).toEqual(e.stmt);
    expect(s.params).toEqual(e.params);
    if(1) {
    if(s.params.length > 0) {
      for(let j=0; j < s.params.length; j++) {
        expect(s.params[j]).toEqual(e.params[j]);
      }
    }}
  }
};


describe("Sqlite Table", function() {
  beforeEach(function() {
    Sqlite = require('../sqlite');
    Table = require('../table');
    Select = require('../select');
    cordova = require('./helpers/cordova');
    this.db = new Sqlite('TestCache');
    this.db.loadTables(SCHEMAS);
    this.ns = 'cms/Blog';
    spyOn(cordova, 'exec').and.callThrough();
  });

  it('table name', function() {
    let table = this.db.tables[this.ns];
    expect(table.name).toEqual('cms_Blog');
  });

  it('create', async function() {
    let fx = fixture.create;
    let tbl = this.db.tables[this.ns];

    let result = await tbl.create();
    let db = tbl.db;
    expect(db.txns).toEqual(fx.expected.txns);
  });


  it('drop table', async function() {
    let fx = fixture.drop;
    let tbl = this.db.tables[this.ns];

    let result = await tbl.drop();
    let db = tbl.db;
    expect(db.txns).toEqual(fx.expected.txns);
  });

  it('recreate table', async function() {
    let fx = fixture.recreate;
    let tbl = this.db.tables[this.ns];

    let result = await tbl.recreate();
    let db = tbl.db;
    expect(db.txns).toEqual(fx.expected.txns);
  });


  it('prepare Data', function() {
    let fx = fixture.prepareData;
    let table = this.db.tables[fx.ns];

    let cleanedData = table.stmts.prepareData(fx.data);
    expect(cleanedData).toEqual(fx.expected.cleaned);
  })

  it('sql insert ', async function() {
    let fx = fixture.crud.insert;
    let table = this.db.tables[this.ns];

    let result = await table.insert(fx.data);
    let db = table.db;
    expect(db.txns).toEqual(fx.expected.txns);
  });

  it('sql multi-insert', async function() {
    let fx = fixture.crud.multiInsert;
    let table = this.db.tables[this.ns];

    let result = await table.insertMulti(fx.data);
    let db = table.db;
    expect(db.txns).toEqual(fx.expected.txns);
  });

  it('sql delete', async function() {
    let fx = fixture.crud.delete;
    let table = this.db.tables[this.ns];

    let result = await table.remove(fx.query);
    let db = table.db;
    expect(db.txns).toEqual(fx.expected.txns);
  });

  it('sql update', async function() {
    let fx = fixture.crud.update;
    let table = this.db.tables[this.ns];

    let result = await table.update(fx.delta, fx.criteria);
    let db = table.db;
    expect(db.txns).toEqual(fx.expected.txns);
  });

  it('sql query - plain', async function() {
    let fx = fixture.sqlQuery.plain;
    let table = this.db.tables[this.ns];
    let result = await table.query(fx.query);

    let db = table.db;
    expect(db.txns).toEqual(fx.expected.txns);
  });

  it('sql query - criteria', async function() {
    let fx = fixture.sqlQuery.criteria;
    let table = this.db.tables[this.ns];

    let result = await table.query(fx.query);
    let db = table.db;
    expect(db.txns).toEqual(fx.expected.txns);
  });

  it('sql query - projection', async function() {
    let fx = fixture.sqlQuery.projection;
    let table = this.db.tables[this.ns];

    let result = await table.query(fx.query, fx.fields);
    let db = table.db;
    expect(db.txns).toEqual(fx.expected.txns);
  });

  it('sql query - default limit', async function() {
    let fx = fixture.sqlQuery.defaultLimit;
    let table = this.db.tables[this.ns];

    let result = await table.query(fx.query, null, fx.options);
    let db = table.db;
    expect(db.txns).toEqual(fx.expected.txns);
  });

  it('sql query - limit', async function() {
    let fx = fixture.sqlQuery.limit;
    let table = this.db.tables[this.ns];

    let result = await table.query(fx.query, null, fx.options);
    let db = table.db;
    expect(db.txns).toEqual(fx.expected.txns);
  });

  it('sql query - skip & limit', async function() {
    let fx = fixture.sqlQuery.skipLimit;
    let table = this.db.tables[this.ns];

    let result = await table.query(fx.query, null, fx.options);
    let db = table.db;
    expect(db.txns).toEqual(fx.expected.txns);
  });

  it('sql query - skip & limit - ordered', async function() {
    let fx = fixture.sqlQuery.ordered;
    let table = this.db.tables[this.ns];

    let result = await table.query(fx.query, null, fx.options);
    let db = table.db;
    expect(db.txns).toEqual(fx.expected.txns);
  });

  it('sql query - all clauses', async function() {
    let fx = fixture.sqlQuery.allClauses;
    let table = this.db.tables[this.ns];

    let result = await table.query(fx.query, fx.fields, fx.options);
    let db = table.db;
    expect(db.txns).toEqual(fx.expected.txns);
  });

  it('sql query - results processing', async function() {
    let fx = fixture.sqlQuery.resultsProcessing;
    let table = this.db.tables[this.ns];
    let db = table.db;

    db.setResult(fx.mockResult);
    let result = await table.query({});

    expect(db.txns).toEqual(fx.expected.txns); //query
    expect(result).toEqual(fx.expected.rows); // processed results
  });
});
