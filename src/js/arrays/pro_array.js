Pro.Array = function () {
  if (arguments.length === 0) {
    this._array = [];
  } else if (arguments.length === 1 && Pro.Utils.isArray(arguments[0])) {
    this._array = arguments[0];
  } else {
    this._array = slice.call(arguments);
  }

  var _this = this, getLength, setLength;

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
};

Pro.Array.prototype = Object.create(array_proto);
Pro.Array.constructor = Pro.Array;

Pro.Array.prototype.concat = function () {
  return new Pro.Array(concat.apply(this._array, arguments));
};

Pro.Array.prototype.every = function () {
  return every.apply(this._array, arguments);
};

Pro.Array.prototype.filter = function () {
  return filter.apply(this._array, arguments);
};

Pro.Array.prototype.forEach = function () {
  return forEach.apply(this._array, arguments);
};

Pro.Array.prototype.indexOf = function () {
  return indexOf.apply(this._array, arguments);
};
