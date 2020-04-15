let  _ = require("underscore");

let quote = function(x) { return '"' + x  + '"'; };
let squote = function(x) { return "'" + JSON.stringify(x)  + "'"; };

function assert(cond, msg) {
  if(!cond) { throw new Error(msg); }
}

const TFM = {
  '$eq'   : { expr: _.template(' = ?')  },
  '$ne'   : { expr: _.template(' != ?') },
  '$lt'   : { expr: _.template(' < ?')  },
  '$lte'  : { expr: _.template(' <= ?') },
  '$gt'   : { expr: _.template(' > ?')  },
  '$gte'  : { expr: _.template(' >= ?') },
  '$in'   : { expr: _.template(' IN(<%=val.map(squote).join(",")%>)'), getValue: (v) => null },
  '$nin'  : { expr: _.template(' NOT IN(<%=val.map(squote).join(",")%>)'), getValue: (v) => null },
  '$like' : { expr: _.template(" LIKE '<%=val%>'"), getValue: (v) => null},
};

const getRootOp = function(value) {
  let ops = _.isObject(value) && _.keys(value) || [];
  assert(ops.length < 2, 'invalid query expr: ' + value);
  return ops.length == 1 && ops[0][0]=='$'  ? ops[0]: null;
};

const iterOps = function*(value) {
  let ops = _.isObject(value) && _.keys(value) || [];
  if(ops.length == 0 || ops[0][0] != '$') {
    yield {op: '$eq', val: value};
  } else {
    for(let i=0; i < ops.length; i++) {
      let op = ops[i];
      yield {op, val: value[op]};
    }
  }
};

const getExpr = function*(name, value) {
  //let op = getRootOp(value);
  for(let {op,val} of iterOps(value)) {
    let tfm = TFM[op];
    if(tfm) {
      let expr = name + tfm.expr({val, squote});
      val = (tfm.getValue || JSON.stringify)(val);
      __DEV__ && console.log('\t\tEXPR:', expr, val);
      yield {expr, val};
    } else {
      assert(false, 'op ' + op + ' not supported');
    }
  }
};

const getWhereClause = function(criteria, values) {
  __DEV__ && console.log('\tSQLITE: query criteria:', criteria);
  let keys = _.keys(criteria).sort();
  if(keys.length == 0) return '';

  let clause = ' WHERE ';
  let exprs = [];
  keys.forEach((key) => {
    if(key == '$expr') {
      exprs = exprs.concat(criteria[key]);
    } else {
      for(let {expr, val} of getExpr(quote(key), criteria[key])) {
        exprs.push(expr);
        if(val) values.push(val);
      }
    }
  });
  __DEV__ && console.log('EXPRS:', exprs);
  clause += exprs.join(' AND ');
  return clause;
};

const getPagingClause = function(paging) {
  __DEV__ && console.log('\tSQLITE: select paging=', paging);
  let clause = '';
  if(paging) {
     if(paging.ordering1) {
      order_clause = paging.ordering.map(function(o) { return quote(o[0]) + (o[1] == -1 ? ' DESC' : ''); }).join(',')
      clause += ' ORDER BY ' + order_clause;
    }
    var page_size = paging.page_size || 10;
    var offset = (paging.page - 1)*page_size;
    clause +=  ' LIMIT '+ page_size;
    if(offset)
      clause +=  ' OFFSET '+ offset;
  }
  return clause;
}

const getOrderingClause = function(ordering) {
  if(!ordering || ordering.length == 0) return '';
  let order_clause = ordering.map((o) => {
    return o[1] == -1 ? `${o[0]} DESC` : o[0];
    //return quote(o[0]) + (o[1] == -1 ? ' DESC' : '');
  }).join(', ');
  return ` ORDER BY ${order_clause}`;
};

const getSelectClause = function(tbl, fields) {
  __DEV__ && console.log('\tSQLITE: select fields:', tbl, fields);
  var fields = fields && fields.map(quote) || ['*'];
  return  'SELECT ' + fields.join(',') + ' FROM ' + tbl;
}

export default class Select {
  constructor(tbl, criteria, fields, options={}) {
    this.values = [];
    this.stmt = getSelectClause(tbl, fields) + 
               getWhereClause(criteria, this.values) +
               getOrderingClause(options.ordering) +
               getPagingClause(options.paging);
    __DEV__ && console.log('\tSQLITE: select stmt =', this.stmt, ' VALUES=', this.values);
  }

  static getWhereClause = getWhereClause;
}

module.exports = Select;
