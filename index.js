import Sqlite from './sqlite';
import Models from './models';
import _ from 'underscore';
import SchemaUpgrader from './schema-upgrade';

export default class Storage {
  constructor(schema) {
    this.db = new Sqlite('ClozrNotes', 'sqlite');
    this.db.loadTables(schema);
    Models.init(this.db.tables);
  }

  get tables() {
    return this.db.tables;
  }

  async init() {
    let tables = this.db.tables;
    let tableNames = _.keys(tables);
    try {
      await this.db.init();
      for (var i = 0; i < tableNames.length; i++) {
        let table = tables[tableNames[i]];
        await table.create();
        await this.upgrade(table);
      }
    } catch (e) {
      console.error('CACHE INIT', e);
    }
  }

  async upgrade(table) {
    let upgrader = new SchemaUpgrader(table);
    await upgrader.upgrade();
  }

  getTable(name) {
    return this.db.tables[name];
  }

  getDatabase(): Sqlite {
    return this.db;
  }
}
