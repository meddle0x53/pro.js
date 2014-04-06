var Pro = {};

Pro.States = {
  init: 1,
  ready: 2,
  destroyed: 3
};

Pro.Utils = {};

Pro.Utils.isFunction = function (property) {
  return typeof(property) === 'function';
};

Pro.Utils.isString = function (property) {
  return typeof(property) === 'string';
};
