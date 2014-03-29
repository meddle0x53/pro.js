Pro.AutoProperty = function (proObject, property) {
  this.func = proObject[property];

  var _this = this,
      getter = function () {
    _this.addCaller();

    _this.proObject['__pro__'].currentCaller = _this.property;
    _this.val = _this.func.apply(_this.proObject, arguments);
    _this.proObject['__pro__'].currentCaller = null;

    _this.proObject['__pro__'].originals = _this.proObject['__pro__'].originals || [];
    _this.proObject['__pro__'].originals[property] = _this.func;

    Object.defineProperty(_this.proObject, _this.property, {
      get: function () {
        _this.addCaller();
        return _this.val;
      },
      set: function (newVal) {
        _this.oldVal = _this.val;
        _this.val = newVal;

        _this.notifyAll();
      },
      enumerable: true,
      configurable: true
    });

    return _this.val;
  };

  Pro.Property.call(this, proObject, property, getter, function () {});
};

Pro.AutoProperty.prototype = Object.create(Pro.Property.prototype);;
Pro.AutoProperty.constructor = Pro.AutoProperty;
