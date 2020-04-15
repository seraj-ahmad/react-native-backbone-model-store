__DEV__ = false;
jest.mock('../../storage/sqlite');
jest.mock('mock-socket');

import MockSocket from 'mock-socket';

import Cache from '../index';
import fixtures from './fixtures/cache';

describe("Cache", function() {
  beforeEach(function() {
    this.socket = new MockSocket();
  });

  it('init', async () => {
    let fx = fixtures.init;
    let cache = new Cache(this.socket);
    let db = cache.db;
    cache.upgrade = jest.fn();

    await cache.init();
    expect(db.txns).toEqual(fx.expected.txns);
    let names = cache.upgrade.mock.calls.map(t => t[0].ns);
    expect(names).toEqual(["Whiteboard", "Folder", "InkElement", "StateChange", "SessionRecord"]);
  });
});
