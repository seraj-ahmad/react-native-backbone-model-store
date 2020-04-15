import _ from 'underscore';

export default class TableStore {
  constructor(model, table) {
    this.table = table;
    this.subscribers = [];
    this.handlers = {
      'documents': this.onDocuments.bind(this),
      'create': this.onCreate.bind(this),
      'delete': this.onRemove.bind(this),
      'update': this.onUpdate.bind(this),
    }
  }

  get ns() { return this.model.schema.name; }

  async read(options) {
    let data = await this.table.query(options.query, null, options.options);
    __DEV__ && console.log('DATA:', data, this.table.ns);

    // let ts = data.reduce((tsmax, d) => Math.max(tsmax, d.ts), 0);
    // let query = {'ts': {'$gt': ts}, ...options.query};
    // this.crud.sync('read', this.ns, {}, query, options);
    return data;
  }

  async create(data, options) {
    //let idJson = options.model ? options.model.genId() : {};
    let ts = new Date().getTime();
    data.ts = ts;
    await this.table.insert(data);
    return {ts};
  }

  async remove(query) {
    await this.table.remove(query);
    return {};
  }

  async update(delta, query) {
    await this.table.update(delta, query);
  }

  async query(query, options={}) {
    __DEV__ && console.log('QUERYING DB:', this.table.ns);
    let resp = await this.table.query(query, null, options);
    __DEV__ && console.log('READ:', resp, this.table.ns);
    return resp;
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
