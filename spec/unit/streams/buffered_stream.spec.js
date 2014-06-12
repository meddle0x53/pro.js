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

    describe('#throttle', function () {
      it ('can trigger the same event in a given time tunnel only once', function () {
        var stream = new Pro.BufferedStream(), res = [];

        stream.throttle(100);
        stream.on(function (el) {
          res.push(el);
        });

        stream.trigger('a');
        stream.trigger('b');
        stream.trigger('c');
        stream.trigger('a');
        stream.trigger('f');

        expect(res).toEqual([]);
        waits(110);
        runs(function () {
          expect(res).toEqual(['f']);

          stream.trigger('m');
          stream.trigger('a');
        });

        waits(100);
        runs(function () {
          expect(res).toEqual(['f', 'a']);
        });
      });
    });

    describe('#debounce', function () {
      it ('an event should be triggered only onle in the passed time period, or the period will grow', function () {
        var stream = new Pro.BufferedStream(), res = [];

        stream.debounce(100);
        stream.on(function (el) {
          res.push(el);
        });

        waits(30);
        runs(function () {
          stream.trigger('a');
          stream.trigger('b');
        });

        waits(50);
        runs(function () {
          stream.trigger('c');
          stream.trigger('a');
        });

        waits(90);
        runs(function () {
          stream.trigger('g');
        });

        waits(90);
        runs(function () {
          stream.trigger('f');
        });

        expect(res).toEqual([]);
        waits(110);
        runs(function () {
          expect(res).toEqual(['f']);

          stream.trigger('m');
          stream.trigger('a');
        });

        waits(90);
        runs(function () {
          stream.trigger('p');
        });

        waits(100);
        runs(function () {
          expect(res).toEqual(['f', 'p']);
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
