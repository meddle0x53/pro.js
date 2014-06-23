Pro.Registry = Pro.R = function () {
  this.streams = {};
  this.objects = {};
  this.lamdas = {};
};

Pro.Registry.prototype = rProto = {
  constructor: Pro.Registry,
  getStream: function (name) {
    return this.streams[name];
  },
  getLambda: function (name) {
    return this.lamdas[name];
  },
  get: function (name) {
    var type = name.charAt(0);
    if (type === 's') {
      return this.getStream(name.substring(2));
    }

    if (type === 'l' || type === 'f') {
      return this.getLambda(name.substring(2));
    }
  },
  toObjectArray: function (array) {
    var _this = this;
    if (!Pro.U.isArray(array)) {
      return this.toObject(array);
    }
    return map.call(array, function (el) {
      return _this.toObject(el);
    });
  },
  toObject: function (data) {
    if (Pro.U.isString(data)) {
      return this.get(data);
    }

    return data;
  },
  makeLambda: function (name, body) {
    this.lamdas[name] = body;
    return this.lamdas[name];
  },
  makeStream: function (name, options) {
    var isS = Pro.U.isString,
        source, opType, stream,
        args = slice.call(arguments, 2);

    if (options && isS(options)) {
      options = this.optionsFromString.apply(this, [options].concat(args));
    }

    if (options instanceof Pro.Observable) {
      options = {into: options};
    }

    this.streams[name] = stream = new Pro.Stream();

    for (opType in Pro.DSL.ops) {
      if (options && options[opType]) {
        options[opType] = this.toObjectArray(options[opType]);
      }
      opType = Pro.DSL.ops[opType];
      opType.action(stream, options);
    }

    return stream;
  },
  make: function (name, options) {
    var type = name.charAt(0);
    if (type === 's') {
      return this.makeStream(name.substring(2), options);
    }

    if (type === 'l' || type === 'f') {
      return this.makeLambda(name.substring(2), options);
    }
  },
  optionsFromString: function (optionString) {
    return this.optionsFromArray.apply(this, [optionString.split(Pro.DSL.separator)].concat(slice.call(arguments, 1)));
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
  }
};

rProto.stream = rProto.s = rProto.getStream;
