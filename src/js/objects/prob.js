Pro.prob = function (object, meta) {
  var property,
      isAr = Pro.Utils.isArray;

  if (object === null || (!Pro.U.isObject(object) && !isAr(object))) {
    return new Pro.Val(object);
  }

  if (isAr(object)) {
    return new Pro.Array(object);
  }

  Object.defineProperty(object, '__pro__', {
    enumerable: false,
    configurable: false,
    writeble: false,
    value: new Pro.Core(object)
  });

  object.__pro__.prob();

  return object;
};
