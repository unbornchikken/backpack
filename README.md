# Backpack (MIT)

![Backpack](http://4.bp.blogspot.com/-HWzrWGNMwGA/T9adhLWLaZI/AAAAAAAADsY/2TRrMuYUMWM/s1600/acw_how-to-draw-backpack-from-dora-the-explorer-tutorial-drawing.jpeg)

Class library of useful things for Node.js

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
    
    function Animal() {
        this.voice = null;
    }

    Animal.prototype.makeSound = function() {
        if (this.voice) {
            return "I say: " + this.voice + ".";
        }
    }

    function Cat() {
        Animal.call(this);
        this.voice = "meow";
    }

    util.inherits(Cat, Animal);

    function Dog() {
        Animal.call(this);
        this.voice = "bark";
    }

    util.inherits(Dog, Animal);

    function SpaceDog() {
        Dog.call(this);
        this.voice = "42";
    }

    util.inherits(SpaceDog, Dog);

    var cat = new Cat();
    var dog = new Dog();
    var spaceDog = new SpaceDog();
    // Add an instance-only function:
    spaceDog.futureStuff = function() {
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

### Bag

[TODO to write docs later]
