import _ from 'underscore';
import {CachedModel, CachedCollection} from '../models';

export default class CachedTable {
  constructor(table, socket) {
    this.table = table;
    this.model = CachedModel.derive(this.table.schema);
    this.crud = socket.crud;
    this.crud.on(this.ns, this.onSync.bind(this));
    this.subscribers = [];
    this.handlers = {
      'documents': this.onDocuments.bind(this),
      'create': this.onCreate.bind(this),
      'delete': this.onRemove.bind(this),
      'update': this.onUpdate.bind(this),
    }
  }

  get ns() { return this.model.schema.name; }

  newCollection(options={}) {
    let coll = new CachedCollection(null, {model: this.model, table: this});
    if(options.subscribe) {
      this.subscribers.push(coll);
    }
    return coll;
  }

  find(query, options={}) {
    let coll = this.newCollection(options);
    coll.fetch({query, options, reset:true});
    return coll;
  }

  async query(Q) {
    let result = await this.table.query(Q);
    return result;
  }

  async sync(method, model, options) {
    __DEV__ && console.log('SYNC TABLE:', method, model, options);
    let data;
    switch(method) {
      case 'read':
        data = await this.table.query(options.query, null, options.options);
        __DEV__ && console.log('DATA:', data, this.model.schema.name);
        //this.socket.emit('read', this.model.schema.name, {ts});
        return data;
      case 'create':
        this.create(model);
        return {};
      case 'update':
        this.update(model);
        return {};
      case 'delete':
        this.remove(model);
        return {};
      default:
        console.error('unknown operations', method);
        break;
    }
  }

  async read(model, options) {
    data = await this.table.query(options.query, null, options.options);
    __DEV__ && console.log('DATA:', data, this.model.schema.name);

    // let ts = data.reduce((tsmax, d) => Math.max(tsmax, d.ts), 0);
    // let query = {'ts': {'$gt': ts}, ...options.query};
    // this.crud.sync('read', this.ns, {}, query, options);
    return data;
  }

  async create(model, options) {
    data = model.toJSON();
    let ts = new Date().getTime();
    data.ts = ts;
    await this.table.insert(data);
    let query = model.getQuery();

    model.set({ts: ts});
    this.crud.sync('create', this.ns, data, query, options);
  }

  async remove(model, options) {
    let query = model.getQuery();
    await this.table.remove(query);
    this.crud.sync('remove', this.ns, {}, query, options);
  }

  async update(model, options) {
    var data = model.changedAttributes();
    if(_.isEmpty(data)) {
      console.error('Bad Update', model, options, model.isNew());
      throw new Error('Bad Update');
    }
    let query = model.getQuery();
    await this.table.update(data, query);
    this.crud.sync('update', this.ns, data, query, options);
  }

  onSync(method, data, query, options) {
    let handler = this.handlers[method];
    handler(data, options);
  }

  async onDocuments(data, query, options) {
    await this.table.insertMulti(data);
    this.subscribers.forEach((s) => {
      s.add(data);
    });
  }

  async onCreate(data, query, options) {
    await this.table.insert(data);
    this.subscribers.forEach((s) => {
      s.add(data);
    });
  }

  async onUpdate(data, query, options) {
    await this.table.update(delta, query);
    this.subscribers.forEach((s) => {
      let m = s.findWhere(query);
      if(m) { m.set(delta) }
    });
  }

  async onRemove(data, query, options) {
    await this.table.remove(query);
    this.subscribers.forEach((s) => {
      let m = s.findWhere(query);
      if(m) { s.remove(m); }
    });
  }
}
