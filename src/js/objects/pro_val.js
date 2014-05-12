Pro.Val = function (val) {
  this.v = val;
  Pro.prob(this);
};

Pro.Val.prototype.type = function () {
  return this.__pro__.properties.v.type();
};

Pro.Val.prototype.addListener = function (listener) {
  this.__pro__.properties.v.addListener(listener);
};

Pro.Val.prototype.removeListener = function (listener) {
  this.__pro__.properties.v.removeListener(listener);
};

Pro.Val.prototype.willUpdate = function (source) {
  this.__pro__.properties.v.willUpdate(source);
};

Pro.Val.prototype.valueOf = function () {
  return this.__pro__.properties.v.val;
};

Pro.Val.prototype.toString = function () {
  return this.valueOf().toString();
};
