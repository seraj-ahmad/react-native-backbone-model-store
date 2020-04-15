var _ = require('underscore');

var cordova = {
  resultset: []
  ,
  set_result: function(results) {
    this.resultset = _.clone(results);
  }
  ,
  add_result: function(res) {
    this.resultset.push(res);
  }
  ,
  set_query_result: function(q, r) {
    this.resultset = [{q: q, r:r}];
  }
  ,
  find_query: function(q) {
    __TEST__ && console.log('\tresultset:', this.resultset);
    for(var i=0; i<this.resultset.length; i++) {
      if(this.resultset[i].q == q) {
        var r = this.resultset[i].r;
        __TEST__ && console.log('\tresult:', r);
        return r;
      }
    }
    return {};
  }
  ,
  exec: function(okcb, errcb, plugin, name, args) {
    res = []
    __TEST__ && console.log('exec:', plugin, name, args);
    if(name == 'executeSqlBatch') {
      var executes = args[0].executes;
      __TEST__ && console.log('\t#stmts:', executes.length);
      for(var i = 0; i < executes.length; i++) {
        __TEST__ && console.log('\ts:', executes[i]);
        var r = this.find_query(executes[i].sql);
        __TEST__ && console.log('\tresult:', r);
        res.push({qid: executes[i].qid, type: 'success', result: r});
      }
      okcb(res);
    }
  }
};

export default cordova;
module.exports = cordova;
