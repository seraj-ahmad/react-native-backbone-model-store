/**
 * Created by seraj on 5/19/17.
 */

import {Model} from 'react-native-backbone-model';
import ObjectManager from './object-manager';
import moment from 'moment';
import _ from 'underscore';

/*var defineAttributes = function(model, attrs) {
  Object.keys(attrs).forEach((attr) => {
    Object.defineProperty(model, attr, {
      get: () => model.get(attr),
      set: (v) => {
        model.set(attr, v);
      }, enumerable: true
    });
  });
};*/

var InkModel = Model.extend({
  initialize(attribute, options={}) {
    if(options.store) {
      this.store = options.store;
    }
  },
  async sync(method, model, options) {
    __DEV__ && console.log('SYNC:', method, model, options);
    if(this.collection) {
      return this.collection.sync(method, model, options);
    }
    try {
      let result = await this.store.sync(method, model, options);
      options.success(result);
    } catch(e) {
      options.error(e);
    }
  },
  isNew() {
    let v = this.get('ts');
    return v === null || v === undefined;
  },
  getQuery() {
    return {[this.idAttribute]: this.get(this.idAttribute)};
  },
});

const TYPE_VALIDATORS = {
  'String': v => _.isString(v),
  'Id': v => _.isString(v),
  'Text': v => _.isString(v),
  'Number': v => _.isNumber(v),
  'Int': v => _.isNumber(v) &&  /^[0-9]+$/.test(v),
  'Date': v => moment(v).isValid(),
  'Boolean': v => (v === true || v === false),
  'Array': v => _.isArray(v),
  'Object': v => _.isObject(v)
};

const ensureField = (schema, name) => {
  let f = _.findWhere(schema.fields, {name});
  if(!f) { console.error(`model '${schema.name}': should have a ${name} field`); }
  return f;
};


let defaultId = () => '__tmp' + new Date().getTime();

InkModel.derive = function(schema, store) {
  let defaults = {};
  let idAttribute = schema.idAttribute;
  let VALIDATORS = {};
  schema.fields.forEach((f) => {
    if(!f.notNull) {
      defaults[f.name] = f.default || null;
      VALIDATORS[f.name] = [(v) => _.isNull(v) || TYPE_VALIDATORS[f.type](v)];
    } else {
      defaults[f.name] = f.default;
      VALIDATORS[f.name] = [TYPE_VALIDATORS[f.type]];
    }
    if(!idAttribute && f.primary) {
      idAttribute = f.name;
    }
  });

  if(!idAttribute) {
    idAttribute = 'ts';
  }
  //VALIDATORS['_v'] = [TYPE_VALIDATORS['Int']];

  //let f = ensureField(schema, idAttribute);
  ensureField(schema, 'ts');
  /*let idgen = f.auto || defaultId;
  var genId = () => ({[f.name] : idgen()});*/


  //ensureField(schema.fields, 'ts');

  var validate = function(attrs, options) {
    let errmsg = '';
    _.each(attrs, (v, k)=> {
      let validators = VALIDATORS[k] || [];
      let isValid = validators.reduce((res, validate) => validate(v), true);
      if(!isValid) {
        errmsg += `invalid attr ${k} ${v}`;
      }
    });
    return errmsg.length > 0 ? errmsg : null;
  };

  let ns = schema.name;

  let CLS =  InkModel.extend({
    idAttribute, defaults, schema, ns, validate,
    //genId,
    cidPrefix: ns,
  });

  CLS.ns = ns;
  CLS.schema = schema;
  CLS.objects = new ObjectManager(CLS, store);
  return CLS;
};

export default InkModel;
