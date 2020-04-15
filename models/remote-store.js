/**
 * Created by seraj on 5/19/17.
 */

export default class RemoteStore {
  constructor(model, socket) {
    this.socket = socket;
    this.pendingTxns = {};
    this.ns = modelName;
    this.id = 1;
    this.socket.on(modelName, this._onModelEvent.bind(this));
  }

  _onModelEvent(event, txnId, data) {
    __DEV__ && console.log('MODEL EVENT:', event, txnId, data);
    switch(event) {
      case 'success': this.onSuccess(txnId, data); break;
      case 'error': this.onFailure(txnId, data); break;
      default: console.warn('unhandled event', event, txnId, data);
    }
  }

  emit(event, data, options) {
    this.socket.emit('model event', this.ns, event, data, options);
  }

  nextTxnId() {
    return 'txn' + this.id++;
  }

  onSuccess(txnId, resp) {
    let {resolve} = this.pendingTxns[txnId];
    if(resolve) {
      delete this.pendingTxns[txnId];
      resolve(resp);
    }
  }

  onFailure(txnId, error) {
    let {reject} = this.pendingTxns[txnId];
    if(reject) {
      delete this.pendingTxns[txnId];
      reject(error);
    }
  }

  query(query, options={}) {
    return new Promise((resolve, reject) => {
      let txnId = this.nextTxnId();
      this.pendingTxns[txnId] = {resolve, reject};
      this.emit('find', {query, options}, {txnId});
    });
  }

  create(model, options={}) {
    return new Promise((resolve, reject) => {
      let txnId = this.nextTxnId();
      this.pendingTxns[txnId] = {resolve, reject};
      this.emit('create', {model, options}, {txnId});
    });
  }

  update(delta, query, options={}) {
    return new Promise((resolve, reject) => {
      let txnId = this.nextTxnId();
      this.pendingTxns[txnId] = {resolve, reject};
      this.emit('update', {delta, query, options}, {txnId});
    });
  }

  remove(query, options={}){
    return new Promise((resolve, reject) => {
      let txnId = this.nextTxnId();
      this.pendingTxns[txnId] = {resolve, reject};
      this.emit('delete', {query, options}, {txnId});
    });
  }
}
