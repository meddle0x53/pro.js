Pro.NullProperty = function (proObject, property) {
  var _this = this;

  Pro.Property.call(this, proObject, property, null, function () {});
};

Pro.NullProperty.prototype = Object.create(Pro.Property.prototype);;
Pro.NullProperty.prototype.constructor = Pro.NullProperty;

Pro.NullProperty.prototype.type = function () {
  return Pro.Property.Types.nil;
};
