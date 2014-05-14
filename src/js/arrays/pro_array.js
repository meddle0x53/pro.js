Pro.Array = function () {
  if (arguments.length === 0) {
    this._array = [];
  } else if (arguments.length === 1 && Pro.Utils.isArray(arguments[0])) {
    this._array = arguments[0];
  } else {
    this._array = slice.call(arguments);
  }

  this.indexListeners = [];
  this.lastIndexCaller = null;
  this.lengthListeners = [];
  this.lastLengthCaller = null;

  var _this = this, getLength, setLength, i, oldLength;

  getLength = function () {
    _this.addLengthCaller();

    return _this._array.length;
  };

  setLength = function (newLength) {
    if (_this._array.length === newLength) {
      return;
    }

    oldLength = _this._array.length;
    _this._array.length = newLength;

    Pro.flow.run(function () {
      _this.willUpdate(Pro.Array.Operations.setLength, -1, oldLength, newLength);
    });

    return newLength;
  };

  Object.defineProperty(this, 'length', {
    configurable: false,
    enumerable: true,
    get: getLength,
    set: setLength
  });
  Object.defineProperty(this, '__pro__', {
    enumerable: false,
    configurable: false,
    writeble: false,
    value: {}
  });
  this.__pro__.state = Pro.States.init;

  try {
    for (i = 0; i < this._array.length; i++) {
      this.defineIndexProp(i);
    }

    this.__pro__.state = Pro.States.ready;
  } catch (e) {
    this.__pro__.state = Pro.States.error;
    throw e;
  }
};

Pro.Array.prototype = Object.create(array_proto);
Pro.Array.prototype.constructor = Pro.Array;

Pro.Array.Operations = {
  set: 0,
  add: 1,
  remove: 2,
  setLength: 3,
  reverse: 4,
  sort: 5,
  splice: 6,

  isIndexOp: function (op) {
    return op === this.set || op === this.reverse || op === this.sort;
  }
};

Pro.Array.reFilter = function (original, filtered, filterArgs) {
  var oarr = filtered._array;

  filtered._array = filter.apply(original._array, filterArgs);
  filtered.updateByDiff(oarr);
};

Pro.Array.everyNewValue = function (fun, thisArg, nv) {
  var nvs = slice.call(nv, 0),
      j = nvs.length - 1;
  while (j >= 0) {
    if (!fun.call(thisArg, nvs[j])) {
      return false;
    }
    j--;
  }

  return true;
};

Pro.Array.prototype.addLengthListener = function (listener) {
  this.lengthListeners.push(listener);
};

Pro.Array.prototype.addLengthCaller = function () {
  var caller = Pro.currentCaller;

  if (caller && this.lastLengthCaller !== caller && !Pro.Utils.contains(this.lengthListeners, caller)) {
    this.addLengthListener(caller);
    this.lastLengthCaller = caller;
  }
};

Pro.Array.prototype.addIndexListener = function (listener) {
  this.indexListeners.push(listener);
};

Pro.Array.prototype.addIndexCaller = function () {
  var caller = Pro.currentCaller;

  if (caller && this.lastIndexCaller !== caller && !Pro.Utils.contains(this.indexListeners, caller)) {
    this.addIndexListener(caller);
    this.lastIndexCaller = caller;
  }
};

Pro.Array.prototype.addListener = function (listener) {
  this.addIndexListener(listener);
  this.addLengthListener(listener);
};

Pro.Array.prototype.defineIndexProp = function (i) {
  var proArray = this,
      array = proArray._array,
      oldVal,
      isA = Pro.Utils.isArray,
      isO = Pro.Utils.isObject,
      isF = Pro.Utils.isFunction;

  if (isA(array[i])) {
    new Pro.ArrayProperty(array, i);
  } else if (isF(array[i])) {
  } else if (isO(array[i])) {
    new Pro.ObjectProperty(array, i);
  }

  Object.defineProperty(this, i, {
    enumerable: true,
    configurable: true,
    get: function () {
      proArray.addIndexCaller();

      return array[i];
    },
    set: function (newVal) {
      if (array[i] === newVal) {
        return;
      }

      oldVal = array[i];
      array[i] = newVal;

      Pro.flow.run(function () {
        proArray.willUpdate(Pro.Array.Operations.set, i, oldVal, newVal);
      });
    }
  });
};

Pro.Array.prototype.willUpdate = function (op, ind, oldVal, newVal) {
  var listeners = Pro.Array.Operations.isIndexOp(op) ? this.indexListeners : this.lengthListeners;

  this.willUpdateListeners(listeners, op, ind, oldVal, newVal);
};

Pro.Array.prototype.willUpdateSplice = function (index, spliced, newItems) {
  var listeners, op = Pro.Array.Operations.splice;

  if (!spliced || !newItems || (spliced.length === 0 && newItems.length === 0)) {
    return;
  }

  if (spliced.length === newItems.length) {
    listeners = this.indexListeners;
  } else if (!newItems.length || !spliced.length) {
    listeners = this.lengthListeners;
  } else {
    listeners = this.lengthListeners.concat(this.indexListeners);
  }

  this.willUpdateListeners(listeners, op, index, spliced, newItems);
};

Pro.Array.prototype.willUpdateListeners = function (listeners, op, ind, oldVal, newVal) {
  var length = listeners.length, i, listener,
      event = new Pro.Event(undefined, this, Pro.Event.Types.array, op, ind, oldVal, newVal);

  for (i = 0; i < length; i++) {
    listener = listeners[i];

    if (Pro.Utils.isFunction(listener)) {
      Pro.flow.pushOnce(listener, [event]);
    } else {
      Pro.flow.pushOnce(listener, listener.call, [event]);
    }

    if (listener.property) {
      listener.property.willUpdate(event);
    }
  }
};

Pro.Array.prototype.updateByDiff = function (array) {
  var _this = this,
      j, diff = Pro.Utils.diff(array, this._array), cdiff;

  Pro.flow.run(function () {
    for (j in diff) {
      cdiff = diff[j];
      if (cdiff) {
        _this.willUpdateSplice(j, cdiff.o, cdiff.n);
      }
    }
  });
};


Pro.Array.prototype.concat = function () {
  var res, rightProArray;

  if (arguments.length === 1 && Pro.Utils.isProArray(arguments[0])) {
    rightProArray = arguments[0];
    arguments[0] = rightProArray._array;
  }

  res = new Pro.Array(concat.apply(this._array, arguments));
  if (rightProArray) {
    this.addListener(Pro.Array.Listeners.leftConcat(res, this, rightProArray));
    rightProArray.addListener(Pro.Array.Listeners.rightConcat(res, this, rightProArray));
  } else {
    this.addListener(Pro.Array.Listeners.leftConcat(res, this, slice.call(arguments, 0)));
  }

  return res;
};

Pro.Array.prototype.every = function () {
  this.addIndexCaller();
  this.addLengthCaller();

  return every.apply(this._array, arguments);
};

Pro.Array.prototype.pevery = function (fun, thisArg) {
  var val = new Pro.Val(every.apply(this._array, arguments));

  this.addListener(Pro.Array.Listeners.every(val, this, arguments));

  return val;
};

// TODO psome
Pro.Array.prototype.some = function () {
  this.addIndexCaller();
  this.addLengthCaller();

  return some.apply(this._array, arguments);
};

Pro.Array.prototype.forEach = function (fun /*, thisArg */) {
  this.addIndexCaller();
  this.addLengthCaller();

  return forEach.apply(this._array, arguments);
};

Pro.Array.prototype.filter = function (fun, thisArg) {
  var filtered = new Pro.Array(filter.apply(this._array, arguments));
  this.addListener(Pro.Array.Listeners.filter(filtered, this, arguments));

  return filtered;
};

Pro.Array.prototype.map = function (fun, thisArg) {
  var mapped = new Pro.Array(map.apply(this._array, arguments));
  this.addListener(Pro.Array.Listeners.map(mapped, this, arguments));

  return mapped;
};

Pro.Array.prototype.reduce = function (fun /*, initialValue */) {
  this.addIndexCaller();
  this.addLengthCaller();

  return reduce.apply(this._array, arguments);
};

Pro.Array.prototype.preduce = function (fun /*, initialValue */) {
  var _this = this, args = arguments,
      val = new Pro.Val(reduce.apply(this._array, args)), oldLn = this._array.length;

  this.addListener(function (event) {
    if (event.type !== Pro.Event.Types.array) {
      throw Error('Not implemented for non array events');
    }
    var op  = event.args[0],
        ind = event.args[1],
        ov  = event.args[2],
        nv  = event.args[3],
        nvs;
    if ((op === Pro.Array.Operations.add && ind !== 0) ||
       (op === Pro.Array.Operations.splice && ind >= oldLn && ov.length === 0)) {
      nvs = slice.call(nv, 0);
      val.v = reduce.apply(nvs, [fun, val.valueOf()]);
    } else {
      val.v = reduce.apply(_this._array, args);
    }
    oldLn = _this._array.length;
  });

  return val;
};

Pro.Array.prototype.reduceRight = function (fun /*, initialValue */) {
  this.addIndexCaller();
  this.addLengthCaller();

  return reduceRight.apply(this._array, arguments);
};

Pro.Array.prototype.preduceRight = function (fun /*, initialValue */) {
  var _this = this, args = arguments,
      val = new Pro.Val(reduceRight.apply(this._array, args));

  this.addListener(function (event) {
    if (event.type !== Pro.Event.Types.array) {
      throw Error('Not implemented for non array events');
    }
    var op  = event.args[0],
        ind = event.args[1],
        ov  = event.args[2],
        nv  = event.args[3],
        nvs;
    if ((op === Pro.Array.Operations.add && ind === 0) ||
       (op === Pro.Array.Operations.splice && ind === 0 && ov.length === 0)) {
      nvs = slice.call(nv, 0);
      val.v = reduceRight.apply(nvs, [fun, val.valueOf()]);
    } else {
      val.v = reduceRight.apply(_this._array, args);
    }
  });

  return val;
};

// TODO pindexof
Pro.Array.prototype.indexOf = function () {
  this.addIndexCaller();
  this.addLengthCaller();

  return indexOf.apply(this._array, arguments);
};

// TODO plastindexof
Pro.Array.prototype.lastIndexOf = function () {
  this.addIndexCaller();
  this.addLengthCaller();

  return lastIndexOf.apply(this._array, arguments);
};

// TODO pjoin use preduce!
Pro.Array.prototype.join = function () {
  this.addIndexCaller();
  this.addLengthCaller();

  return join.apply(this._array, arguments);
};

// TODO ptoLocaleString
Pro.Array.prototype.toLocaleString = function () {
  this.addIndexCaller();
  this.addLengthCaller();

  return toLocaleString.apply(this._array, arguments);
};

// TODO ptoString
Pro.Array.prototype.toString = function () {
  this.addIndexCaller();
  this.addLengthCaller();

  return toString.apply(this._array, arguments);
};

Pro.Array.prototype.valueOf = function () {
  return this.toArray();
};

// TODO reactivate
Pro.Array.prototype.slice = function () {
  this.addIndexCaller();
  this.addLengthCaller();

  return new Pro.Array(slice.apply(this._array, arguments));
};

Pro.Array.prototype.reverse = function () {
  if (this._array.length === 0) {
    return;
  }
  var reversed = reverse.apply(this._array, arguments), _this = this;

  Pro.flow.run(function () {
    _this.willUpdate(Pro.Array.Operations.reverse, -1, null, null);
  });
  return reversed;
};

Pro.Array.prototype.sort = function () {
  if (this._array.length === 0) {
    return;
  }
  var sorted = sort.apply(this._array, arguments), _this = this,
      args = arguments;

  Pro.flow.run(function () {
    _this.willUpdate(Pro.Array.Operations.sort, -1, null, args);
  });
  return sorted;
};

// TODO think if it can be reactivated... maybe not.
Pro.Array.prototype.splice = function (index, howMany) {
  var oldLn = this._array.length,
      spliced = splice.apply(this._array, arguments),
      ln = this._array.length, delta,
      _this = this, newItems = slice.call(arguments, 2);

  index = !~index ? ln - index : index
  howMany = (howMany == null ? ln - index : howMany) || 0;

  if (newItems.length > howMany) {
    delta = newItems.length - howMany;
    while (delta--) {
      this.defineIndexProp(oldLn++);
    }
  } else if (howMany > newItems.length) {
    delta = howMany - newItems.length;
    while (delta--) {
      delete this[--oldLn];
    }
  }

  Pro.flow.run(function () {
    _this.willUpdateSplice(index, spliced, newItems);
  });
  return new Pro.Array(spliced);
};

Pro.Array.prototype.pop = function () {
  if (this._array.length === 0) {
    return;
  }
  var popped = pop.apply(this._array, arguments),
      _this = this, index = this._array.length;

  delete this[index];
  Pro.flow.run(function () {
    _this.willUpdate(Pro.Array.Operations.remove, _this._array.length, popped, null);
  });

  return popped;
};

Pro.Array.prototype.push = function () {
  var vals = arguments, i, ln = arguments.length, index,
      _this = this;

  for (i = 0; i < ln; i++) {
    index = this._array.length;
    push.call(this._array, arguments[i]);
    this.defineIndexProp(index);
  }

  Pro.flow.run(function () {
    _this.willUpdate(Pro.Array.Operations.add, _this._array.length - 1, null, slice.call(vals, 0));
  });

  return this._array.length;
};

Pro.Array.prototype.shift = function () {
  if (this._array.length === 0) {
    return;
  }
  var shifted = shift.apply(this._array, arguments),
      _this = this, index = this._array.length;

  delete this[index];
  Pro.flow.run(function () {
    _this.willUpdate(Pro.Array.Operations.remove, 0, shifted, null);
  });

  return shifted;
};

Pro.Array.prototype.unshift = function () {
  var vals = slice.call(arguments, 0), i, ln = arguments.length,
      array = this._array,
      _this = this;
  for (var i = 0; i < ln; i++) {
    array.splice(i, 0, arguments[i]);
    this.defineIndexProp(array.length - 1);
  }

  Pro.flow.run(function () {
    _this.willUpdate(Pro.Array.Operations.add, 0, null, vals);
  });

  return array.length;
};

Pro.Array.prototype.toArray = function () {
  var result = [], i, ar = this._array, ln = ar.length, el,
      isPA = Pro.Utils.isProArray;

  for (i = 0; i < ln; i++) {
    el = ar[i];
    if (isPA(el)) {
      el = el.toArray();
    }

    result.push(el);
  }

  return result;
};

// TODO reactivate
Pro.Array.prototype.toJSON = function () {
  return JSON.stringify(this._array);
};
