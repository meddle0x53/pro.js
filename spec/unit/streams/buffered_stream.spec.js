'use strict';

describe('Pro.BufferedStream', function () {
    describe('#bufferDelay', function () {
      it ('fires all the buffered events', function () {
        var stream = new Pro.BufferedStream(null, null, null, 100), res = [];

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

    describe('#bufferSize', function () {
      it ('fires all the buffered events', function () {
        var stream = new Pro.BufferedStream(null, null, 5), res = [];

        stream.on(function (el) {
          res.push(el);
        });

        stream.trigger('a');
        stream.trigger('b');
        stream.trigger('c');
        stream.trigger('d');

        expect(res).toEqual([]);

        stream.trigger('e');
        expect(res).toEqual(['a', 'b', 'c', 'd', 'e']);
      });
  });
});
