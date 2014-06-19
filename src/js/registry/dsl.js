Pro.OpStore = {
  all: {
    simpleOp: function(name, sym) {
      return {
        sym: sym,
        match: function (op) {
          return op.substring(0, sym.length) === dslOps[name].sym;
        },
        toOptions: function (actionObject, op) {
          actionObject[name] = op.substring(sym.length);
        },
        action: function (object, actionObject) {
          if (!actionObject || !actionObject[name]) {
            return object;
          }

          return object[name].call(object, actionObject[name]);
        }
      };
    }
  }
};
opStoreAll = Pro.OpStore.all;

Pro.DSL = {
  separator: '|',
  ops: {
    into: opStoreAll.simpleOp('into', '<<'),
    out: opStoreAll.simpleOp('out', '>>')  
  }
};

dslOps = Pro.DSL.ops;
