# pro.js (0.0.0)

## Download
 * [Development](https://raw.github.com/meddle0x53/pro.js/master/dist/js/pro.js)
 * [Production](https://raw.github.com/meddle0x53/pro.js/master/dist/js/pro.min.js)

## About pro.js
  Reactive JavaScript object properties. In other words object oriented implementation of the [Reactive paradigm in the programming](http://en.wikipedia.org/wiki/Reactive_programming) in Javascript.
  In human language the reactive idea is the following: if we define sum=a+b and we change 'a' or 'b', 'sum' is automatically calculated.
  The library can be used to implement fast model layer for a small JS MVC (the reactive nature of pro.js gives you bindings). It can be used for observing changes on properties too.
  See the 'Examples' section.


### Compatibility 
  Pro.js is compatible with all the ECMAScript 5 browsers.
  For example Google's Chrome, Mozilla's Firefox, Apple's Safari, Opera, and the newest IEs - 10 and 11 (Tested with chrome and firefox, will be tested agains the others soon).
  
### Use in sites
```html
  <script src="pro.js" type="text/javascript"></script>
  <!-- Pro will be global object -->
```
or
```html
  <script src="pro.min.js" type="text/javascript"></script>
  <!-- Pro will be global object -->
```
  
## Examples

### The reactive sum:

```javascript
  var obj = {
    a: 4,
    b: 3,
    sum: function () {
      return this.a + this.b;
    }
  };
  Pro.prob(obj); // Make obj Pro Object (object with reactive properties).
  
  console.log(obj.sum); // sum is simple property now and it is 7
  obj.a = 5;
  console.log(obj.sum); // sum is 8
  obj.b = 25;
  console.log(obj.sum); // sum is 30
```
