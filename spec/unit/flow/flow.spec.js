'use strict';

describe('Pro.Flow', function () {
  var flow, obj1, obj2, fnOrder, resArray;

  beforeEach(function () {
    flow = new Pro.Flow(['pro']);
    fnOrder = [];
    resArray = [];
    obj1 = {
      f1: function () {
        fnOrder.push(obj1.f1);
        resArray[0] = 'obj1.f1';
      },
      f2: function (n1, n2) {
        fnOrder.push(obj1.f2);
        resArray[1] = n1*n2;

        flow.pushOnce(obj2, obj2.f2, [n1, n2, n1 - n2]);
      }
    };

    obj2 = {
      f1: function () {
        fnOrder.push(obj2.f1);
        resArray[2] = 'obj2.f1';
      },
      f2: function (n1, n2, n3) {
        fnOrder.push(obj2.f2);
        resArray[3] = (n1 + n2) / n3;

        flow.pushOnce('pro', obj1, obj1.f1);
      }
    };
  });

  describe('#start', function () {
    it ('initializes a new flow queuse instance to queue events in', function () {
      expect(flow.flowInstance).toBe(null);
      flow.start();
      expect(flow.flowInstance).not.toBe(null);
    });

    it ('calls the start callback passed to the flow options', function () {
      var startParam = null;

      expect(flow.options).toEqual({});
      flow.options.start = function (flowInstance) {
        startParam = flowInstance;
      };

      flow.start();

      expect(flow.flowInstance).not.toBe(null);
      expect(startParam).not.toBe(null);
      expect(startParam).toBe(flow.flowInstance);
    });

    it ('when once called every call after that it reuses the same flowInstance', function () {
      var flowInstance = null;

      flow.start();

      flowInstance = flow.flowInstance;
      expect(flowInstance).not.toBe(null);

      flow.start();

      expect(flowInstance).toBe(flow.flowInstance);
    });

    it ('passes its flowInstance related options to the flowInstance', function () {
      expect(flow.options).toEqual({});
      flow.options.flowInstance = {
        start: function () {
        }
      };

      flow.start();

      expect(flow.options.flowInstance).toBe(flow.flowInstance.options);
    });
  });

  describe('#end', function () {
    it ('nullifies the flow queuse instance', function () {
      expect(flow.flowInstance).toBe(null);
      flow.flowInstance = new Pro.Queues();

      flow.end();
      expect(flow.flowInstance).toBe(null);
    });

    it ('calls the end callback passed to the flow options', function () {
      var endParam = null, pastFlowInstance;

      expect(flow.options).toEqual({});
      flow.options.end= function (flowInstance) {
        endParam = flowInstance;
      };
      pastFlowInstance = flow.flowInstance = new Pro.Queues();

      flow.end();

      expect(flow.flowInstance).toBe(null);
      expect(endParam).not.toBe(null);
      expect(endParam).toBe(pastFlowInstance);
    });

    it ('multiple calls do nothing', function () {
      var endCounter = 0;

      expect(flow.options).toEqual({});
      flow.options.end= function (flowInstance) {
        endCounter++;
      };
      flow.flowInstance = new Pro.Queues();
      flow.end();
      flow.end();
      flow.end();
      flow.end();
      flow.end();

      expect(flow.flowInstance).toBe(null);
      expect(endCounter).toBe(1);
    });

    it ('executes the flowInstance\'s #go method.', function () {
      var flowInstance = null;

      flowInstance = flow.flowInstance = new Pro.Queues();

      spyOn(flowInstance, 'go');
      flow.end();

      expect(flowInstance.go).toHaveBeenCalled();
    });
  });

  describe('#run', function () {
    it('starts and ends the flow', function () {
      var runObj = {
        run: function () {
        },
        onError: function () {
          errCounter++;
        }
      }, errCounter = 0;
      expect(flow.options).toEqual({});
      flow.options.onError = runObj.onError;

      spyOn(flow, 'start');
      spyOn(runObj, 'run').andThrow(new Error('test'));
      spyOn(flow, 'end');

      flow.run(runObj, runObj.run);

      expect(flow.start).toHaveBeenCalled();
      expect(runObj.run).toHaveBeenCalled();
      expect(flow.end).toHaveBeenCalled();

      expect(errCounter).toBe(1);
    });

    it('executes the functions passed int he right order', function () {
      flow.run(function () {
        flow.pushOnce(obj1, obj1.f1);
        flow.pushOnce(obj1, obj1.f2, [3, 2]);
        flow.pushOnce('pro', obj1, obj2.f1);
        flow.pushOnce(obj1, obj2.f2, [2, 3, 4.0]);

      });

      expect(fnOrder.length).toBe(6);
      expect(fnOrder[0]).toBe(obj1.f1);
      expect(fnOrder[1]).toBe(obj1.f2);
      expect(fnOrder[2]).toBe(obj2.f1);
      expect(fnOrder[3]).toBe(obj2.f2);
      expect(fnOrder[4]).toBe(obj2.f2);
      expect(fnOrder[5]).toBe(obj1.f1);
    });

    it('beats the diamond case', function () {
      var hash = {}, a = 0, b = 0, c = 0,
          obj = {
        a: function (n) {
          hash['a'] = hash['a'] || 0;
          hash['a'] += 1;
          a = n;

          // TODO For the real diamond test - c should be before b, thanks to Tanya
          // a -> c(a+b) <- b(a+5) <-a
          flow.pushOnce(obj, obj.b, [4]);
          flow.pushOnce(obj, obj.c, [1]);
          flow.pushOnce(obj, obj.sum, [a, b, c]);
        },
        b: function (n) {
          hash['b'] = hash['b'] || 0;
          hash['b'] += 1;
          b = n;

          flow.pushOnce(obj, obj.c, [5]);
          flow.pushOnce(obj, obj.sum, [a, b, c]);
        },
        c: function (n) {
          hash['c'] = hash['c'] || 0;
          hash['c'] += 1;
          c = n;

          flow.pushOnce(obj, obj.sum, [a, b, c]);
        },
        sum: function (x, y, z) {
          hash['sum'] = hash['sum'] || 0;
          hash['sum'] += 1;

          hash['sum_res'] = x + y + z;

          flow.pushOnce(console, console.log, ['Finish him : ' + hash['sum_res'] + ' for ' + hash['sum'] + ' times!']);
        }
      };

      flow.run(function () {
        flow.pushOnce(obj, obj.a, [3]);
      });

      expect(hash['a']).toBe(1);
      expect(hash['b']).toBe(1);
      expect(hash['c']).toBe(1);
      expect(hash['sum']).toBe(1);
      expect(hash['sum_res']).toBe(a + b + c);
    });
  });

});
