var Pro = {},
    array_proto = Array.prototype,
    concat = array_proto.concat,
    every = array_proto.every,
    filter = array_proto.filter,
    forEach = array_proto.forEach,
    indexOf = array_proto.indexOf,
    join = array_proto.join,
    lastIndexOf = array_proto.lastIndexOf,
    map = array_proto.map,
    pop = array_proto.pop,
    push = array_proto.push,
    reduce = array_proto.reduce,
    reduceRight = array_proto.reduceRight,
    reverse = array_proto.reverse,
    shift = array_proto.shift,
    slice = array_proto.slice,
    some = array_proto.some,
    sort = array_proto.sort,
    splice = array_proto.splice,
    toLocaleString = array_proto.toLocaleString,
    toString = array_proto.toString,
    unshift = array_proto.unshift;

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

Pro.Utils.isObject = function (property) {
  return typeof(property) === 'object';
};

Pro.Utils.isArray = function (property) {
  return Pro.Utils.isObject(property) && Object.prototype.toString.call(property) === '[object Array]';
};

Pro.Utils.isProArray = function (property) {
  return property !== null && Pro.Utils.isObject(property) && Pro.Utils.isArray(property._array) && property.length !== undefined;
};

Pro.Utils.isArrayObject = function (property) {
  return Pro.Utils.isArray(property) || Pro.Utils.isProArray(property);
};

Pro.Utils.isProObject = function (property) {
  return Pro.Utils.isObject(property) && property.__pro__ !== undefined && Pro.Utils.isObject(property.__pro__.properties)
};

Pro.Utils.contains = function (array, value) {
  var i = array.length;
  while (i--) {
    if (array[i] === value) {
      return true;
    }
  }

  return false;
};

Pro.Utils.diff = function (array1, array2) {
  var i, e1, e2,
      index = -1,
      l1 = array1.length,
      l2 = array2.length,
      diff = {};

  if (l1 >= l2) {
    for (i = 0; i < l2; i++) {
      e1 = array1[i];
      e2 = array2[i];

      if (e1 !== e2) {
        if (index === -1) {
          index = i;
        }
        diff[index] = diff[index] || {o: [], n: []};
        diff[index].o.push(e1);
        diff[index].n.push(e2);
      } else {
        index = -1;
      }
    }

    if (index === -1) {
      index = i;
    }
    diff[index] = diff[index] || {o: [], n: []};
    for (; i < l1; i++) {
      e1 = array1[i];
      diff[index].o.push(e1);
    }
  } else if (l2 > l1) {
    diff = Pro.Utils.diff(array2, array1)
    for (i in diff) {
      el1 = diff[i];
      el2 = el1.n;
      el1.n = el1.o;
      el1.o = el2;
    }
  }

  return diff;
};

Pro.Configuration = {
  keyprops: true,
  keypropList: ['p']
};

Pro.currentCaller = null;
