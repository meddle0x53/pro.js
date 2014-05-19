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
	  return Pro.Utils.isObject(property) && property.__pro__ !== undefined && Pro.Utils.isObject(property.__pro__.properties);
	};
	
	Pro.Utils.isProVal = function (property) {
	  return this.isProObject(property) && property.__pro__.properties.v !== undefined;
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
	  this.flowInstances = [];
	};
	
	Pro.Flow.prototype = {};
	
	Pro.Flow.prototype.start = function () {
	  var queues = this.flowInstance,
	      options = this.options,
	      start = options && options.start,
	      queueNames = this.queueNames;
	
	  if (queues) {
	    this.flowInstances.push(queues);
	  }
	
	  this.flowInstance = new Pro.Queues(queueNames, options.flowInstance);
	  if (start) {
	    start(this.flowInstance);
	  }
	};
	
	Pro.Flow.prototype.end = function () {
	  var queues = this.flowInstance,
	      options = this.options,
	      end = options && options.end,
	      nextQueues;
	
	  if (queues) {
	    try {
	      queues.go();
	    } finally {
	      this.flowInstance = null;
	
	      if (this.flowInstances.length) {
	        nextQueues = this.flowInstances.pop();
	        this.flowInstance = nextQueues;
	      }
	
	      if (end) {
	        end(queues);
	      }
	    }
	  }
	};
	
	Pro.Flow.prototype.run = function (obj, method) {
	  var options = this.options,
	      onError = options.onError;
	
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
	
	Pro.Event = function (source, target, type) {
	  this.source = source;
	  this.target = target;
	  this.type = type;
	  this.args = slice.call(arguments, 3);
	};
	
	Pro.Event.Types = {
	  value: 0,
	  array: 1
	};
	
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
	
	Pro.Array.prototype.some = function () {
	  this.addIndexCaller();
	  this.addLengthCaller();
	
	  return some.apply(this._array, arguments);
	};
	
	Pro.Array.prototype.psome = function (fun, thisArg) {
	  var val = new Pro.Val(some.apply(this._array, arguments));
	
	  this.addListener(Pro.Array.Listeners.some(val, this, arguments));
	
	  return val;
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
	  var val = new Pro.Val(reduce.apply(this._array, arguments));
	  this.addListener(Pro.Array.Listeners.reduce(val, this, arguments));
	
	  return val;
	};
	
	Pro.Array.prototype.reduceRight = function (fun /*, initialValue */) {
	  this.addIndexCaller();
	  this.addLengthCaller();
	
	  return reduceRight.apply(this._array, arguments);
	};
	
	Pro.Array.prototype.preduceRight = function (fun /*, initialValue */) {
	  var val = new Pro.Val(reduceRight.apply(this._array, arguments));
	  this.addListener(Pro.Array.Listeners.reduceRight(val, this, arguments));
	
	  return val;
	};
	
	Pro.Array.prototype.indexOf = function () {
	  this.addIndexCaller();
	  this.addLengthCaller();
	
	  return indexOf.apply(this._array, arguments);
	};
	
	Pro.Array.prototype.pindexOf = function () {
	  var val = new Pro.Val(indexOf.apply(this._array, arguments));
	  this.addListener(Pro.Array.Listeners.indexOf(val, this, arguments));
	
	  return val;
	};
	
	Pro.Array.prototype.lastIndexOf = function () {
	  this.addIndexCaller();
	  this.addLengthCaller();
	
	  return lastIndexOf.apply(this._array, arguments);
	};
	
	Pro.Array.prototype.plastindexOf = function () {
	  var val = new Pro.Val(lastIndexOf.apply(this._array, arguments));
	  this.addListener(Pro.Array.Listeners.lastIndexOf(val, this, arguments));
	
	  return val;
	};
	
	Pro.Array.prototype.join = function () {
	  this.addIndexCaller();
	  this.addLengthCaller();
	
	  return join.apply(this._array, arguments);
	};
	
	Pro.Array.prototype.pjoin = function (separator) {
	  var reduced = this.preduce(function (i, el) {
	    return i + separator + el;
	  }, ''), res = new Pro.Val(function () {
	    if (!reduced.v) {
	      return '';
	    }
	    return reduced.v.substring(1);
	  });
	  return res;
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
	  var sliced = new Pro.Array(slice.apply(this._array, arguments));
	  this.addListener(Pro.Array.Listeners.slice(sliced, this, arguments));
	
	  return sliced;
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
	
	Pro.Array.prototype.toJSON = function () {
	  return JSON.stringify(this._array);
	};
	
	Pro.Array.Listeners = Pro.Array.Listeners || {};
	
	Pro.Array.Listeners.check = function(event) {
	  if (event.type !== Pro.Event.Types.array) {
	    throw Error('Not implemented for non array events');
	  }
	};
	
	Pro.Array.Listeners.leftConcat = function (transformed, original, args) {
	  return function (event) {
	    Pro.Array.Listeners.check(event);
	    var op    = event.args[0],
	        ind   = event.args[1],
	        ov    = event.args[2],
	        nv    = event.args[3],
	        argln = args.length,
	        nvs, toAdd;
	    if (op === Pro.Array.Operations.set) {
	      transformed[ind] = nv;
	    } else if (op === Pro.Array.Operations.add) {
	      nvs = slice.call(nv, 0);
	      if (ind === 0) {
	        Pro.Array.prototype.unshift.apply(transformed, nvs);
	      } else {
	        Pro.Array.prototype.splice.apply(transformed, [transformed._array.length - argln, 0].concat(nvs));
	      }
	    } else if (op === Pro.Array.Operations.remove) {
	      if (ind === 0) {
	        Pro.Array.prototype.shift.call(transformed, ov);
	      } else {
	        Pro.Array.prototype.splice.apply(transformed, [transformed._array.length - argln - 1, 1]);
	      }
	    } else if (op === Pro.Array.Operations.setLength) {
	      nvs = ov -nv;
	      if (nvs > 0) {
	        Pro.Array.prototype.splice.apply(transformed, [nv, nvs]);
	      } else {
	        toAdd = [ov, 0];
	        toAdd.length = 2 - nvs;
	        Pro.Array.prototype.splice.apply(transformed, toAdd);
	      }
	    } else if (op === Pro.Array.Operations.reverse || op === Pro.Array.Operations.sort) {
	      nvs = transformed._array;
	      if (Pro.Utils.isProArray(args)) {
	        toAdd = args._array;
	      } else {
	        toAdd = args;
	      }
	      transformed._array = concat.apply(original._array, toAdd);
	      transformed.updateByDiff(nvs);
	    } else if (op === Pro.Array.Operations.splice) {
	      Pro.Array.prototype.splice.apply(transformed, [ind, ov.length].concat(nv));
	    }
	  };
	};
	
	Pro.Array.Listeners.rightConcat = function (transformed, original, right) {
	  return function (event) {
	    Pro.Array.Listeners.check(event);
	    var op    = event.args[0],
	        ind   = event.args[1],
	        ov    = event.args[2],
	        nv    = event.args[3],
	        oln   = original._array.length,
	        nvs;
	    if (op === Pro.Array.Operations.set) {
	      transformed[oln + ind] = nv;
	    } else if (op === Pro.Array.Operations.add) {
	      if (ind === 0) {
	        Pro.Array.prototype.splice.apply(transformed, [oln, 0].concat(nv));
	      } else {
	        Pro.Array.prototype.push.apply(transformed, nv);
	      }
	    } else if (op === Pro.Array.Operations.remove) {
	      if (ind === 0) {
	        Pro.Array.prototype.splice.call(transformed, oln, 1);
	      } else {
	        Pro.Array.prototype.pop.call(transformed, ov);
	      }
	    } else if (op === Pro.Array.Operations.setLength) {
	      transformed.length = oln + nv;
	    } else if (op === Pro.Array.Operations.reverse || op === Pro.Array.Operations.sort) {
	      nvs = transformed._array;
	      transformed._array = concat.apply(original._array, right._array);
	      transformed.updateByDiff(nvs);
	    } else if (op === Pro.Array.Operations.splice) {
	      Pro.Array.prototype.splice.apply(transformed, [ind + oln, ov.length].concat(nv));
	    }
	  };
	};
	
	Pro.Array.Listeners.every = function (val, original, args) {
	  var fun = args[0], thisArg = args[1];
	  return function (event) {
	    Pro.Array.Listeners.check(event);
	    var op  = event.args[0],
	        ind = event.args[1],
	        ov  = event.args[2],
	        nv  = event.args[3],
	        ev;
	    if (op === Pro.Array.Operations.set) {
	      ev = fun.call(thisArg, nv);
	      if (val.valueOf() === true && !ev) {
	        val.v = false;
	      } else if (val.valueOf() === false && ev) {
	        val.v = every.apply(original._array, args);
	      }
	    } else if (op === Pro.Array.Operations.add) {
	      if (val.valueOf() === true) {
	        val.v = every.call(nv, fun, thisArg);
	      }
	    } else if (op === Pro.Array.Operations.remove) {
	      if (val.valueOf() === false && !fun.call(thisArg, ov)) {
	        val.v = every.apply(original._array, args);
	      }
	    } else if (op === Pro.Array.Operations.setLength) {
	      if (val.valueOf() === false) {
	        val.v = every.apply(original._array, args);
	      }
	    } else if (op === Pro.Array.Operations.splice) {
	      if (val.valueOf() === true) {
	        val.v = every.call(nv, fun, thisArg);
	      } else if (every.call(nv, fun, thisArg) && !every.call(ov, fun, thisArg)) {
	        val.v = every.apply(original._array, args);
	      }
	    }
	  };
	};
	
	Pro.Array.Listeners.some = function (val, original, args) {
	  var fun = args[0], thisArg = args[1];
	  return function (event) {
	    Pro.Array.Listeners.check(event);
	    var op  = event.args[0],
	        ind = event.args[1],
	        ov  = event.args[2],
	        nv  = event.args[3],
	        sv;
	    if (op === Pro.Array.Operations.set) {
	      sv = fun.call(thisArg, nv);
	      if (val.valueOf() === false && sv) {
	        val.v = true;
	      } else if (val.valueOf() === true && !sv) {
	        val.v = some.apply(original._array, args);
	      }
	    } else if (op === Pro.Array.Operations.add) {
	      if (val.valueOf() === false) {
	        val.v = some.call(nv, fun, thisArg);
	      }
	    } else if (op === Pro.Array.Operations.remove) {
	      if (val.valueOf() === true && fun.call(thisArg, ov)) {
	        val.v = some.apply(original._array, args);
	      }
	    } else if (op === Pro.Array.Operations.setLength) {
	      if (val.valueOf() === true) {
	        val.v = some.apply(original._array, args);
	      }
	    } else if (op === Pro.Array.Operations.splice) {
	      if (val.valueOf() === false) {
	        val.v = some.call(nv, fun, thisArg);
	      } else if (some.call(ov, fun, thisArg) && !some.call(nv, fun, thisArg)) {
	        val.v = some.apply(original._array, args);
	      }
	    }
	  };
	};
	
	Pro.Array.Listeners.filter = function (filtered, original, args) {
	  var fun = args[0], thisArg = args[1];
	  return function (event) {
	    Pro.Array.Listeners.check(event);
	    var op  = event.args[0],
	        ind = event.args[1],
	        ov  = event.args[2],
	        nv  = event.args[3],
	        napply, oapply, oarr,
	        nvs, fnvs, j, ln, diff;
	
	    if (op === Pro.Array.Operations.set) {
	      napply = fun.call(thisArg, nv);
	      oapply = fun.call(thisArg, ov);
	
	      if (oapply === true || napply === true) {
	        Pro.Array.reFilter(original, filtered, args);
	      }
	    } else if (op === Pro.Array.Operations.add) {
	      fnvs = [];
	      nvs = slice.call(nv, 0);
	      ln = nvs.length;
	      if (ind === 0) {
	        j = ln - 1;
	        while(j >= 0) {
	          if (fun.apply(thisArg, [nvs[j], j, original._array])) {
	            fnvs.unshift(nvs[j]);
	          }
	          j--;
	        }
	
	        if (fnvs.length) {
	          Pro.Array.prototype.unshift.apply(filtered, fnvs);
	        }
	      } else {
	        j = 0;
	        while(j < ln) {
	          if (fun.apply(thisArg, [nvs[j], original._array.length - (ln - j), original._array])) {
	            fnvs.push(nvs[j]);
	          }
	          j++;
	        }
	
	        if (fnvs.length) {
	          Pro.Array.prototype.push.apply(filtered, fnvs);
	        }
	      }
	    } else if (op === Pro.Array.Operations.remove) {
	      if (fun.apply(thisArg, [ov, ind, original._array])) {
	        if (ind === 0) {
	          filtered.shift();
	        } else {
	          filtered.pop();
	        }
	      }
	    } else if (op === Pro.Array.Operations.setLength) {
	      Pro.Array.reFilter(original, filtered, args);
	    } else if (op === Pro.Array.Operations.reverse) {
	      filtered.reverse();
	    } else if (op === Pro.Array.Operations.sort) {
	      Pro.Array.prototype.sort.apply(filtered, nv);
	    } else if (op === Pro.Array.Operations.splice) {
	      Pro.Array.reFilter(original, filtered, args);
	    }
	  };
	};
	
	Pro.Array.Listeners.map = function (mapped, original, args) {
	  var fun = args[0], thisArg = args[1];
	  return function (event) {
	    Pro.Array.Listeners.check(event);
	    var op  = event.args[0],
	        ind = event.args[1],
	        ov  = event.args[2],
	        nv  = event.args[3],
	        nvs, j, ln, mnvs;
	    if (op === Pro.Array.Operations.set) {
	      mapped[ind] = fun.call(thisArg, nv);
	    } else if (op === Pro.Array.Operations.add) {
	      mnvs = [];
	      nvs = slice.call(nv, 0);
	      ln = nvs.length;
	      if (ind === 0) {
	        j = ln - 1;
	        while(j >= 0) {
	          mnvs[j] = fun.apply(thisArg, [nvs[j], j, original._array]);
	          j--;
	        }
	
	        Pro.Array.prototype.unshift.apply(mapped, mnvs);
	      } else {
	        j = 0;
	        while(j < ln) {
	          mnvs[j] = fun.apply(thisArg, [nvs[j], original._array.length - (ln - j), original._array]);
	          j++;
	        }
	
	        Pro.Array.prototype.push.apply(mapped, mnvs);
	      }
	    } else if (op === Pro.Array.Operations.remove) {
	      if (ind === 0) {
	        mapped.shift();
	      } else {
	        mapped.pop();
	      }
	    } else if (op === Pro.Array.Operations.setLength) {
	      mapped.length = nv;
	    } else if (op === Pro.Array.Operations.reverse) {
	      mapped.reverse();
	    } else if (op === Pro.Array.Operations.sort) {
	      Pro.Array.prototype.sort.apply(mapped, nv);
	    } else if (op === Pro.Array.Operations.splice) {
	      mnvs = [];
	      j = 0;
	      while (j < nv.length) {
	        mnvs[j] = fun.apply(thisArg, [nv[j], (j + ind), original._array]);
	        j++;
	      }
	
	      Pro.Array.prototype.splice.apply(mapped, [
	        ind,
	        ov.length
	      ].concat(mnvs));
	    }
	  };
	};
	
	Pro.Array.Listeners.reduce = function (val, original, args) {
	  var oldLn = original._array.length, fun = args[0];
	  return function (event) {
	    Pro.Array.Listeners.check(event);
	    var op  = event.args[0],
	        ind = event.args[1],
	        ov  = event.args[2],
	        nv  = event.args[3];
	    if ((op === Pro.Array.Operations.add && ind !== 0) ||
	       (op === Pro.Array.Operations.splice && ind >= oldLn && ov.length === 0)) {
	      val.v = reduce.apply(nv, [fun, val.valueOf()]);
	    } else {
	      val.v = reduce.apply(original._array, args);
	    }
	    oldLn = original._array.length;
	  };
	};
	
	Pro.Array.Listeners.reduceRight = function (val, original, args) {
	  var fun = args[0];
	  return function (event) {
	    Pro.Array.Listeners.check(event);
	    var op  = event.args[0],
	        ind = event.args[1],
	        ov  = event.args[2],
	        nv  = event.args[3];
	    if ((op === Pro.Array.Operations.add && ind === 0) ||
	       (op === Pro.Array.Operations.splice && ind === 0 && ov.length === 0)) {
	      val.v = reduceRight.apply(nv, [fun, val.valueOf()]);
	    } else {
	      val.v = reduceRight.apply(original._array, args);
	    }
	  };
	};
	
	Pro.Array.Listeners.indexOf = function (val, original, args) {
	  var what = args[0], fromIndex = args[1], hasFrom = !!fromIndex;
	  return function (event) {
	    Pro.Array.Listeners.check(event);
	    var op  = event.args[0],
	        ind = event.args[1],
	        ov  = event.args[2],
	        nv  = event.args[3],
	        v = val.valueOf(),
	        nvi, i;
	
	    if (op === Pro.Array.Operations.set) {
	      if (ov === what) {
	        val.v = indexOf.apply(original._array, args);
	      } else if (nv === what && (ind < v || v === -1) && (!hasFrom || ind >= fromIndex)) {
	        val.v = ind;
	      }
	    } else if (op === Pro.Array.Operations.add) {
	      nvi = nv.indexOf(what);
	      if (ind === 0) {
	        if (nvi !== -1 && (!hasFrom || ind >= fromIndex)) {
	          val.v = nvi;
	        } else if (v !== -1) {
	          val.v = v + nv.length;
	        }
	      } else if (v === -1 &&  (!hasFrom || ind >= fromIndex)) {
	        if (nvi !== -1) {
	          val.v = ind;
	        }
	      }
	    } else if (op === Pro.Array.Operations.remove) {
	      if (v !== -1) {
	        if (ind === 0) {
	          if (ov === what && !hasFrom) {
	            val.v = indexOf.apply(original._array, args);
	          } else {
	            val.v = v - 1;
	          }
	        } else if (what === ov) {
	          val.v = -1;
	        }
	      }
	    } else if (op === Pro.Array.Operations.setLength && nv <= v) {
	      val.v = -1;
	    } else if (op === Pro.Array.Operations.reverse || op === Pro.Array.Operations.sort) {
	      val.v = indexOf.apply(original._array, args);
	    } else if (op === Pro.Array.Operations.splice) {
	      nvi = nv.indexOf(what);
	      i = nvi + ind;
	      if (ind <= v) {
	        if (nvi !== -1 && i < v && (!hasFrom || fromIndex <= i)) {
	          val.v = i;
	        } else if (nv.length !== ov.length && ov.indexOf(what) === -1) {
	          v = v + (nv.length - ov.length);
	          if (!hasFrom || v >= fromIndex) {
	            val.v = v;
	          } else {
	            val.v = indexOf.apply(original._array, args);
	          }
	        } else {
	          val.v = indexOf.apply(original._array, args);
	        }
	      } else if (v === -1 && nvi !== -1) {
	        val.v = i;
	      }
	    }
	  };
	};
	
	Pro.Array.Listeners.lastIndexOf = function (val, original, args) {
	  var what = args[0], fromIndex = args[1], hasFrom = !!fromIndex;
	  return function (event) {
	    Pro.Array.Listeners.check(event);
	    var op  = event.args[0],
	        ind = event.args[1],
	        ov  = event.args[2],
	        nv  = event.args[3],
	        v = val.valueOf(),
	        nvi, i;
	
	    if (op === Pro.Array.Operations.set) {
	      if (ov === what) {
	        val.v = lastIndexOf.apply(original._array, args);
	      } else if (nv === what && (ind > v || v === -1) && (!hasFrom || ind <= fromIndex)) {
	        val.v = ind;
	      }
	    } else if (op === Pro.Array.Operations.add) {
	      nvi = nv.indexOf(what);
	      if (ind === 0) {
	        if (nvi !== -1 && v === -1 && (!hasFrom || ind <= fromIndex)) {
	          val.v = nvi;
	        } else if (v !== -1) {
	          val.v = v + nv.length;
	        }
	      } else if (nvi !== -1 && (!hasFrom || (ind + nvi) <= fromIndex)) {
	        val.v = ind + nvi;
	      }
	    } else if (op === Pro.Array.Operations.remove) {
	      if (v !== -1) {
	        if (ind === 0) {
	          val.v = v - 1;
	        } else if (what === ov) {
	          val.v = lastIndexOf.apply(original._array, args);
	        }
	      }
	    } else if (op === Pro.Array.Operations.splice || op === Pro.Array.Operations.reverse || op === Pro.Array.Operations.sort || (op === Pro.Array.Operations.setLength && nv < ov)) {
	      val.v = lastIndexOf.apply(original._array, args);
	    }
	  };
	};
	
	Pro.Array.Listeners.slice = function (sliced, original, args) {
	  var s = args[0], e = args[1], hasEnd = !!e;
	  return function (event) {
	    Pro.Array.Listeners.check(event);
	    var op  = event.args[0],
	        ind = event.args[1],
	        ov  = event.args[2],
	        nv  = event.args[3],
	        osl;
	    if (op === Pro.Array.Operations.set) {
	      if (ind >= s && (!hasEnd || ind < e)) {
	        sliced[ind - s] = nv;
	      }
	    } else {
	      osl = sliced._array;
	      sliced._array = slice.apply(original._array, args);
	      sliced.updateByDiff(osl);
	    }
	  };
	};
	
	Pro.Property = function (proObject, property, getter, setter) {
	  var _this = this;
	
	  Object.defineProperty(this, 'proObject', {
	    enumerable: false,
	    configurable: true,
	    writeble: true,
	    value: proObject
	  });
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
	  this.transformators = [];
	
	  this.state = Pro.States.init;
	  this.g = this.get;
	  this.s = this.set;
	
	  this.init();
	};
	
	Pro.Property.Types = {
	  simple: 0, // strings, booleans and numbers
	  auto: 1, // functions - dependent
	  object: 2, // references Pro objects
	  array: 3, // arrays
	  nil: 4 // nulls
	};
	
	Pro.Property.transform = function (property, val) {
	  var i, t = property.transformators, ln = t.length;
	  for (i = 0; i < ln; i++) {
	    val = t[i].call(property, val);
	  }
	
	  return val;
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
	    property.val = Pro.Property.transform(property, newVal);
	
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
	
	  if (caller && caller.property !== this) {
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
	
	Pro.Property.prototype.addTransformator = function (transformator) {
	  this.transformators.push(transformator);
	
	  return this;
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
	
	Pro.Property.prototype.willUpdate = function (source) {
	  var i, listener,
	      listeners = this.listeners,
	      length = listeners.length,
	      event = new Pro.Event(source, this, Pro.Event.Types.value);
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
	
	Pro.Property.prototype.toString = function () {
	  return this.val;
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
	        _this.oldVal = _this.val;
	        _this.val = Pro.Property.transform(_this, _this.func.call(proObject));
	      }
	    };
	    _this.val = _this.func.apply(_this.proObject, arguments);
	    Pro.currentCaller = oldCaller;
	
	    Pro.Property.defineProp(_this.proObject, _this.property, get, set);
	
	    _this.state = Pro.States.ready;
	
	    _this.val = Pro.Property.transform(_this, _this.val);
	    return _this.val;
	  };
	
	  Pro.Property.call(this, proObject, property, getter, function () {});
	};
	
	Pro.AutoProperty.prototype = Object.create(Pro.Property.prototype);
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
	
	Pro.Val.prototype.addTransformator = function (transformator) {
	  this.__pro__.properties.v.addTransformator(transformator);
	
	  return this;
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
	
	return Pro;
}));