Pro.AutoProperty = function (proObject, property) {
  this.func = proObject[property];

  var _this = this,
      getter = function () {
    _this.addCaller();
    var oldCaller = _this.proObject['__pro__'].currentCaller;

    _this.proObject['__pro__'].currentCaller = {
      property: _this,
      call: function () {
        proObject[property] = _this.func.call(proObject);
      }
    };
    _this.val = _this.func.apply(_this.proObject, arguments);
    _this.proObject['__pro__'].currentCaller = oldCaller;

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

        Pro.flow.run(function () {
          _this.willUpdate();
        });
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
