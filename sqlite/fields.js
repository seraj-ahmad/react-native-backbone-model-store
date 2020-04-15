/**
 * Created by seraj on 4/6/17.
 */
import moment from 'moment';
import _ from 'underscore';

const SQL_TYPES = {
  'Int': 'INTEGER',
  'Number': 'FLOAT',
  'String': 'VARCHAR(256)',
  'Object': 'TEXT',
  'Boolean': 'INTEGER',
  'Id': 'VARCHAR(24)',
  'Text': 'TEXT',
  'Date': 'VARCHAR(64)',
  'Array': 'TEXT',
  'Stack': 'TEXT',
};

class Field {
  constructor(f, inUniqueTogether) {
    this.name = f.name;
    this.type = f.type;
    this.sql_type = SQL_TYPES[f.type];
    this.notNull = f.notNull;
    this.primary = !!f.primary;
    this.inUniqueTogether = inUniqueTogether;
    if (_.has(f, 'default')) {
      this.default = this.encodeDefault(this.toDB(f.default));
    }

    f.ref = this;
  }

  encodeDefault(v) {
    if (this.sql_type === 'TEXT') {
      return `"${v}"`;
    } else {
      return v;
    }
  }

  getSqlDataSpec() {
    let spec = this.sql_type;
    if (this.notNull) {
      spec += ' NOT NULL';
    }
    if (this.primary) {
      spec += ' PRIMARY KEY';
    }
    if (_.has(this, 'default')) {
      spec += ` DEFAULT ${this.default}`;
    }
    return `'${this.name}' ${spec}`;
  }

  cmpSpec(fsql, summarize = true) {
    let pk = this.primary || this.inUniqueTogether;
    let pkChanged = pk !== !!fsql.pk;
    let typeChanged = this.sql_type !== fsql.type;
    let nullChanged = !!this.notNull !== !!fsql.notnull;
    let defaultChanged = (this.default !== fsql.dflt_value) && (fsql.dflt_value != null);

    let changed = typeChanged || pkChanged || nullChanged || defaultChanged;

    let changeSummary = '';
    if (changed && summarize) {
      if (typeChanged) {
        changeSummary += `${this.name} -- type changed -- ${this.sql_type} ${fsql.type}`;
      }
      if (pkChanged) {
        changeSummary += `${this.name} -- pk changed -- ${pk} ${fsql.pk}`;
      }
      if (nullChanged) {
        changeSummary += `${this.name} -- null changed -- ${this.notNull} ${fsql.notnull}`;
      }
      if (defaultChanged) {
        changeSummary += `${this.name} -- default changed -- ${this.default} ${fsql.dflt_value}`;
      }
    }
    return [changed, changeSummary];
  }

  toDB(v) {
    return JSON.stringify(v);
  }
  fromDB(v) {
    return JSON.parse(v);
  }
}

class Number extends Field {
  toDB(v) {
    if (v == null || _.isNumber(v)) {
      return JSON.stringify(v);
    } else {
      throw new Error(`Field ${this.name} value '${v}' is not a number`);
    }
  }

  fromDB(v) {
    let vv = JSON.parse(v);
    if (vv != null && !_.isNumber(vv)) {
      console.warn(`Field ${this.name} value '${vv}' is not a number`);
    }
    return vv;
  }
}

class StackField extends Field {
  toDB(v) {
    return v.length > 0 ? v.join('|') + '|' : '';
  }
  fromDB(v) {
    return v.split('|').pop();
  }
}

class BooleanField extends Field {
  toDB(v) {
    return v === true ? 1 : 0;
  }

  fromDB(v) {
    return v == 1 ? true : false;
  }
}

class DateField extends Field {
  toDB(v) {
    return v.toJSON();
  }
  fromDB(v) {
    return moment(v);
  }
}

const FIELDS = {
  'Int':      Number,
  'Number':   Number,
  'String':   Field,
  'Object':   Field,
  'Boolean':  Field,
  'Id':       Field,
  'Text':     Field,
  'Date':     Field,
  'Array':    Field,
  'Stack':    StackField,
};

export default function getTableFields(schema) {
  // __DEV__ && console.log('FIELD - MOdel', schema.name);
  let pkmap = {};
  let uniques = schema.uniqueTogether || [];
  uniques.forEach(x => (pkmap[x] = true));

  let fields = {};
  schema.fields.forEach(f => {
    fields[f.name] = new FIELDS[f.type](f, !!pkmap[f.name]);
  });
  fields['_s'] = new FIELDS['Int']({
    name: '_s',
    type: 'Int',
    default: schema.version,
  });
  return fields;
}
