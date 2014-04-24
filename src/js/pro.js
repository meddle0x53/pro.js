var Pro = {},
    array_proto = Array.prototype,
    concat = array_proto.concat,
    every = array_proto.every,
    filter = array_proto.filter,
    forEach = array_proto.forEach,
    indexOf = array_proto.indexOf,
    slice = array_proto.slice;

Pro.States = {
  init: 1,
  ready: 2,
  destroyed: 3,
  error: 4
};

Pro.Utils = {};

Pro.Utils.isFunction = function (property) {
  return typeof(property) === 'function';
};

Pro.Utils.isString = function (property) {
  return typeof(property) === 'string';
};

Pro.Utils.isArray = function (property) {
  return typeof(property) === 'object' && Object.prototype.toString.call(property) === '[object Array]';
};

Pro.Configuration = {
  keyprops: true,
  keypropList: ['p']
};

Pro.currentCaller = null;
