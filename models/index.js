import Model from './model';
import ObjectManager from './object-manager';
import TableStore from './table-store';
import _ from 'underscore';

export default class Models {
  static models = {};
  static init(tables) {
    _.each(tables, (table, name) => {
      if (table.schema.createModel) {
        let model = Model.derive(table.schema);
        let store = new TableStore(model, table);
        model.objects = new ObjectManager(model, store);
        this.models[name] = model;
      }
    });
  }
}
