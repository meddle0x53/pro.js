;(function (pro) {
	window.Pro = pro();
}(function() {
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
	
	Pro.Utils.isArray = function (property) {
	  return typeof(property) === 'object' && Object.prototype.toString.call(property) === '[object Array]';
	};
	
	Pro.Utils.isProArray = function (property) {
	  return typeof(property) === 'object' && Pro.Utils.isArray(property._array) && property.length !== undefined;
	};
	
	Pro.Utils.isArrayObject = function (property) {
	  return Pro.Utils.isArray(property) || Pro.Utils.isProArray(property);
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
	
	Pro.Configuration = {
	  keyprops: true,
	  keypropList: ['p']
	};
	
	Pro.currentCaller = null;
	
	Pro.Queue = function (name, options) {
	  this.name = name || 'proq';
	  this.options = options || {};
	
	  this._queue = [];
	};
	
	Pro.Queue.prototype = {};
	
	Pro.Queue.prototype.length = function () {
	  return this._queue.length / 4;
	};
	
	Pro.Queue.prototype.isEmpty = function () {
	  return this.length() === 0;
	};
	
	Pro.Queue.prototype.push = function (obj, method, args) {
	  if (obj && Pro.Utils.isFunction(obj)) {
	    args = method;
	    method = obj;
	    obj = null;
	  }
	
	  this._queue.push(obj, method, args, 1);
	};
	
	Pro.Queue.prototype.pushOnce = function (obj, method, args) {
	  if (obj && Pro.Utils.isFunction(obj)) {
	    args = method;
	    method = obj;
	    obj = null;
	  }
	
	  var queue = this._queue, current, currentMethod,
	      i, length = queue.length;
	
	  for (i = 0; i < length; i += 4) {
	    current = queue[i];
	    currentMethod = queue[i + 1];
	
	    if (current === obj && currentMethod === method) {
	      queue[i + 2] = args;
	      queue[i + 3] = queue[i + 3] + 1;
	      return;
	    }
	  }
	
	  this.push(obj, method, args);
	};
	
	Pro.Queue.prototype.go = function (once) {
	  var queue = this._queue,
	      options = this.options,
	      length = queue.length,
	      before = options && options.before,
	      after = options && options.after,
	      err = options && options.err,
	      i, l = length, going = true, priority = 1,
	      tl = l,
	      obj, method, args, prio;
	
	
	  if (length && before) {
	    before(this);
	  }
	
	  while (going) {
	    going = false;
	    l = tl;
	    for (i = 0; i < l; i += 4) {
	      obj = queue[i];
	      method = queue[i + 1];
	      args = queue[i + 2];
	      prio = queue[i + 3];
	
	      if (prio === priority) {
	        if (args && args.length > 0) {
	          if (err) {
	            try {
	              method.apply(obj, args);
	            } catch (e) {
	              err(this, e);
	            }
	          } else {
	            method.apply(obj, args);
	          }
	        } else {
	          if (err) {
	            try {
	              method.call(obj);
	            } catch(e) {
	              err(e);
	            }
	          } else {
	            method.call(obj);
	          }
	        }
	      } else if (prio > priority) {
	        going = true;
	        tl = i + 4;
	      }
	    }
	    priority = priority + 1;
	  }
	
	  if (length && after) {
	    after(this);
	  }
	
	  if (queue.length > length) {
	    this._queue = queue.slice(length);
	
	    if (!once) {
	      this.go();
	    }
	  } else {
	    this._queue.length = 0;
	  }
	
	};
	
	Pro.Queues = function (queueNames, options) {
	  if (!queueNames) {
	    queueNames = ['proq'];
	  }
	
	  this.queueNames = queueNames;
	  this.options = options || {};
	
	  this._queues = {};
	
	  var i, length = this.queueNames.length;
	  for (i = 0; i < length; i++) {
	    this._queues[this.queueNames[i]] = new Pro.Queue(this.queueNames[i], this.options.queue);
	  }
	};
	
	Pro.Queues.prototype = {};
	
	Pro.Queues.prototype.isEmpty = function () {
	  var queues = this._queues,
	      names = this.queueNames,
	      length = names.length,
	      i, currentQueueName, currentQueue;
	
	  for (i = 0; i < length; i++) {
	    currentQueueName = names[i];
	    currentQueue = queues[currentQueueName];
	
	    if (!currentQueue.isEmpty()) {
	      return false;
	    }
	  }
	
	  return true;
	};
	
	Pro.Queues.prototype.push = function (queueName, obj, method, args) {
	  if (queueName && !Pro.Utils.isString(queueName)) {
	    args = method;
	    method = obj;
	    obj = queueName;
	    queueName = this.queueNames[0];
	  }
	  if (!queueName) {
	    queueName = this.queueNames[0];
	  }
	
	  var queue = this._queues[queueName];
	  if (queue) {
	    queue.push(obj, method, args);
	  }
	};
	
	Pro.Queues.prototype.pushOnce = function (queueName, obj, method, args) {
	  if (queueName && !Pro.Utils.isString(queueName)) {
	    args = method;
	    method = obj;
	    obj = queueName;
	    queueName = this.queueNames[0];
	  }
	  if (!queueName) {
	    queueName = this.queueNames[0];
	  }
	
	  var queue = this._queues[queueName];
	  if (queue) {
	    queue.pushOnce(obj, method, args);
	  }
	};
	
	Pro.Queues.prototype.go = function (queueName) {
	  var currentQueueIndex = 0,
	      queues = this._queues,
	      names = this.queueNames,
	      i, length = this.queueNames.length,
	      currentQueueName, currentQueue,
	      prevQueueIndex;
	
	  if (queueName) {
	    for (i = 0; i < length; i++) {
	      if (names[i] === queueName) {
	        currentQueueIndex = i;
	      }
	    }
	  }
	
	  goloop:
	  while (currentQueueIndex < length) {
	    currentQueueName = names[currentQueueIndex];
	    currentQueue = queues[currentQueueName];
	
	    currentQueue.go(true);
	
	    if ((prevQueueIndex = this.probePrevIndex(currentQueueIndex)) !== -1) {
	      currentQueueIndex = prevQueueIndex;
	      continue goloop;
	    }
	
	    currentQueueIndex = currentQueueIndex + 1;
	  }
	
	};
	
	Pro.Queues.prototype.probePrevIndex = function (startIndex) {
	  var queues = this._queues,
	      names = this.queueNames,
	      i, currentQueueName, currentQueue;
	
	  for (i = 0; i <= startIndex; i++) {
	    currentQueueName = names[i];
	    currentQueue = queues[currentQueueName];
	
	    if (!currentQueue.isEmpty()) {
	      return i;
	    }
	  }
	
	  return -1;
	};
	
	Pro.Flow = function (queueNames, options) {
	  if (!queueNames) {
	    queueNames = ['proq'];
	  }
	
	  this.queueNames = queueNames;
	  this.options = options || {};
	
	  this.flowInstance = null;
	};
	
	Pro.Flow.prototype = {};
	
	Pro.Flow.prototype.start = function () {
	  var queues = this.flowInstance,
	      options = this.options,
	      start = options && options.start,
	      queueNames = this.queueNames;
	
	  if (!queues) {
	    queues = this.flowInstance = new Pro.Queues(queueNames, options.flowInstance);
	    if (start) {
	      start(queues);
	    }
	  }
	};
	
	Pro.Flow.prototype.end = function () {
	  var queues = this.flowInstance,
	      options = this.options,
	      end = options && options.end;
	
	  if (queues) {
	    try {
	      queues.go();
	    } finally {
	      this.flowInstance = null;
	
	      if (end) {
	        end(queues);
	      }
	    }
	  }
	};
	
	Pro.Flow.prototype.run = function (obj, method) {
	  var options = this.options,
	      onError = options.onError;
	
	  if (this.isRunning()) {
	    return;
	  }
	
	  this.start();
	  if (!method) {
	    method = obj;
	    obj = null;
	  }
	
	  try {
	    if (onError) {
	      try {
	        method.call(obj);
	      } catch (e) {
	        onError(e);
	      }
	    } else {
	      method.call(obj);
	    }
	  } finally {
	    this.end();
	  }
	};
	
	Pro.Flow.prototype.isRunning = function () {
	  return this.flowInstance !== null && this.flowInstance !== undefined;
	};
	
	Pro.Flow.prototype.push = function (queueName, obj, method, args) {
	  if (!this.flowInstance) {
	    throw new Error('Not in running flow!');
	  }
	
	  this.flowInstance.push(queueName, obj, method, args);
	};
	
	Pro.Flow.prototype.pushOnce = function (queueName, obj, method, args) {
	  if (!this.flowInstance) {
	    throw new Error('Not in running flow!');
	  }
	
	  this.flowInstance.pushOnce(queueName, obj, method, args);
	};
	
	Pro.flow = new Pro.Flow(['proq']);
	
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
	
	Pro.Array.prototype.defineIndexProp = function (i) {
	  var proArray = this,
	      array = proArray._array,
	      oldVal;
	
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
	  var length = listeners.length, i, listener;
	
	  for (i = 0; i < length; i++) {
	    listener = listeners[i];
	
	    if (Pro.Utils.isFunction(listener)) {
	      Pro.flow.pushOnce(listener, [op, ind, oldVal, newVal]);
	    } else {
	      Pro.flow.pushOnce(listener, listener.call, [op, ind, oldVal, newVal]);
	    }
	
	    if (listener.property) {
	      listener.property.willUpdate();
	    }
	  }
	};
	
	Pro.Array.prototype.concat = function () {
	  this.addIndexCaller();
	  this.addLengthCaller();
	
	  return new Pro.Array(concat.apply(this._array, arguments));
	};
	
	Pro.Array.prototype.every = function () {
	  this.addIndexCaller();
	  this.addLengthCaller();
	
	  return every.apply(this._array, arguments);
	};
	
	Pro.Array.prototype.some = function () {
	  this.addIndexCaller();
	  this.addLengthCaller();
	
	  return some.apply(this._array, arguments);
	};
	
	Pro.Array.prototype.filter = function () {
	  this.addIndexCaller();
	  this.addLengthCaller();
	
	  return new Pro.Array(filter.apply(this._array, arguments));
	};
	
	Pro.Array.prototype.forEach = function (fun /*, thisArg */) {
	  this.addIndexCaller();
	  this.addLengthCaller();
	
	  return forEach.apply(this._array, arguments);
	};
	
	Pro.Array.prototype.map = function (fun /*, thisArg */) {
	  this.addIndexCaller();
	  this.addLengthCaller();
	
	  return new Pro.Array(map.apply(this._array, arguments));
	};
	
	Pro.Array.prototype.reduce = function (fun /*, initialValue */) {
	  this.addIndexCaller();
	  this.addLengthCaller();
	
	  return reduce.apply(this._array, arguments);
	};
	
	Pro.Array.prototype.reduceRight = function (fun /*, initialValue */) {
	  this.addIndexCaller();
	  this.addLengthCaller();
	
	  return reduceRight.apply(this._array, arguments);
	};
	
	Pro.Array.prototype.indexOf = function () {
	  this.addIndexCaller();
	  this.addLengthCaller();
	
	  return indexOf.apply(this._array, arguments);
	};
	
	Pro.Array.prototype.lastIndexOf = function () {
	  this.addIndexCaller();
	  this.addLengthCaller();
	
	  return lastIndexOf.apply(this._array, arguments);
	};
	
	Pro.Array.prototype.join = function () {
	  this.addIndexCaller();
	  this.addLengthCaller();
	
	  return join.apply(this._array, arguments);
	};
	
	Pro.Array.prototype.toLocaleString = function () {
	  this.addIndexCaller();
	  this.addLengthCaller();
	
	  return toLocaleString.apply(this._array, arguments);
	};
	
	Pro.Array.prototype.toString = function () {
	  this.addIndexCaller();
	  this.addLengthCaller();
	
	  return toString.apply(this._array, arguments);
	};
	
	Pro.Array.prototype.valueOf = function () {
	  return this.toArray();
	};
	
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
	  var sorted = sort.apply(this._array, arguments), _this = this;
	
	  Pro.flow.run(function () {
	    _this.willUpdate(Pro.Array.Operations.sort, -1, null, null);
	  });
	  return sorted;
	};
	
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
	    _this.willUpdate(Pro.Array.Operations.add, _this._array.length - 1, null, vals);
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
	  var vals = arguments, i, ln = arguments.length,
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
	  return this._array;
	};
	
	Pro.Array.prototype.toJSON = function () {
	  return JSON1.stringify(this._array);
	};
	
	Pro.Property = function (proObject, property, getter, setter) {
	  var _this = this;
	
	  this.proObject = proObject;
	  this.property = property;
	
	  if (!this.proObject['__pro__']) {
	    this.proObject['__pro__'] = {};
	  }
	  this.proObject['__pro__'].properties = this.proObject['__pro__'].properties || {};
	  this.proObject['__pro__'].properties[property] = this;
	
	  this.get = getter || Pro.Property.DEFAULT_GETTER(this);
	  this.set = setter || Pro.Property.DEFAULT_SETTER(this);
	
	  this.oldVal = null;
	  this.val = proObject[property];
	  this.listeners = [];
	
	  this.state = Pro.States.init;
	  this.g = this.get;
	  this.s = this.set;
	
	  this.init();
	};
	
	Pro.Property.Types = {
	  simple: 0, // strings, booleans and numbers
	  auto: 1, // functions - dependent
	  object: 2, // references Pro objects
	  array: 3 // arrays
	};
	
	Pro.Property.DEFAULT_GETTER = function (property) {
	  return function () {
	    property.addCaller();
	
	    return property.val;
	  };
	};
	
	Pro.Property.DEFAULT_SETTER = function (property) {
	  return function (newVal) {
	    if (property.val === newVal) {
	      return;
	    }
	
	    property.oldVal = property.val;
	    property.val = newVal;
	
	    Pro.flow.run(function () {
	      property.willUpdate();
	    });
	  };
	};
	
	Pro.Property.defineProp = function (obj, prop, get, set) {
	  Object.defineProperty(obj, prop, {
	    get: get,
	    set: set,
	    enumerable: true,
	    configurable: true
	  });
	};
	
	Pro.Property.prototype.type = function () {
	  return Pro.Property.Types.simple;
	};
	
	Pro.Property.prototype.init = function () {
	  if (this.state !== Pro.States.init) {
	    return;
	  }
	
	  Pro.Property.defineProp(this.proObject, this.property, this.get, this.set);
	
	  this.afterInit();
	};
	
	Pro.Property.prototype.afterInit = function () {
	  this.state = Pro.States.ready;
	};
	
	Pro.Property.prototype.addCaller = function () {
	  var _this = this,
	      caller = Pro.currentCaller;
	
	  if (caller && caller.property.property != this.property) {
	    this.addListener(caller);
	  }
	};
	
	Pro.Property.prototype.destroy = function () {
	  if (this.state === Pro.States.destroyed) {
	    return;
	  }
	
	  delete this.proObject['__pro__'].properties[this.property];
	  this.listeners = undefined;
	  this.oldVal = undefined;
	
	  Object.defineProperty(this.proObject, this.property, {
	    value: this.val,
	    enumerable: true,
	    configurable: true
	  });
	  this.get = this.set = this.property = this.proObject = undefined;
	  this.g = this.s = undefined;
	  this.val = undefined;
	  this.state = Pro.States.destroyed;
	};
	
	Pro.Property.prototype.addListener = function (listener) {
	  this.listeners.push(listener);
	};
	
	Pro.Property.prototype.removeListener = function (listener) {
	  var i;
	  for (i = 0; i < this.listeners.length; i++) {
	    if (this.listeners[i] == listener) {
	      this.listeners.splice(i, 1);
	      break;
	    }
	  }
	};
	
	Pro.Property.prototype.notifyAll = function () {
	  var i;
	  for (i = 0; i < this.listeners.length; i++) {
	    this.listeners[i].call(this.proObject);
	  }
	};
	
	Pro.Property.prototype.willUpdate = function () {
	  var i, listener,
	      listeners = this.listeners,
	      length = listeners.length;
	  for (i = 0; i < length; i++) {
	    listener = listeners[i];
	
	    if (Pro.Utils.isFunction(listener)) {
	      Pro.flow.pushOnce(listener);
	    } else {
	      Pro.flow.pushOnce(listener, listener.call);
	    }
	
	    if (listener.property) {
	      listener.property.willUpdate();
	    }
	  }
	};
	
	Pro.AutoProperty = function (proObject, property) {
	  this.func = proObject[property];
	
	  var _this = this,
	      getter = function () {
	    _this.addCaller();
	    var oldCaller = Pro.currentCaller,
	        get = Pro.Property.DEFAULT_GETTER(_this),
	        set = Pro.Property.DEFAULT_SETTER(_this);
	
	    Pro.currentCaller = {
	      property: _this,
	      call: function () {
	        proObject[property] = _this.func.call(proObject);
	      }
	    };
	    _this.val = _this.func.apply(_this.proObject, arguments);
	    Pro.currentCaller = oldCaller;
	
	    Pro.Property.defineProp(_this.proObject, _this.property, get, set);
	
	    _this.state = Pro.States.ready;
	    return _this.val;
	  };
	
	  Pro.Property.call(this, proObject, property, getter, function () {});
	};
	
	Pro.AutoProperty.prototype = Object.create(Pro.Property.prototype);;
	Pro.AutoProperty.prototype.constructor = Pro.AutoProperty;
	
	Pro.AutoProperty.prototype.type = function () {
	  return Pro.Property.Types.auto;
	};
	
	Pro.AutoProperty.prototype.afterInit = function () {};
	
	Pro.ObjectProperty = function (proObject, property) {
	  var _this = this, getter;
	
	  getter = function () {
	    _this.addCaller();
	    if (!_this.val.__pro__) {
	      Pro.prob(_this.val);
	    }
	
	    var get = Pro.Property.DEFAULT_GETTER(_this),
	        set = function (newVal) {
	          if (_this.val == newVal) {
	            return;
	          }
	
	          _this.oldVal = _this.val;
	          _this.val = newVal;
	
	          if (_this.oldVal) {
	            if (!_this.val.__pro__) {
	              Pro.prob(_this.val);
	            }
	
	            var oldProps = _this.oldVal.__pro__.properties,
	                newProps = _this.val.__pro__.properties,
	                oldPropName, oldProp, newProp, oldListeners, newListeners,
	                i, j, oldListenersLength, newListenersLength,
	                toAdd, toRemove = [], toRemoveLength;
	
	            for (oldPropName in oldProps) {
	              if (oldProps.hasOwnProperty(oldPropName)) {
	                newProp = newProps[oldPropName];
	                newListeners = newProp.listeners;
	
	                oldProp = oldProps[oldPropName];
	                oldListeners = oldProp.listeners;
	                oldListenersLength = oldListeners.length;
	
	                for (i = 0; i < oldListenersLength; i++) {
	                  toAdd = true;
	                  for (j = 0; j < newListenersLength; j++) {
	                    if (oldListeners[i] == newListeners[j]) {
	                      toAdd = false;
	                    }
	                  }
	                  if (toAdd) {
	                    newProp.addListener(oldListeners[i]);
	                    toRemove.push(i);
	                  }
	                }
	
	                toRemoveLength = toRemove.length;
	                for (i = 0; i < toRemoveLength; i++) {
	                  oldListeners.splice[toRemove[i], 1];
	                }
	                toRemove = [];
	              }
	            }
	          }
	
	          Pro.flow.run(function () {
	            _this.willUpdate();
	          });
	        };
	
	    Pro.Property.defineProp(_this.proObject, _this.property, get, set);
	
	    _this.state = Pro.States.ready;
	    return _this.val;
	  };
	
	  Pro.Property.call(this, proObject, property, getter, function () {});
	};
	
	
	Pro.ObjectProperty.prototype = Object.create(Pro.Property.prototype);;
	Pro.ObjectProperty.prototype.constructor = Pro.ObjectProperty;
	
	Pro.ObjectProperty.prototype.type = function () {
	  return Pro.Property.Types.object;
	};
	
	Pro.ObjectProperty.prototype.afterInit = function () {};
	
	Pro.ArrayProperty = function (proObject, property) {
	  var _this = this, getter;
	
	  getter = function () {
	    _this.addCaller();
	    if (!Pro.Utils.isProArray(_this.val)) {
	      _this.val = new Pro.Array(_this.val);
	    }
	
	    var get = Pro.Property.DEFAULT_GETTER(_this),
	        set = function (newVal) {
	          if (_this.val == newVal || _this.val.valueOf() == newVal) {
	            return;
	          }
	
	          _this.oldVal = _this.val;
	          _this.val = newVal;
	
	          if (!Pro.Utils.isProArray(_this.val)) {
	            _this.val = new Pro.Array(_this.val);
	          }
	
	          if (_this.oldVal) {
	            var i, listener,
	                toRemove = [], toRemoveLength,
	                oldIndListeners = _this.oldVal.indexListeners,
	                oldIndListenersLn = oldIndListeners.length,
	                newIndListeners = _this.val.indexListeners,
	                oldLenListeners = _this.oldVal.lengthListeners,
	                oldLenListenersLn = oldLenListeners.length,
	                newLenListeners = _this.val.lengthListeners;
	
	            for (i = 0; i < oldIndListenersLn; i++) {
	              listener = oldIndListeners[i];
	              if (listener.property && listener.property.proObject === _this.proObject) {
	                newIndListeners.push(listener);
	                toRemove.push(i);
	              }
	            }
	            toRemoveLength = toRemove.length;
	            for (i = 0; i < toRemoveLength; i++) {
	              oldIndListeners.splice[toRemove[i], 1];
	            }
	            toRemove = [];
	
	            for (i = 0; i < oldLenListenersLn; i++) {
	              listener = oldLenListeners[i];
	              if (listener.property && listener.property.proObject === _this.proObject) {
	                newLenListeners.push(listener);
	                toRemove.push(i);
	              }
	            }
	            toRemoveLength = toRemove.length;
	            for (i = 0; i < toRemoveLength; i++) {
	              oldLenListeners.splice[toRemove[i], 1];
	            }
	            toRemove = [];
	          }
	
	          Pro.flow.run(function () {
	            _this.willUpdate();
	          });
	        };
	
	    Pro.Property.defineProp(_this.proObject, _this.property, get, set);
	
	    _this.state = Pro.States.ready;
	    return _this.val;
	  };
	
	  Pro.Property.call(this, proObject, property, getter, function () {});
	};
	
	Pro.ArrayProperty.prototype = Object.create(Pro.Property.prototype);
	Pro.ArrayProperty.prototype.constructor = Pro.ArrayProperty;
	
	Pro.ArrayProperty.prototype.type = function () {
	  return Pro.Property.Types.array;
	};
	
	Pro.ArrayProperty.prototype.afterInit = function () {};
	
	Pro.prob = function (object, meta) {
	  if (!object) {
	    throw Error('Pro objects should not be empty or null!');
	    return undefined;
	  }
	
	  try {
	    Object.defineProperty(object, '__pro__', {
	      enumerable: false,
	      configurable: false,
	      writeble: false,
	      value: {}
	    });
	
	    object.__pro__.state = Pro.States.init;
	
	    var property,
	        conf = Pro.Configuration,
	        keyprops = conf.keyprops,
	        keypropList = conf.keypropList
	        isF = Pro.Utils.isFunction,
	        isA = Pro.Utils.isArrayObject;
	
	    for (property in object) {
	      if (keyprops && keypropList.indexOf(property) !== -1) {
	        throw Error('The property name ' + property + ' is a key word for pro objects! Objects passed to Pro.prob can not contain properties named as keyword properties.');
	        break;
	      }
	
	      if (object.hasOwnProperty(property) && !isF(object[property]) && !isA(object[property])) {
	        new Pro.Property(object, property);
	      } else if (object.hasOwnProperty(property) && isF(object[property])) {
	        new Pro.AutoProperty(object, property);
	      } else if (object.hasOwnProperty(property) && isA(object[property])) {
	        new Pro.ArrayProperty(object, property);
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
	
	return Pro;
}));