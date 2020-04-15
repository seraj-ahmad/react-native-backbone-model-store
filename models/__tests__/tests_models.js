jest.mock('../../storage/sqlite');
jest.mock('mock-socket');

import MockSocket from 'mock-socket';
import _ from 'underscore';
import fixtures from './fixtures/sqlite';
import SCHEMAS from './fixtures/schema';

import Sqlite from '../../storage/sqlite';
import Models from '../index';
import Collection from '../collection';
import Model from '../model';

global.__DEV__ = false;

describe("Models", function() {
  beforeEach(() => {
    this.socket = new MockSocket();
    this.db = new Sqlite('TestDB');
    this.db.loadTables(SCHEMAS);
    Models.init(this.db.tables, this.socket);
  });

  it('model registry', () => {
    let registeredModels = _.keys(Models.models);
    expect(registeredModels).toEqual(["Element"]);
  });

  it('model check', () => {
    let Element = Models.models.Element;
    let model = new Element({})
    let modelCheck = model instanceof Model;
    expect(modelCheck).toEqual(true);
  });

  it('collection check', () => {
    let Element = Models.models.Element;
    let coll = Element.objects.newCollection();
    let collCheck = coll instanceof Collection;
    expect(collCheck).toEqual(true);
  });

  it('find Many', async () => {
    let Element = Models.models.Element;
    let coll = Element.objects.newCollection();
    this.db.clear();
    await coll.findMany({w: 'test'});
    expect(this.db.txns).toEqual([{"stmt": "SELECT * FROM Element WHERE \"w\" = ?", "values": ["\"test\""]}]);
  });

  it('create', async () => {
    let Element = Models.models.Element;
    let coll = Element.objects.newCollection();
    this.db.clear();

    let DATA = {_id: '173333222:0', w: 'test', u: 0, t: 173333222,d: {l: 'pen', points: [1,2,3]}};
    let m = await coll.pcreate(DATA);
    expect(this.db.txns).toEqual([{"stmt": "INSERT OR REPLACE INTO Element (\"_id\",\"changes\",\"d\",\"t\",\"ts\",\"u\",\"w\") VALUES (?,?,?,?,?,?,?)", "values": ["\"173333222:0\"", "[]", "{\"l\":\"pen\",\"points\":[1,2,3]}", "173333222", `${m.get('ts')}`, "0", "\"test\""]}]);
  });

  it('remove', async () => {
    let Element = Models.models.Element;
    let coll = Element.objects.newCollection();

    let DATA = {_id: '173333222:0', w: 'test', u: 0, t: 173333222,d: {l: 'pen', points: [1,2,3]}};
    let model = await coll.pcreate(DATA);

    this.db.clear();
    model.destroy();
    expect(this.db.txns).toEqual([{"stmt": "DELETE FROM Element WHERE \"_id\" = ?", "values": [`"${model.id}"`]}]);
  });

  it('update', async () => {
    let Element = Models.models.Element;
    let coll = Element.objects.newCollection();

    let DATA = {_id: '173333222:0', w: 'test', u: 0, t: 173333222,d: {l: 'pen', points: [1,2,3]}};
    let model = await coll.pcreate(DATA);

    this.db.clear();
    model.save({'changes': [{ts: 123}]});
    expect(this.db.txns).toEqual([{"stmt": "UPDATE OR REPLACE Element SET \"changes\" = ? WHERE \"_id\" = ?", "values": ["[{\"ts\":123}]", `"${model.id}"`]}]);
  });
});
