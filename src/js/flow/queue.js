Pro.Queue = function (name, options) {
  this.name = name;
  this.options = options;

  this._queue = [];
};

Pro.Queue.prototype = {};

Pro.Queue.prototype.push = function (obj, method, args) {
  this._queue.push(obj, method, args, 1);
};

Pro.Queue.prototype.pushOnce = function (obj, method, args) {
  var queue = this._queue, current, currentMethod,
      i, length = queue.length;

  for (i = 0; i < l; i += 4) {
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

Pro.Queue.prototype.go = function () {
  var queue = this._queue,
      options = this.options,
      length = queue.length
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
  }

  if (length && after) {
    after(this);
  }

  if (queue.length > length) {
    this._queue = queue.slice(length);
    this.go();
  } else {
    this._queue.length = 0;
  }

};
