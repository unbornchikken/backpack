# Backpack

![Backpack](http://4.bp.blogspot.com/-HWzrWGNMwGA/T9adhLWLaZI/AAAAAAAADsY/2TRrMuYUMWM/s1600/acw_how-to-draw-backpack-from-dora-the-explorer-tutorial-drawing.jpeg)

Class library of useful things for Node.js

## Purpose

The aim of this library is to provide a collection of classes in one place like those can be found in other frameworks, 
but are not bundled in Node.js, even are not exists on the npm.org.

## Collections

Hashed collections are missing from JavaScript. You can create an object, and then put it some other objects keyed by string values, but that's it,
 you cannot use keys other than strings.

There are some already implemented solutions for this, like: [hashmap](https://www.npmjs.org/package/hashmap) or [hashtable](https://www.npmjs.org/package/hashtable).
The problem is those are either native libraries which often banned from mayor cloud platforms, or if implemented in pure JS they will mutate keys which 
[seriously hurts V8 performance optimizations](http://www.html5rocks.com/en/tutorials/speed/v8/).

Backpack is a pure JS module and Backpack Collections **won't mutate keys**, yet you can use *any* object for keys in classes where appropriate.

### Map

#### Usage:

```javascript
var Map = require("backpack").collections.Map;
var myMap = new Map();
myMap.add(1, "a");
```

#### Reference:

*Properties:*

- **count** 
    
    Returns the items count.

*Methods:*

- function **add**(key, value)

    Adds and item to the map. It will throw if item is already exists.

- function **set** (key, value, throwIfExists)

    Adds and item to the map. It will throw if item is already exists when 'throwIfExists' argument is true, item will be overwritten otherwise.

- function **get** (key)

    Returns item by key. 
    
    If it not found the result will be *undefined*.

- function **remove** (key)

    Removes item by key. 
    
    If it found and successfully removed result will be *true*, if not found result will be *false*.

- function **containsKey** (key)

    If item found by key result will be *true*, if not found result will be *false*.

- function **clear** ()

    Clears the map.

- function **forEach** (f)

    The function argument will be called for each item.
    
    Example:
    
    ```javascript
    var myMap = new Map();
    myMap.add(1, "a");
    myMap.add(2, "b");
    myMap.forEach(function (item)
    {
        console.log("Key: " + item.key);
        console.log("Value: " + item.value);
    });
    // output will be:
    // Key: 1
    // Value: a
    // Key: 2
    // Value: b
    ```

- function **forEachKey** (f)

- function **forEachValue** (f)