# Backpack (MIT)

![Backpack](http://4.bp.blogspot.com/-HWzrWGNMwGA/T9adhLWLaZI/AAAAAAAADsY/2TRrMuYUMWM/s1600/acw_how-to-draw-backpack-from-dora-the-explorer-tutorial-drawing.jpeg)

Class library of useful things for Node.js

## Purpose

The aim of this library is to provide a collection of classes in one place like those can be found in other frameworks, 
but are not bundled in Node.js even are not exists on the npmjs.org.

## System

### Serializer

True serialization have brought to Node.js! 

*Features:*

- Pure JS
- Serializes to JSON or string
- Handles circular objects
- Deals with class (prototype) hierarchies
- No effort required to make an object serializable, it just works
- Serializes instance methods as well

It's implementation based on the awesome work of Zihua Li: [node-serialize](https://github.com/luin/serialize)

*Usage:*

```javascript
var Serializer = require("backpack-node").system.Serializer;
var s = new Serializer();
var obj = { a: "foo", b: "boo" };
obj.c = obj;

var str = s.stringify(obj);

var obj2 = s.parse(str);

// obj and obj2 will be identical yet separate instances

```

*Constructor:*

- **Serializer**(options)

    options:
    
    - ignoreNativeFunc (Boolean): 
        - *true* means objects with native function members won't be serialized (exception will be thrown)
        - *false* means objects with native function members will be serialized, and exception will be thrown by unserialized native functions when called.

*Methods:*

- **registerKnownType** (typeName, type)

    Registers a type as a known, therefore serializable type. Argument 'typeName' have to be an unique name of that type, the 'type' argument is the constructor (see the example below for clarification).
    
    Remarks:
    
    Instances by having type of deep inheritance hierarchies can be serialized as well, but it is required to register it's type in the serializer to handle it properly. 
    Deserialization won't call the constructor, only restores instance fields (even if they are functions), and restores the prototype.
    
    Example:
    
    ```javascript
    var Serializer = require("../../").system.Serializer;
    var util = require("util");
    
    function Animal()
    {
        this.voice = null;
    }

    Animal.prototype.makeSound = function()
    {
        if (this.voice)
        {
            return "I say: " + this.voice + ".";
        }
    }

    function Cat()
    {
        Animal.call(this);
        this.voice = "meow";
    }

    util.inherits(Cat, Animal);

    function Dog()
    {
        Animal.call(this);
        this.voice = "bark";
    }

    util.inherits(Dog, Animal);

    function SpaceDog()
    {
        Dog.call(this);
        this.voice = "42";
    }

    util.inherits(SpaceDog, Dog);

    var cat = new Cat();
    var dog = new Dog();
    var spaceDog = new SpaceDog();
    // Add an instance-only function:
    spaceDog.futureStuff = function()
    {
        return "I think, therefore I am.";
    }

    test.equals(cat.makeSound(), "I say: meow.");
    test.equals(dog.makeSound(), "I say: bark.");
    test.equals(spaceDog.makeSound(), "I say: 42.");
    test.equals(spaceDog.futureStuff(), "I think, therefore I am.");
    test.ok(cat instanceof Animal);
    test.ok(cat instanceof Cat);
    test.ok(dog instanceof Animal);
    test.ok(dog instanceof Dog);
    test.ok(spaceDog instanceof Animal);
    test.ok(spaceDog instanceof Dog);
    test.ok(spaceDog instanceof SpaceDog);

    var ser = new Serializer();
    ser.registerKnownType("Cat", Cat);
    ser.registerKnownType("Dog", Dog);
    ser.registerKnownType("SpaceDog", SpaceDog);

    var data = ser.stringify(
        {
            cat: cat,
            dog: dog,
            spaceDog: spaceDog
        });

    test.ok(typeof data === "string");

    var deserialized = ser.parse(data);

    test.equals(deserialized.cat.makeSound(), "I say: meow.");
    test.equals(deserialized.dog.makeSound(), "I say: bark.");
    test.equals(deserialized.spaceDog.makeSound(), "I say: 42.");
    test.equals(deserialized.spaceDog.futureStuff(), "I think, therefore I am.");
    test.ok(deserialized.cat instanceof Animal);
    test.ok(deserialized.cat instanceof Cat);
    test.ok(deserialized.dog instanceof Animal);
    test.ok(deserialized.dog instanceof Dog);
    test.ok(deserialized.spaceDog instanceof Animal);
    test.ok(deserialized.spaceDog instanceof Dog);
    test.ok(deserialized.spaceDog instanceof SpaceDog);

    test.done();
    ```

- **stringify** (obj)

    Serializes the object into a string.

- **toJSON** (obj)

    Serializes the object into a plain old JSON object which is safe to stringify or put into MongoDb as is. 

- **parse** (str)

    Deserializes the object from it's string representation.

- **fromJSON** (json)

    Deserializes the object from it's JSON representation.

## Collections

Hashed collections are missing from JavaScript. You can create an object, and then put it some other objects keyed by string values, but that's it,
 you cannot use keys other than strings.

There are some already implemented solutions for this, like: [hashmap](https://www.npmjs.org/package/hashmap) or [hashtable](https://www.npmjs.org/package/hashtable).
The problem is those are either native libraries which often banned from mayor cloud platforms, or if implemented in pure JS they will mutate keys which 
[seriously hurts V8 performance optimizations](http://www.html5rocks.com/en/tutorials/speed/v8/).

Backpack is a pure JS module and Backpack Collections **won't mutate keys**, yet you can use *any* object for keys in classes where appropriate.
Keys are generated by:

- using object's getMapKey() or \_getMapKey() method if defined
- using object's toString() method if overridden
- otherwise keys are generated from combining object field's names and values.

For example:

```javascript

var Map = require("backpack-node").collections.Map;

var id = 0;
function MyObject()
{
    this.id = id++;
}
MyObject.prototype.toString = function()
{
    return this.id; 
}

var myObject = new MyObject();
var key = Map._genKey(myObject);
console.log(key);
// Result: 0;

function MyOtherObject()
{
    this.id = id++;
}
MyOtherObject.prototype.getMapKey = function()
{
    return this.id; 
}

myOtherObject = new MyOtherObject();
key = Map._genKey(myOtherObject);
console.log(key);
// Result: 1;

var obj = { a: "foo", b: new MyObject(), c: new MyOtherObject() };
key = Map._genKey(obj);
console.log(key);
// Result: afoob2c3;
```

The key's equality will be determined by:
- using the equals() or \_equals() method if defined
- using the strict equality operator otherwise

### Map

#### Usage:

```javascript
var Map = require("backpack-node").collections.Map;
var myMap = new Map();
myMap.add(1, "a");
```

#### Reference:

*Properties:*

- **count** 
    
    Returns the items count.

*Methods:*

- **add** (key, value)

    Adds an item to the map. It will throw if item is already exists.

- **set** (key, value, throwIfExists)

    Adds and item to the map. It will throw if item is already exists when 'throwIfExists' argument is true, item will be overwritten otherwise.

- **get** (key)

    Returns item by key. 
    
    If it hasn't found the result will be *undefined*.

- **remove** (key)

    Removes item by key. 
    
    If it's found and successfully removed result will be *true*, if not found result will be *false*.

- **containsKey** (key)

    If item's found by key result will be *true*, if has not found result will be *false*.

- **clear** ()

    Clears the map.

- **forEach** (f)

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

- **forEachKey** (f)

    The function argument will be called for each key.
    
    Example:
    
    ```javascript
    var myMap = new Map();
    myMap.add(1, "a");
    myMap.add(2, "b");
    myMap.forEachKey(function (key)
    {
        console.log("Key: " + key);
    });
    // output will be:
    // Key: 1
    // Key: 2
    ```

- **forEachValue** (f)

    The function argument will be called for each value.
        
    Example:
    
    ```javascript
    var myMap = new Map();
    myMap.add(1, "a");
    myMap.add(2, "b");
    myMap.forEachValue(function (value)
    {
        console.log("Value: " + value);
    });
    // output will be:
    // Value: a
    // Value: b
    ```

### StrMap

This class has exactly the same interface like the Map, but keys have to be strings only. Basically it's a wrapper around a standard object extended by a count property.

#### Usage:

```javascript
var StrMap = require("backpack-node").collections.StrMap;
var myMap = new StrMap();
myMap.add("42", new Date().now());
```

## Set

### Usage:

```javascript
var Set = require("backpack-node").collections.Set;
var mySet = new Set();
mySet.add(5);
mySet.add("bubu");
```

#### Reference:

*Properties:*

- **count** 
    
    Returns the items count.

*Methods:*

- **add** (value)

    Adds item to the set.
    
    If item's added it returns *true*, if item's already existed it returns *false*.
    
- **remove** (value)

    Removes item from the set.
    
    If item's existed and has removed it returns *true*, if item hasn't existed it returns *false*.

- **clear** ()

    Clears the set.

- **exists** (value)

    Returns *true* if item exists, *false* otherwise.

- **forEach** (f)

    The function argument will be called for each value.
        
    Example:
    
    ```javascript
    var mySet = new Set();
    mySet.add("a");
    mySet.add("b");
    mySet.forEach(function (value)
    {
        console.log("Value: " + value);
    });
    // output will be:
    // Value: a
    // Value: b
    ```
    
## StrSet

This class has exactly the same interface like the Set, but values have to be strings only.

### Usage:

```javascript
var StrSet = require("backpack-node").collections.StrSet;
var mySet = new StrSet();
mySet.add("5");
mySet.add("bubu");
```

## Bag

Bag is a special kind of Map, one can put into many values behind a single key.

### Usage

```javascript
var Bag = require("backpack-node").collections.Bag;
var myBag = new Bag();
myBag.add("5", "pupu");
myBag.add("5", "baba");
```

#### Reference:

*Properties:*

- **count** 
    
    Returns the items count.
    
- **collectionsCount**

    Returns the number of collections (as known as how many unique keys exists in the bag).
    
*Methods:*

- **add** (key, value)

    Adds a value into the collection behind the specified key.
    
    Returns the number of items reside in the collection behind the key after the addition.

- **set** (key, coll)

    Add the collection 'coll' behind the specified key. It replaces an original if exists. 
    However if the coll is empty it won't be added (there should be no empty collections in the Bag).

- **remove** (key, value)

    - If value is *undefined*:
    
        Removes the collection behind the specified key.
        
        Returns *true* if the collection has existed else returns *false*.
    
    - If value is not *undefined*:
        
        Removes value from the collection behind the specified key. If the collection turn empty after the removal it will be removed too.
        
        Returns *true* if removal occurs *false* otherwise.

- **clear** ()

    Clears the bag.
    
- **forEach** (f)

    The function argument will be called for each item.
        
    Example:
    
    ```javascript
    var myBag = new Bag();
    myBag.add(1, "a");
    myBag.add(2, "b");
    myBag.add(2, "c");
    
    myBag.forEach(function (item)
    {
        console.log("Key: " + item.key);
        console.log("Value: " + item.value);
    });
    // output will be:
    // Key: 1
    // Value: a
    // Key: 2
    // Value: b
    // Key: 2
    // Value: c
    ```

- **forEachValueIn** (key, f)

    The function argument will be called for each item in the collection behind the specified key if exists.
            
    Example:
    
    ```javascript
    var myBag = new Bag();
    myBag.add(1, "a");
    myBag.add(2, "b");
    myBag.add(2, "c");
    
    myBag.forEachValueIn(2, function (value)
    {
        console.log("Value: " + value);
    });
    // output will be:
    // Value: b
    // Value: c
    ```
        
- **forEachKey** (f)

    The function argument will be called for each key.
            
    Example:
    
    ```javascript
    var myBag = new Bag();
    myBag.add(1, "a");
    myBag.add(2, "b");
    myBag.add(2, "c");
    
    myBag.forEachKey(function (key)
    {
        console.log("Key: " + key);
    });
    // output will be:
    // Key: 1
    // Key: 2
    ```

- **forEachValue** (f)

    The function argument will be called for each value in the bag.
        
    Example:
    
    ```javascript
    var myBag = new Bag();
    myBag.add(1, "a");
    myBag.add(2, "b");
    myBag.add(2, "c");
    
    myBag.forEach(function (value)
    {
        console.log("Value: " + value);
    });
    // output will be:
    // Value: a
    // Value: b
    // Value: c
    ```
    
## What's in the works

- High quality reflection framework like found in .NET or Java
- Serializer improvements:
    - Serialized function minification
    - Serialize into binary
    - Binary compression
    
## My other Node.js projects

- [Workflow 4 Node](https://github.com/unbornchikken/workflow-4-node): I am heading toward to create a Kickstarter compatible prototype.
- [Neuroflow](https://github.com/unbornchikken/Neuroflow): It's going to have Workflow 4 Node based integration into Node.js, 
which brings GPGPU based machine learning to te platform. Also I'm heading toward Kickstarter with this stuff too.
    
## Credits

- [lodash](https://github.com/joonhocho/lodash)
- [node-serialize](https://github.com/luin/serialize)
