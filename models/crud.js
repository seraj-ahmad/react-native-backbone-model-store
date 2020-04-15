/**
 * Created by seraj on 3/13/17.
 */

import EventEmitter from 'events';
import DeviceInfo from 'react-native-device-info';


/*
let counter = 1;

class Request {
  constructor(method, ns, data, query, options) {
    this.id = counter++;
    this.ns = ns;
    this.method = method;
    this.data = data;
    this.query = query;
    this.options  = options;
  }

  send(socket) {
    let options = {id: this.id};
    socket.emit(this.method, this.ns, this.data, this.query, options);
  }
}
*/

export default class CrudHandler extends EventEmitter {
  constructor(socket) {
    super();
    this.socket = socket;
    this.socket.on('sync', this.onSync.bind(this));
  }

  onSync(ns, method, data, options) {
    this.emit(ns, method, data, options);
  }

  sync(method, ns, data, query, options) {
    __DEV__ && console.log('SYNC REQUEST:', method, ns, data, query, options);
    //this.socket.emit(method, ns, data, query);
  }

  static init(socket) {
    socket.crud = new CrudHandler(socket);
    let deviceId = DeviceInfo.getUniqueId();
    socket.emit('enable crud api', deviceId);
  }
}