import Collection from './collection';

//import SocketCrud from './socket-crud';

export default class ObjectManager {
  constructor(model, store) {
    this._store = store; //new SocketCrud(model.schema.name, socket);
    this.model = model;
    this.subscribers = [];
  }

  get store() {
    return this._store;
  }

  set store(s) {
    this._store = s;
  }

  get ns() { return this.model.schema.name; }

  newCollection(data=null, options={}) {
    let {subscribe=false, ...rest} = options;
    let coll = new Collection(data, {model: this.model, store: this.store, ...rest});
    if(subscribe) {
      this.subscribers.push(coll);
    }
    return coll;
  }

  onSync(method, data, options) {
    this.subscribers.forEach((s) => {
      s.onSync(method, data, options);
    });
  }
}
