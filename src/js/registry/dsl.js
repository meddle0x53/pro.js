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

          actionObject.order = actionObject.order || [];
          actionObject.order.push(name);
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
  },
  optionsFromString: function (optionString) {
    return dsl.optionsFromArray.apply(null, [optionString.split(dsl.separator)].concat(slice.call(arguments, 1)));
  },
  optionsFromArray: function (optionArray) {
    var result = {}, i, ln = optionArray.length,
        ops = Pro.R.ops, op, opType;
    for (i = 0; i < ln; i++) {
      op = optionArray[i];
      for (opType in Pro.DSL.ops) {
        opType = Pro.DSL.ops[opType];
        if (opType.match(op)) {
          opType.toOptions.apply(opType, [result, op].concat(slice.call(arguments, 1)));
          break;
        }
      }
    }
    return result;
  },
  run: function (observable, options, registry) {
    var isS = Pro.U.isString,
        args = slice.call(arguments, 3),
        option, i, ln, opType;

    if (options && isS(options)) {
      options = dsl.optionsFromString.apply(null, [options].concat(args));
    }

    if (options && options instanceof Pro.Observable) {
      options = {into: options};
    }

    if (options && options.order) {
      ln = options.order.length;
      for (i = 0; i < ln; i++) {
        option = options.order[i];
        if (opType = dslOps[option]) {
          if (registry) {
            options[option] = registry.toObjectArray(options[option]);
          }

          opType.action(observable, options);
          delete options[option];
        }
      }
    }

    for (opType in dslOps) {
      if (options && (option = options[opType])) {
        options[opType] = registry.toObjectArray(option);
      }
      opType = dslOps[opType];
      opType.action(observable, options);
    }

    return observable;
  }
};

dsl = Pro.DSL;
dslOps = dsl.ops;
