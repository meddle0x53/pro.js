Pro.Array = function () {
  if (arguments.length === 0) {
    this._array = [];
  } else if (arguments.length === 1 && Pro.Utils.isArray(arguments[0])) {
    this._array = arguments[0];
  } else {
    this._array = slice.call(arguments);
  }

  this.indexListeners = [];
  this.lastIndexCaller = null;
  this.lengthListeners = [];
  this.lastLengthCaller = null;

  var _this = this, getLength, setLength, i, oldLength;

  getLength = function () {
    _this.addLengthCaller();

    return _this._array.length;
  };

  setLength = function (newLength) {
    if (_this._array.length === newLength) {
      return;
    }

    oldLength = _this._array.length;
    _this._array.length = newLength;

    Pro.flow.run(function () {
      _this.willUpdate(Pro.Array.Operations.setLength, -1, oldLength, newLength);
    });

    return newLength;
  };

  Object.defineProperty(this, 'length', {
    configurable: false,
    enumerable: true,
    get: getLength,
    set: setLength
  });
  Object.defineProperty(this, '__pro__', {
    enumerable: false,
    configurable: false,
    writeble: false,
    value: {}
  });
  this.__pro__.state = Pro.States.init;

  try {
    for (i = 0; i < this._array.length; i++) {
      this.defineIndexProp(i);
    }

    this.__pro__.state = Pro.States.ready;
  } catch (e) {
    this.__pro__.state = Pro.States.error;
    throw e;
  }
};

Pro.Array.prototype = Object.create(array_proto);
Pro.Array.prototype.constructor = Pro.Array;

Pro.Array.Operations = {
  set: 0,
  add: 1,
  remove: 2,
  setLength: 3,
  reverse: 4,
  sort: 5,

  isIndexOp: function (op) {
    return op === this.set || op === this.reverse || op === this.sort;
  }
};

Pro.Array.prototype.addLengthListener = function (listener) {
  this.lengthListeners.push(listener);
};

Pro.Array.prototype.addLengthCaller = function () {
  var caller = Pro.currentCaller;

  if (caller && this.lastLengthCaller !== caller && !Pro.Utils.contains(this.lengthListeners, caller)) {
    this.addLengthListener(caller);
    this.lastLengthCaller = caller;
  }
};

Pro.Array.prototype.addIndexListener = function (listener) {
  this.indexListeners.push(listener);
};

Pro.Array.prototype.addIndexCaller = function () {
  var caller = Pro.currentCaller;

  if (caller && this.lastIndexCaller !== caller && !Pro.Utils.contains(this.indexListeners, caller)) {
    this.addIndexListener(caller);
    this.lastIndexCaller = caller;
  }
};

Pro.Array.prototype.defineIndexProp = function (i) {
  var proArray = this,
      array = proArray._array,
      oldVal;

  Object.defineProperty(this, i, {
    enumerable: true,
    configurable: true,
    get: function () {
      proArray.addIndexCaller();

      return array[i];
    },
    set: function (newVal) {
      if (array[i] === newVal) {
        return;
      }

      oldVal = array[i];
      array[i] = newVal;

      Pro.flow.run(function () {
        proArray.willUpdate(Pro.Array.Operations.set, i, oldVal, newVal);
      });
    }
  });
};

Pro.Array.prototype.willUpdate = function (op, ind, oldVal, newVal) {
  var i, listener,
      listeners = Pro.Array.Operations.isIndexOp(op) ? this.indexListeners : this.lengthListeners,
      length = listeners.length;

  for (i = 0; i < length; i++) {
    listener = listeners[i];

    if (Pro.Utils.isFunction(listener)) {
      Pro.flow.pushOnce(listener, [op, ind, oldVal, newVal]);
    } else {
      Pro.flow.pushOnce(listener, listener.call, [op, ind, oldVal, newVal]);
    }

    if (listener.property) {
      listener.property.willUpdate();
    }
  }
};

Pro.Array.prototype.concat = function () {
  this.addIndexCaller();
  this.addLengthCaller();

  return new Pro.Array(concat.apply(this._array, arguments));
};

Pro.Array.prototype.every = function () {
  this.addIndexCaller();
  this.addLengthCaller();

  return every.apply(this._array, arguments);
};

Pro.Array.prototype.some = function () {
  this.addIndexCaller();
  this.addLengthCaller();

  return some.apply(this._array, arguments);
};

Pro.Array.prototype.filter = function () {
  this.addIndexCaller();
  this.addLengthCaller();

  return new Pro.Array(filter.apply(this._array, arguments));
};

Pro.Array.prototype.forEach = function (fun /*, thisArg */) {
  this.addIndexCaller();
  this.addLengthCaller();

  return forEach.apply(this._array, arguments);
};

Pro.Array.prototype.map = function (fun /*, thisArg */) {
  this.addIndexCaller();
  this.addLengthCaller();

  return new Pro.Array(map.apply(this._array, arguments));
};

Pro.Array.prototype.reduce = function (fun /*, initialValue */) {
  this.addIndexCaller();
  this.addLengthCaller();

  return reduce.apply(this._array, arguments);
};

Pro.Array.prototype.reduceRight = function (fun /*, initialValue */) {
  this.addIndexCaller();
  this.addLengthCaller();

  return reduceRight.apply(this._array, arguments);
};

Pro.Array.prototype.indexOf = function () {
  this.addIndexCaller();
  this.addLengthCaller();

  return indexOf.apply(this._array, arguments);
};

Pro.Array.prototype.lastIndexOf = function () {
  this.addIndexCaller();
  this.addLengthCaller();

  return lastIndexOf.apply(this._array, arguments);
};

Pro.Array.prototype.join = function () {
  this.addIndexCaller();
  this.addLengthCaller();

  return join.apply(this._array, arguments);
};

Pro.Array.prototype.toLocaleString = function () {
  this.addIndexCaller();
  this.addLengthCaller();

  return toLocaleString.apply(this._array, arguments);
};

Pro.Array.prototype.toString = function () {
  this.addIndexCaller();
  this.addLengthCaller();

  return toString.apply(this._array, arguments);
};

Pro.Array.prototype.valueOf = function () {
  return this.toArray();
};

Pro.Array.prototype.slice = function () {
  this.addIndexCaller();
  this.addLengthCaller();

  return new Pro.Array(slice.apply(this._array, arguments));
};

Pro.Array.prototype.reverse = function () {
  if (this._array.length === 0) {
    return;
  }
  var reversed = reverse.apply(this._array, arguments), _this = this;

  Pro.flow.run(function () {
    _this.willUpdate(Pro.Array.Operations.reverse, -1, null, null);
  });
  return reversed;
};

Pro.Array.prototype.sort = function () {
  if (this._array.length === 0) {
    return;
  }
  var sorted = sort.apply(this._array, arguments), _this = this;

  Pro.flow.run(function () {
    _this.willUpdate(Pro.Array.Operations.sort, -1, null, null);
  });
  return sorted;
};

Pro.Array.prototype.splice = function () {
  return new Pro.Array(splice.apply(this._array, arguments));
};

Pro.Array.prototype.pop = function () {
  if (this._array.length === 0) {
    return;
  }
  var popped = pop.apply(this._array, arguments), _this = this;

  Pro.flow.run(function () {
    _this.willUpdate(Pro.Array.Operations.remove, _this._array.length, popped, null);
  });

  return popped;
};

Pro.Array.prototype.push = function () {
  var vals = arguments,
      newLength = push.apply(this._array, vals),
      _this = this;

  Pro.flow.run(function () {
    _this.willUpdate(Pro.Array.Operations.add, _this._array.length - 1, null, vals);
  });

  return newLength;
};

Pro.Array.prototype.shift = function () {
  if (this._array.length === 0) {
    return;
  }
  var shifted = shift.apply(this._array, arguments), _this = this;

  Pro.flow.run(function () {
    _this.willUpdate(Pro.Array.Operations.remove, 0, shifted, null);
  });

  return shifted;
};

Pro.Array.prototype.unshift = function () {
  var vals = arguments,
      newLength = unshift.apply(this._array, arguments),
      _this = this;

  Pro.flow.run(function () {
    _this.willUpdate(Pro.Array.Operations.add, 0, null, vals);
  });

  return newLength;
};

Pro.Array.prototype.toArray = function () {
  return this._array;
};

Pro.Array.prototype.toJSON = function () {
  return JSON1.stringify(this._array);
};
