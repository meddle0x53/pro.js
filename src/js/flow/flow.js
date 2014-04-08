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
    queues = new Pro.Queues(queueNames, options.queues);
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
