Pro.BufferedStream = function (source, transforms, size, delay) {
  Pro.Stream.call(this, source, transforms);

  this.buffer = [];
  this.delay = (delay !== undefined) ? delay : null;
  this.delayId = null;
  this.size = (size !== undefined) ? size : null;

  this.buff(size, delay);
};

Pro.BufferedStream.prototype = Object.create(Pro.Stream.prototype);
Pro.BufferedStream.prototype.constructor = Pro.BufferedStream;

Pro.BufferedStream.prototype.flush = function () {
  var _this = this, i, b = this.buffer, ln = b.length;
  Pro.flow.run(function () {
    for (i = 0; i < ln; i+= 2) {
      _this.go(b[i], b[i+1]);
    }
  });
};

Pro.BufferedStream.prototype.trigger = function (event, useTransformations) {
  if (this.delay !== null || this.size !== null) {
    this.buffer.push(event, useTransformations);

    if (this.size !== null && (this.buffer.length / 2) === this.size) {
      this.flush();
    }
  } else {
    this.go(event, useTransformations);
  }
};

Pro.BufferedStream.prototype.bufferDelay = function (delay) {
  this.delay = delay;

  if (this.delayId !== null){
    clearInterval(this.delayId);
    this.delayId = null;
  }

  if (this.delay !== null) {
    var _this = this;
    this.delayId = setInterval(function () {
      _this.flush();
    }, this.delay);
  }
};

Pro.BufferedStream.prototype.bufferSize = function (size) {
  this.size = size;

  if (this.size === null || this.size === 0) {
    this.size = null;
    this.flush();
  }
};

Pro.BufferedStream.prototype.buff = function (size, delay) {
  this.bufferSize(size);
  this.bufferDelay(delay);
};
