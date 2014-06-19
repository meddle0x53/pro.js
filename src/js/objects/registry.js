Pro.Registry = Pro.R = function () {
  this.streams = {};
  this.objects = {};
};

Pro.U.ex(Pro.Registry, {
  separator: '|',
  ops: {
    into: '<<',
    out: '>>',
    map: '<map>',
    add: '+',
  }
});

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
  from: function (data) {
    if (data instanceof Pro.Observable) {
      return data;
    }

    if (Pro.U.isString(data)) {
      return this.get(data);
    }
  },
  makeStream: function (name, options) {
    var isS = Pro.U.isString,
        source;

    if (options && isS(options)) {
      options = this.optionsFromString(options);
    }

    if (options instanceof Pro.Observable) {
      source = options;
    } else if (options && options.from) {
      source = this.from(options.from);
    }

    this.streams[name] = new Pro.Stream(source);

    return this.streams[name];
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

    return this.optionsFromArray(optionString.split(Pro.R.separator));
  },
  optionsFromArray: function (optionArray) {
    var result = {}, i, ln = optionArray.length,
        ops = Pro.R.ops, op;
    for (i = 0; i < ln; i++) {
      op = optionArray[i];
      if (op.substring(0, 2) === ops.into) {
        result.from = op.substring(2);
      }
    }

    return result;
  }
};

rProto.stream = rProto.s = rProto.getStream;
