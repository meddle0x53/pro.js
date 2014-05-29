'use strict';

describe('Pro.Stream', function () {
  describe('#trigger', function () {
    it ('updates the stream listeners', function () {
      var stream = new Pro.Stream(), res = [];
      stream.onVal(function (number) {
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
      stream2.onVal(function (number) {
        res.push(number);
      });

      expect(res).toEqual([]);

      stream1.trigger(1);
      expect(res).toEqual([2]);

      stream1.trigger(2);
      expect(res).toEqual([2, 4]);

    });
  });
});
