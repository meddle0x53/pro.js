// TODO Classes for every type of stream!
Pro.BufferedStream = function (source, transforms, size, delay) {
  Pro.Stream.call(this, source, transforms);

  this.buffer = [];
  this.delay = (delay !== undefined) ? delay : null;
  this.delayId = null;
  this.size = (size !== undefined) ? size : null;
  this.throttling = false;
  this.debouncing = false;

  this.buff(size, delay);
};

Pro.BufferedStream.prototype = Pro.U.ex(Object.create(Pro.Stream.prototype), {
  trigger: function (event, useTransformations) {
    if (this.delay !== null || this.size !== null) {
      var i;
      if (this.debouncing) {
        this.buffer = [];
        this.bufferDelay(this.delay);
      } else if (this.throttling) {
        this.buffer = [];
      }

      this.buffer.push(event, useTransformations);

      if (this.size !== null && (this.buffer.length / 2) === this.size) {
        this.flush();
      }
    } else {
      this.go(event, useTransformations);
    }
  },
  flush: function () {
    var _this = this, i, b = this.buffer, ln = b.length;
    Pro.flow.run(function () {
      for (i = 0; i < ln; i+= 2) {
        _this.go(b[i], b[i+1]);
      }
      _this.buffer = [];
    });
  },
  bufferDelay: function (delay) {
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
  },
  bufferSize: function (size) {
    this.size = size;

    if (this.size === null || this.size === 0) {
      this.size = null;
      this.flush();
    }
  },
  buff: function (size, delay) {
    this.bufferSize(size);
    this.bufferDelay(delay);
  },
  throttle: function (delay) {
    if (delay !== null || delay !== 0) {
      this.throttling = true;
      this.bufferDelay(delay);
    } else {
      this.throttling = false;
    }
  },
  debounce: function (delay) {
    if (delay !== null || delay !== 0) {
      this.debouncing = true;
      this.bufferDelay(delay);
    } else {
      this.debouncing = false;
    }
  }
});
