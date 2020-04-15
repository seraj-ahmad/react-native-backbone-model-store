/**
 * Created by seraj on 4/29/17.
 */
import _ from 'underscore';
import dst from './debug-style';
import AsyncStorage from '@react-native-community/async-storage';

const MIGRATE_STAGE = {
  INITIAL: 0,
  SAVE_DATA: 1,
  MIGRATE_TABLE: 2,
  MIGRATE_DATA: 3,
  POST_MIGRATE: 4,
  COMPLETE: 5,
};

const STAGES = ['INITIAL', 'SAVE_DATA', 'MIGRATE_TABLE', 'MIGRATE_DATA', 'POST_MIGRATE', 'COMPLETE'];

export default class SchemaUpgrader {
  constructor(table) {
    this.table = table;
    this.schema = table.schema;
    this.name = this.table.name;
    this.log = console.log.bind(console,  `%c[SCHEMA MIGRATION - ${this.name}]:`, dst('rw'))
  }

  key(purpose) {
    return `${this.table.schema.name}:migrate:${purpose}`;
  }

  async getStage() {
    let stage = await AsyncStorage.getItem(this.key('stage'));
    return stage ? JSON.parse(stage) : null;
  }

  async setStage(stage) {
    __DEV__ && this.log('---STAGE----', STAGES[stage]);
    await AsyncStorage.setItem(this.key('stage'), JSON.stringify(stage));
    return stage;
  }

  async resetStage() {
    await AsyncStorage.removeItem(this.key('stage'));
  }

  cmpField(f, desired, existing) {
    let f1 = _.findWhere(desired, {name: f});
    let f2 = _.findWhere(existing, {name: f});

    let [changed, changeSummary] = f1.ref.cmpSpec(f2);
    if(changed) {
      __DEV__ && this.log(changeSummary, f1, f2);
    }

    return changed;
  }

  // compare schema fields
  cmpSchema(specified, existing) {
    let f1 = specified.map(s => s.name);
    let f2 = existing.map(s => s.name).filter(s => s != '_s');

    let added = _.difference(f1, f2);
    if(added.length > 0 ) {
      __DEV__ && this.log('fields added', added);
    }

    let removed = _.difference(f2, f1);
    if(removed.length > 0 ) {
      __DEV__ && this.log('fields removed', removed);
    }

    let common = _.intersection(f1, f2);
    //__DEV__ && console.log('SCHEMA: FIELDS COMMON:', common);

    let altered = common.filter(f => this.cmpField(f, specified, existing));
    if(altered.length > 0) {
      __DEV__ && this.log('fields altered:', altered);
    }
    return added.length > 0 || removed.length > 0 || altered.length > 0;
  }

  async schemaChanged() {
    let existing = await this.table.getSqliteSchema();
    //__DEV__ && this.log('existing fields', existing);
    return this.cmpSchema(this.schema.fields, existing);
  }

  async saveData() {
    __DEV__ && this.log('saving data');
    let data = await this.table.query({});
    await AsyncStorage.setItem(this.key('data'), JSON.stringify(data));
    return data;
  }

  async retrieveData(data) {
    if(!data) {
      data = JSON.parse(await AsyncStorage.getItem(this.key('data')));
    }
    __DEV__ && this.log('retrieved data', data);
    return data;
  }

  async migrateData(data) {
    data = await this.retrieveData(data);
    // complex migration scenario will be handled by this function
    if(this.schema.migrate) {
      __DEV__ && this.log('transforming data');
      data = this.schema.migrate(data);
    }

    __DEV__ && this.log('writing back', data);
    await this.table.insertMulti(data);
  }

  async postMigrate() {
    if(this.schema.postMigrate) {
      __DEV__ && this.log('post migration data processing');
      await this.schema.postMigrate(this.table.db);
    }
  }

  async migrate(stage) {
    __DEV__ && this.log('migrating schema - initial stage', STAGES[stage]);
    let data = null;

    if(stage === MIGRATE_STAGE.SAVE_DATA) {
      data = await this.saveData();
      stage = await this.setStage(stage+1);
    }

    if(stage === MIGRATE_STAGE.MIGRATE_TABLE) {
      await this.table.recreate();
      stage = await this.setStage(stage+1);
    }


    if(stage === MIGRATE_STAGE.MIGRATE_DATA) {
      await this.migrateData(data);
      stage = await this.setStage(stage + 1);
    }

    if(stage === MIGRATE_STAGE.POST_MIGRATE) {
      await this.postMigrate();
      stage = await this.setStage(stage + 1);
    }
    return stage;
  }

  async upgrade() {
    let stage = await this.getStage();
    __DEV__ && this.log('schema upgrade', STAGES[stage]);

    if(!stage) {
      let schemaHasChanged = await this.schemaChanged();
      if(schemaHasChanged) {
        __DEV__ && this.log('schema has changed...upgrading');
        stage = this.setStage(MIGRATE_STAGE.SAVE_DATA);
      } else {
        __DEV__ && this.log('schema not changed');
      }
    }
    //await this.resetStage();
    //return;

    // if new or old migration
    if(stage) {
      try {
        stage = await this.migrate(stage);
        if(stage === MIGRATE_STAGE.COMPLETE ) {
          await this.resetStage();
        }
      } catch(e) {
        //console.error(`[SCHEMA]: error in migrating ${this.name}`, e);
        console.error(e);
      }
    }
  }
}
