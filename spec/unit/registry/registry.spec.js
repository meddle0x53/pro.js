'use strict';

describe('Pro.Registry', function () {
  var reg;
  beforeEach(function () {
    reg = new Pro.Registry();
  });
  describe('#makeStream', function () {
    describe('source', function () {
      it ('creates a simple stream that can be retrieved after that and used.', function () {
        var stream = reg.makeStream('test');

        expect(stream instanceof Pro.Stream).toBe(true);
        expect(reg.getStream('test')).toBe(stream);
      });

      it ('creates a simple stream with source - another.', function () {
        var source = new Pro.Stream();

        reg.makeStream('test', source);
        expect(reg.get('s:test').sources[0]).toBe(source);
      });

      it ('creates a simple stream with source - another registered stream using object options.', function () {
        reg.makeStream('source');
        reg.makeStream('test', {into: 's:source'});

        expect(reg.get('s:test').sources[0]).toBe(reg.stream('source'));
      });

      it ('creates a simple stream with source - another stream using object options.', function () {
        reg.makeStream('source');
        reg.makeStream('test', {into: reg.s('source')});

        expect(reg.get('s:test').sources[0]).toBe(reg.stream('source'));
      });

      it ('creates a simple stream with source source stream defined with the proRegQl', function () {
        reg.makeStream('source');
        reg.makeStream('test', '<<s:source');

        expect(reg.get('s:test').sources[0]).toBe(reg.stream('source'));
      });
    });

    describe('map', function () {
    });
  });
});
