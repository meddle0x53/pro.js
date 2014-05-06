# pro.js (0.0.1)

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

Let's say we want to define sum=a+b. We want whenever 'a' or 'b' changes, 'sum' to be updated automatically.
'Pro.prob' accepts a normal javascript object and returns a Pro Object. All the functions of the initial object are simple fields in the Pro Object, but they are computed using the original function. If something that the original function is depending on, changes, the value of the corresponding field is changed. So the implementation of the 'sum' is:
```javascript
  var obj = Pro.prob({
    a: 4,
    b: 3,
    sum: function () {
      return this.a + this.b;
    }
  });  // Make obj Pro Object (object with reactive properties).
  
  console.log(typeof(obj.sum)); // "number"
  console.log(obj.sum); // sum is simple field now and it is 7
  obj.a = 5;
  console.log(obj.sum); // sum is 8
  obj.b = 25;
  console.log(obj.sum); // sum is 30
```
Now. What about a sum of all the array's elements:
```javascript
  var obj = Pro.prob({
    a: [1, 2, 3, 4, 5],
    sum: function () {
      var result = 0, i, ln = this.a.length;
      
      for (i = 0; i < ln; i++) {
        result += this.a[i];
      }
      
      return result;
    }
  });  // Make obj Pro Object (object with reactive properties).
  
  console.log(typeof(obj.sum)); // "number"
  console.log(obj.sum); // sum is simple field now and it is 1 + 2 + 3 + 4 + 5 = 15
  obj.a.push(6);
  console.log(obj.sum); // sum is 21
  obj.a.shift();
  console.log(obj.sum); // sum is 20
```

### Observing
Of course we can use the reactive properties of an object to observe changes. I am going to implement the first example of [Watch.js](https://github.com/melanke/Watch.JS/), using a smart pro object.

```javascript
  var obj = Pro.prob({
    a: "initial value of a",
    aWatcher: function () {
      var newVal = this.a;
      if (newVal !== "initial value of a") {
        alert("a changed to " + newVal);
      }
    }
  });
  obj.aWatcher; // The computed properties are lazy so, initialize the watcher first.
  
  obj.a = "other value"; // We will see the alert.
```
