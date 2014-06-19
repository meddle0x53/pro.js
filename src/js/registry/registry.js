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
  get: function (name) {
    var type = name.charAt(0);
    if (type === 's') {
      return this.getStream(name.substring(2));
    }
  },
  toObject: function (data) {
    if (data instanceof Pro.Observable) {
      return data;
    }

    if (Pro.U.isString(data)) {
      return this.get(data);
    }
  },
  makeStream: function (name, options) {
    var isS = Pro.U.isString,
        source, opType, stream;

    if (options && isS(options)) {
      options = this.optionsFromString(options);
    }

    if (options instanceof Pro.Observable) {
      options = {into: options};
    }

    this.streams[name] = stream = new Pro.Stream();

    for (opType in Pro.DSL.ops) {
      if (options && options[opType]) {
        options[opType] = this.toObject(options[opType]);
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
  },
  optionsFromString: function (optionString) {
    if (optionString.indexOf(Pro.R.separator) < 0 && optionString.charAt(1) === ':') {
      return {from: optionString};
    }

    return this.optionsFromArray(optionString.split(Pro.DSL.separator));
  },
  optionsFromArray: function (optionArray) {
    var result = {}, i, ln = optionArray.length,
        ops = Pro.R.ops, op, opType;
    for (i = 0; i < ln; i++) {
      op = optionArray[i];
      for (opType in Pro.DSL.ops) {
        opType = Pro.DSL.ops[opType];
        if (opType.match(op)) {
          opType.toOptions(result, op);
          break;
        }
      }
    }

    return result;
  }
};

rProto.stream = rProto.s = rProto.getStream;
