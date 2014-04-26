Pro.Array = function () {
  if (arguments.length === 0) {
    this._array = [];
  } else if (arguments.length === 1 && Pro.Utils.isArray(arguments[0])) {
    this._array = arguments[0];
  } else {
    this._array = slice.call(arguments);
  }

  var _this = this, getLength, setLength, i;

  getLength = function () {
    return _this._array.length;
  };

  setLength = function (newLength) {
    _this._array.length = newLength;

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
      // TODO To defining function!
      (function (i) {
        Object.defineProperty(_this, i, {
          enumerable: true,
          configurable: true,
          get: function () {
            return _this._array[i];
          },
          set: function (newValue) {
            _this._array[i] = newValue;
          }
        });
      })(i);
    }

    this.__pro__.state = Pro.States.ready;
  } catch (e) {
    this.__pro__.state = Pro.States.error;
    throw e;
  }


};

Pro.Array.prototype = Object.create(array_proto);
Pro.Array.constructor = Pro.Array;

Pro.Array.prototype.concat = function () {
  return new Pro.Array(concat.apply(this._array, arguments));
};

Pro.Array.prototype.every = function () {
  return every.apply(this._array, arguments);
};

Pro.Array.prototype.some = function () {
  return some.apply(this._array, arguments);
};

Pro.Array.prototype.filter = function () {
  return new Pro.Array(filter.apply(this._array, arguments));
};

Pro.Array.prototype.forEach = function (fun /*, thisArg */) {
  return forEach.apply(this._array, arguments);
};

Pro.Array.prototype.map = function (fun /*, thisArg */) {
  return new Pro.Array(map.apply(this._array, arguments));
};

Pro.Array.prototype.reduce = function (fun /*, initialValue */) {
  return reduce.apply(this._array, arguments);
};

Pro.Array.prototype.reduceRight = function (fun /*, initialValue */) {
  return reduceRight.apply(this._array, arguments);
};

Pro.Array.prototype.indexOf = function () {
  return indexOf.apply(this._array, arguments);
};

Pro.Array.prototype.lastIndexOf = function () {
  return lastIndexOf.apply(this._array, arguments);
};

Pro.Array.prototype.join = function () {
  return join.apply(this._array, arguments);
};

Pro.Array.prototype.toLocaleString = function () {
  return toLocaleString.apply(this._array, arguments);
};

Pro.Array.prototype.toString = function () {
  return toString.apply(this._array, arguments);
};

Pro.Array.prototype.slice = function () {
  return new Pro.Array(slice.apply(this._array, arguments));
};

Pro.Array.prototype.splice = function () {
  return new Pro.Array(splice.apply(this._array, arguments));
};

Pro.Array.prototype.reverse = function () {
  return reverse.apply(this._array, arguments);
};

Pro.Array.prototype.sort = function () {
  return sort.apply(this._array, arguments);
};

Pro.Array.prototype.pop = function () {
  return pop.apply(this._array, arguments);
};

Pro.Array.prototype.push = function () {
  return push.apply(this._array, arguments);
};

Pro.Array.prototype.shift = function () {
  return shift.apply(this._array, arguments);
};

Pro.Array.prototype.unshift = function () {
  return unshift.apply(this._array, arguments);
};

Pro.Array.prototype.toArray = function () {
  return this._array;
};

Pro.Array.prototype.toJSON = function () {
  return JSON1.stringify(this._array);
};
