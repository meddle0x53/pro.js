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
        reg.makeStream('test', '<<(s:source)');

        expect(reg.get('s:test').sources[0]).toBe(reg.stream('source'));
      });
    });

    describe('on', function () {
      it ('creates a stream with callback on trigger if passed "on" of type @($1)', function () {
        var res = [];
        reg.makeStream('test', '@($1)', function (e) {
          res.push(e);
        });

        reg.get('s:test').trigger('hey');
        expect(res.length).toBe(1);
        expect(res).toEqual(['hey']);
      });

      it ('creates a stream with callback on trigger if passed "on" of type @(f:fun)', function () {
        var res = [];
        reg.make('f:fun', function (e) {
          res.push(e);
        });
        reg.makeStream('test', '@(f:fun)');

        reg.get('s:test').trigger('hey');
        expect(res.length).toBe(1);
        expect(res).toEqual(['hey']);
      });

      it ('creates a stream with a source with callback on trigger if passed "on" of type @(f:fun)', function () {
        var res = [];
        reg.make('f:fun', function (e) {
          res.push(e);
        });
        reg.make('s:source');
        reg.make('s:dest', '@(f:fun)');
        reg.makeStream('test', '<<(s:source)|@(f:fun)|>>(s:dest)');

        reg.get('s:source').trigger('hey');
        expect(res.length).toBe(2);
        expect(res).toEqual(['hey', 'hey']);
      });
    });

    describe('map', function () {
      it ('creates a stream with mapping, transforming its value, passed with map($1)', function () {
        var res = [];
        reg.makeStream('test', '@($2)|map($1)', function (val) {
          return val + ' meddle!';
        }, function (el) {
          res.push(el);
        });

        reg.get('s:test').trigger('hey');
        expect(res.length).toBe(1);
        expect(res).toEqual(['hey meddle!']);
      });
    });
  });
});
