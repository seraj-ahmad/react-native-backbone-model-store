"use strict";

__DEV__ = false;
let _ = require('underscore');

let Select;

describe("Select Statement", function() {
  beforeEach(function() {
    Select = require('../select');
  });

  it('select stmt - $eq AND $ne ', function() {
    let criteria = { 'category': {'$ne': 'blogs'}, 'state': {'$eq': 'published' }};
    let select = new Select('cms_Blog', criteria);
    expect(select.stmt).toEqual('SELECT * FROM cms_Blog WHERE "category" != ? AND "state" = ?');
    expect(select.values).toEqual([ '"blogs"', '"published"' ]);
  });

  it('select stmt - $lt AND $lte', function() {
    let criteria = { 'category': {'$lt': 'blogs'}, '_v': {'$lte': 10 }};
    let select = new Select('cms_Blog', criteria);
    expect(select.stmt).toEqual('SELECT * FROM cms_Blog WHERE "_v" <= ? AND "category" < ?');
    expect(select.values).toEqual(['10', '"blogs"']);
  });

  it('select stmt - $gt AND $gte', function() {
    let criteria = { 'category': {'$gt': 'blogs'}, '_v': {'$gte': 10 }};
    let select = new Select('cms_Blog', criteria);
    expect(select.stmt).toEqual('SELECT * FROM cms_Blog WHERE "_v" >= ? AND "category" > ?');
    expect(select.values).toEqual(['10', '"blogs"']);
  });

  it('select stmt - $in AND $nin', function() {
    let criteria = { '_v': {'$nin': [5,6,7]}, 'state': {'$in': ['published', 'draft'] }};
    let select = new Select('cms_Blog', criteria);
    expect(select.stmt).toEqual(`SELECT * FROM cms_Blog WHERE "_v" NOT IN('5','6','7') AND "state" IN('"published"','"draft"')`);
    expect(select.values).toEqual([ ]);
  });

  it('select stmt - multi $ ops', function() {
    let criteria = { 'category': {'$ne': 'blogs'}, '_v': {'$lt': 10, '$gt': 5 }};
    let select = new Select('cms_Blog', criteria);
    expect(select.stmt).toEqual('SELECT * FROM cms_Blog WHERE "_v" < ? AND "_v" > ? AND "category" != ?');
    expect(select.values).toEqual(['10', '5', '"blogs"']);
  });

});
