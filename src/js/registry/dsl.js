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
    out: opStoreAll.simpleOp('out', '>>'),
    on: {
      // @action(callback), @(callback), @action($1)
      sym: '@',
      match: function (op) {
        return op.substring(0, 1) === dslOps.on.sym;
      },
      toOptions: function (actionObject, op) {
        var reg = new RegExp(dslOps.on.sym + "(\\w*)\\(([\\s\\S]*)\\)"),
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

        actionObject.on = opArguments;
      },
      action: function (object, actionObject) {
        if (!actionObject || !actionObject.on) {
          return object;
        }

        var args = actionObject.on;
        if (!Pro.U.isArray(args)) {
          args = [args];
        }

        return object.on.apply(object, args);
      }
    }
  }
};

dslOps = Pro.DSL.ops;
