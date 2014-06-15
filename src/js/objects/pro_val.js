Pro.Val = function (val) {
  this.v = val;

  Pro.prob(this);
};

Pro.U.ex(Pro.Val.prototype, {
  type: function () {
    return this.__pro__.properties.v.type();
  },
  on: function (action, listener) {
    this.__pro__.properties.v.on(action, listener);
    return this;
  },
  off: function (action, listener) {
    this.__pro__.properties.v.off(action, listener);
    return this;
  },
  addTransformator: function (transformator) {
    this.__pro__.properties.v.addTransformator(transformator);
    return this;
  },
  into: function (observable) {
    this.__pro__.properties.v.into(observable);
    return this;
  },
  update: function (source) {
    this.__pro__.properties.v.update(source);
    return this;
  },
  willUpdate: function (source) {
    this.__pro__.properties.v.willUpdate(source);
    return this;
  },
  valueOf: function () {
    return this.__pro__.properties.v.val;
  },
  toString: function () {
    return this.valueOf().toString();
  }
});
