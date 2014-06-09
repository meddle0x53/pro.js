'use strict';

describe('Pro.Stream', function () {
  describe('#trigger', function () {
    it ('updates the stream listeners', function () {
      var stream = new Pro.Stream(), res = [];
      stream.on(function (number) {
        res.push(number);
      });

      expect(res).toEqual([]);

      stream.trigger(1);
      expect(res).toEqual([1]);

      stream.trigger(2);
      expect(res).toEqual([1, 2]);
    });
  });

  describe('#map', function () {
    it ('creates a new stream from the this stream, using the passed function as default transformation', function () {
      var stream1 = new Pro.Stream(),
          stream2 = stream1.map(function (number) {return number * 2;}),
          res = [];
      stream2.on(function (number) {
        res.push(number);
      });

      expect(res).toEqual([]);

      stream1.trigger(1);
      expect(res).toEqual([2]);

      stream1.trigger(2);
      expect(res).toEqual([2, 4]);
    });

    it ('is transitive', function () {
      var stream1 = new Pro.Stream(),
          stream2 = stream1.map(function (number) {return number * 2;}),
          stream3 = stream2.map(function (number) {return number * 3;}),
          stream4 = stream3.map(function (number) {return '(' + number + ')';}),
          res = [];

      stream4.on(function (number) {
        res.push(number);
      });

      expect(res).toEqual([]);

      stream1.trigger(1);
      expect(res).toEqual(['(6)']);

      stream1.trigger(2);
      expect(res).toEqual(['(6)', '(12)']);
    });
  });

  describe('#filter', function () {
    it ('filters only chosen values', function() {
      var stream1 = new Pro.Stream(),
          stream2 = stream1.filter(function (number) {return number % 2 === 0;}),
          res = [];

      stream2.on(function (number) {
        res.push(number);
      });

      expect(res).toEqual([]);

      stream1.trigger(1);
      expect(res).toEqual([]);

      stream1.trigger(2);
      expect(res).toEqual([2]);

      stream1.trigger(3);
      expect(res).toEqual([2]);

      stream1.trigger(4);
      expect(res).toEqual([2, 4]);
    });

    it ('is chainable', function () {
      var stream1 = new Pro.Stream(),
          stream2 = stream1.filter(function (number) {return number % 2 === 0;}),
          stream3 = stream2.filter(function (number) {return number % 3 === 0;}),
          res = [];

      stream3.on(function (number) {
        res.push(number);
      });

      expect(res).toEqual([]);

      stream1.trigger(2);
      expect(res).toEqual([]);

      stream1.trigger(6);
      expect(res).toEqual([6]);

      stream1.trigger(9);
      expect(res).toEqual([6]);

      stream1.trigger(24);
      expect(res).toEqual([6, 24]);
    });
  });

  describe('#reduce', function () {
    it ('creates a Pro.Val that listens to accumulations', function () {
      var stream = new Pro.Stream(),
          reduced = stream.reduce(0, function (x, y) {return x + y;});
      expect(reduced.v).toEqual(0);

      stream.trigger(1);
      expect(reduced.v).toEqual(1);

      stream.trigger(2);
      expect(reduced.v).toEqual(3);
    });
  });

  describe('#accumulate', function () {
    it ('accumulates values using the passed function', function () {
      var stream1 = new Pro.Stream(),
          stream2 = stream1.accumulate(0, function (x, y) {return x + y;}),
          res = [];

      stream2.on(function (number) {
        res.push(number);
      });

      expect(res).toEqual([]);

      stream1.trigger(1);
      expect(res).toEqual([1]);

      stream1.trigger(1);
      expect(res).toEqual([1, 2]);

      stream1.trigger(1);
      expect(res).toEqual([1, 2, 3]);

      stream1.trigger(2);
      expect(res).toEqual([1, 2, 3, 5]);
    });

    it ('can be chained', function () {
      var stream1 = new Pro.Stream(),
          stream2 = stream1.accumulate(0, function (x, y) {return x + y;}),
          stream3 = stream2.accumulate(1, function (x, y) {return x * y;}),
          res = [];

      stream3.on(function (number) {
        res.push(number);
      });

      expect(res).toEqual([]);

      stream1.trigger(1);
      expect(res).toEqual([1]);

      stream1.trigger(2);
      expect(res).toEqual([1, 3]);

      stream1.trigger(5);
      expect(res).toEqual([1, 3, 24]);
    });
  });

  describe('#merge', function () {
    it ('merges two streams events into one stream of events', function () {
      var stream1 = new Pro.Stream(),
          stream2 = new Pro.Stream(),
          stream3 = stream1.merge(stream2),
          res = [];

      stream3.on(function (e) {
        res.push(e);
      });

      expect(res).toEqual([]);

      stream1.trigger(1);
      expect(res).toEqual([1]);

      stream2.trigger(1);
      expect(res).toEqual([1, 1]);
    });
  });

  describe('buffering', function () {
    describe('#bufferDelay', function () {
      it ('fires all the buffered events', function () {
        var stream = new Pro.Stream(), res = [];

        stream.bufferDelay(100);
        stream.on(function (el) {
          res.push(el);
        });

        stream.trigger('a');
        stream.trigger('b');
        stream.trigger('c');
        stream.trigger('d');

        expect(res).toEqual([]);
        waits(110);
        runs(function () {
          expect(res).toEqual(['a', 'b', 'c', 'd']);
        });
      });
    });
  });
});
