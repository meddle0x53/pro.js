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

      it ('creates a stream with mapping, transforming its value, passed with map(f:mapper)', function () {
        var res = [];
        reg.make('f:mapper', function (val) {
          return val + ' ' + val;
        });
        reg.makeStream('test', '@($1)|map(f:mapper)', function (el) {
          res.push(el);
        });

        reg.get('s:test').trigger('hey');
        expect(res.length).toBe(1);
        expect(res).toEqual(['hey hey']);
      });
    });

    describe('filter', function () {
      it ('creates a stream with filtering, filtering its value, using function passed with filter($1)', function () {
        var res = [];
        reg.makeStream('test', '@($1)|filter($2)', function (el) {
          res.push(el);
        }, function (val) {
          return val % 3 === 0;
        });

        reg.get('s:test').trigger(2).trigger(5).trigger(6).trigger(8);
        expect(res.length).toBe(1);
        expect(res).toEqual([6]);
      });

      it ('creates a stream with filtering, filtering its values, using filter(f:filter)', function () {
        var res = [];
        reg.make('f:filter', function (val) {
          return val.indexOf('s') !== -1;
        });
        reg.makeStream('test', '@($1)|filter(f:filter)', function (el) {
          res.push(el);
        });

        reg.get('s:test').trigger('hey').trigger('so').trigger('tanya').trigger('smerch');
        expect(res.length).toBe(2);
        expect(res).toEqual(['so', 'smerch']);
      });
    });

    describe('acc', function () {
      it ('creates a stream with accumulation, using function passed through acc($1, $2)', function () {
        var res = [];
        reg.makeStream('test', '@($1)|acc($2, $3)', function (el) {
          res.push(el);
        }, 0, function (x, y) {
          return x + y;
        });

        reg.get('s:test').trigger(1).trigger(1).trigger(1).trigger(81);
        expect(res.length).toBe(4);
        expect(res).toEqual([1, 2, 3, 84]);
      });

      it ('creates a accumulationg stream using acc($1, f:acc)', function () {
        var res = [];
        reg.make('f:acc', function (x, y) {
          return x * y;
        });
        reg.makeStream('test', '@($1)|acc($2, f:acc)', function (el) {
          res.push(el);
        }, 1);

        reg.get('s:test').trigger(1).trigger(2).trigger(3).trigger(4);
        expect(res.length).toBe(4);
        expect(res).toEqual([1, 2, 6, 24]);
      });
    });
  });
});
