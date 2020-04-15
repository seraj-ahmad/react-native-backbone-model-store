/**
 * Created by seraj on 5/19/17.
 */

import {Collection} from 'react-native-backbone-model';
import _ from 'underscore';
var InkCollection = Collection.extend({
  initialize(models, options) {
    this.store = options.store;
    this.cid = _.uniqueId(`${this.model.schema.name}List`);
  },

  pcreate(model, options={}) {
    if(model.ts || model.isNew && model.isNew()) {
      console.error('model specifies `ts` field. This field is automatically created and populated during creation.')
    }
    return new Promise((resolve, reject) => {
      let success = (m, resp) => {
        resolve(m);
      };
      let error = (err) => {
        reject(err);
      };
      let mm = this.create(model, {...options, success, error});
      if(mm.validationError) {
        reject(mm.validationError);
      }
    });
  },

  async sync(method, model, options) {
    __DEV__ && console.log('SYNC:', method, model, options);
    try {
      let resp = await this._sync(method, model, options);
      __DEV__ && console.log('SYNC RESPONSE:', method, resp);
      options.success(resp);
    } catch(e) {
      __DEV__ && console.log('ERROR:', e, this.store);

      options.error(e);
    }
  },

  async findOne(Q) {
    __DEV__ && console.log('findOne:', this.models.map(m => m.id));
    let model = this.findWhere(Q);
    __DEV__ && console.log('local findOne:', model);
    if(!model) {
      let models = await this.store.query(Q);
      __DEV__ && console.log('TABLE FIND RESUTLS', models);
      this.add(models, {silent: true});
      model = this.findWhere(Q);
    }
    __DEV__ && console.log('findOne Result:', model);
    return model;
  },

  async findMany(Q) {
    __DEV__ && console.log(`[${this.model.ns}]: query: ${Q}, ${this.store}`);
    let models = await this.store.query(Q);
    this.reset(models);
    __DEV__ && console.log(`[${this.model.ns}]: length=${models.length}`, models, this.length);
  },

  async _sync(method, model, options) {
    __DEV__ && console.log('SYNC:', method, model, options);
    let resp;
    switch(method) {
      case 'read':
        resp = await this.store.query(options.query, options.options);
        __DEV__ && console.log('READ:', resp);
        break;
      case 'create':
        resp = await this.store.create(model.toJSON(), {model});
        break;
      case 'update':
        let delta = model.changedAttributes();
        if(_.isEmpty(delta)) {
          console.error('Bad Update', model, options, model.isNew());
          throw new Error('Bad Update');
        }
        resp = await this.store.update(delta, model.getQuery());
        break;
      case 'delete':
        resp = await this.store.remove(model.getQuery());
        break;
      default:
        throw new Error(`unknown method: ${method}`);
        break;
    }
    __DEV__ && console.log('ON RESPONSE:', method, resp);
    return resp;
  }
});

export default InkCollection;
