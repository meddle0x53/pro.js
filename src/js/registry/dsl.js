Pro.OpStore = {
  all: {
    simpleOp: function(name, sym) {
      return {
        sym: sym,
        match: function (op) {
          return op.substring(0, sym.length) === sym;
        },
        toOptions: function (actionObject, op) {
          var reg = new RegExp(dslOps[name].sym + "(\\w*)\\(([\\s\\S]*)\\)"),
              matched = reg.exec(op),
              action = matched[1], args = matched[2],
              opArguments = [],
              realArguments = slice.call(arguments, 2),
              arg, i , ln;
          if (action) {
            opArguments.push(action);
          }

          if (args) {
            args = args.split(',');
            ln = args.length;
            for (i = 0; i < ln; i++) {
              arg = args[i].trim();
              if (arg.charAt(0) === '$') {
                arg = realArguments[parseInt(arg.substring(1), 10) - 1];
              }
              opArguments.push(arg);
            }
          }

          actionObject[name] = opArguments;
        },
        action: function (object, actionObject) {
          if (!actionObject || !actionObject[name]) {
            return object;
          }

          var args = actionObject[name];
          if (!Pro.U.isArray(args)) {
            args = [args];
          }

          return object[name].apply(object, args);
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
    out: opStoreAll.simpleOp('out', '>>'),
    on: opStoreAll.simpleOp('on', '@'),
    mapping: opStoreAll.simpleOp('mapping', 'map'),
    filtering: opStoreAll.simpleOp('filtering', 'filter'),
    accumulation: opStoreAll.simpleOp('accumulation', 'acc')
  }
};

dslOps = Pro.DSL.ops;
