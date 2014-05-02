Pro.prob = function (object, meta) {
  if (!object) {
    throw Error('Pro objects should not be empty or null!');
    return undefined;
  }

  var property,
      conf = Pro.Configuration,
      keyprops = conf.keyprops,
      keypropList = conf.keypropList
      isF = Pro.Utils.isFunction,
      isAr = Pro.Utils.isArray,
      isA = Pro.Utils.isArrayObject,
      isO = Pro.Utils.isObject;

  if (isAr(object)) {
    return new Pro.Array(object);
  }

  try {
    Object.defineProperty(object, '__pro__', {
      enumerable: false,
      configurable: false,
      writeble: false,
      value: {}
    });

    object.__pro__.state = Pro.States.init;

    for (property in object) {
      if (keyprops && keypropList.indexOf(property) !== -1) {
        throw Error('The property name ' + property + ' is a key word for pro objects! Objects passed to Pro.prob can not contain properties named as keyword properties.');
        break;
      }

      if (object.hasOwnProperty(property) && object[property] === null) {
        new Pro.NullProperty(object, property);
      } else if (object.hasOwnProperty(property) && !isF(object[property]) && !isA(object[property]) && !isO(object[property])) {
        new Pro.Property(object, property);
      } else if (object.hasOwnProperty(property) && isF(object[property])) {
        new Pro.AutoProperty(object, property);
      } else if (object.hasOwnProperty(property) && isA(object[property])) {
        new Pro.ArrayProperty(object, property);
      } else if (object.hasOwnProperty(property) && isO(object[property])) {
        new Pro.ObjectProperty(object, property);
      }
    }

    if (conf.keyprops && keypropList.indexOf('p') !== -1) {
      Object.defineProperty(object, 'p', {
        enumerable: false,
        configurable: false,
        writeble: false,
        value: function (p) {
          return this.__pro__.properties[p];
        }
      });
    }

    object.__pro__.state = Pro.States.ready;
  } catch (e) {
    object.__pro__.state = Pro.States.error;
    throw e;
  }

  return object;
};
