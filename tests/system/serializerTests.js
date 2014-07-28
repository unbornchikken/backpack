var Serializer = require("../../").system.Serializer;
var util = require("util");
var Map = require("../../").collections.Map;

var assert = require("assert");

describe("Serialize", function()
{
    it("should serialize circular objects", function()
    {
        var ser = new Serializer();

        var a = { b: 5 };
        a.c = a;
        var c = { b: 1, a: a, m: [1, 2, a] };
        c.d = a;
        c.x = c.m;

        var array = [a, c, a, null];

        var a2 = ser.parse(ser.stringify(a));
        var c2 = ser.fromJSON(ser.toJSON(c));
        var array2 = ser.parse(ser.stringify(array));

        assert.equal(a2.b, a.b);
        assert.equal(a2.c, a2);

        assert.equal(c2.b, c.b);
        assert.strictEqual(c2.d, c2.a);
        assert.ok(Array.isArray(c2.m));
        assert.equal(c2.m.length, c.m.length);
        assert.equal(c2.m[0], c.m[0]);
        assert.equal(c2.m[1], c.m[1]);
        assert.strictEqual(c2.m[2], c2.a);
        assert.strictEqual(c2.x, c2.m);

        assert.ok(Array.isArray(array2));
        assert.equal(array2.length, array.length);
        assert.equal(array2[0].b, a.b);
        assert.strictEqual(array2[0].c, array2[0]);
        assert.strictEqual(array2[2], array2[0]);
        assert.strictEqual(array2[3], null);
        var c3 = array2[1];
        assert.equal(c3.m.length, c.m.length);
        assert.equal(c3.m[0], c.m[0]);
        assert.equal(c3.m[1], c.m[1]);
        assert.strictEqual(c3.m[2], c3.a);
        assert.strictEqual(c3.m[2], array2[0]);
        assert.strictEqual(c3.m[2], array2[2]);
    });
    
    it("should serialize class hieararchies", function()
    {
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
        };

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
        };

        assert.equal(cat.makeSound(), "I say: meow.");
        assert.equal(dog.makeSound(), "I say: bark.");
        assert.equal(spaceDog.makeSound(), "I say: 42.");
        assert.equal(spaceDog.futureStuff(), "I think, therefore I am.");
        assert.ok(cat instanceof Animal);
        assert.ok(cat instanceof Cat);
        assert.ok(dog instanceof Animal);
        assert.ok(dog instanceof Dog);
        assert.ok(spaceDog instanceof Animal);
        assert.ok(spaceDog instanceof Dog);
        assert.ok(spaceDog instanceof SpaceDog);

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

        assert.ok(typeof data === "string");

        var deserialized = ser.parse(data);

        assert.equal(deserialized.cat.makeSound(), "I say: meow.");
        assert.equal(deserialized.dog.makeSound(), "I say: bark.");
        assert.equal(deserialized.spaceDog.makeSound(), "I say: 42.");
        assert.equal(deserialized.spaceDog.futureStuff(), "I think, therefore I am.");
        assert.ok(deserialized.cat instanceof Animal);
        assert.ok(deserialized.cat instanceof Cat);
        assert.ok(deserialized.dog instanceof Animal);
        assert.ok(deserialized.dog instanceof Dog);
        assert.ok(deserialized.spaceDog instanceof Animal);
        assert.ok(deserialized.spaceDog instanceof Dog);
        assert.ok(deserialized.spaceDog instanceof SpaceDog);
    });
    
    it("should support custom serialization", function()
    {
        var constructed = 0;

        function Foo()
        {
            this.a = "a";
            this.b = "b";
        }

        function Boo()
        {
            Foo.call(this);
            this.c = "c";
            constructed++;
        }

        util.inherits(Boo, Foo);

        Boo.prototype.serializeToJSON = function()
        {
            return {
                a: this.a,
                b: this.b,
                c: this.c
            };
        };

        Boo.prototype.deserializeFromJSON = function(json)
        {
            this.a = json.a;
            this.b = json.b;
            this.c = json.c;
            this.boo = "boo";
        };

        var ser = new Serializer();
        ser.registerKnownType("Boo", Boo);

        var boo = new Boo();

        assert.equal(constructed, 1);
        assert.equal(boo.a, "a");
        assert.equal(boo.b, "b");
        assert.equal(boo.c, "c");
        assert.strictEqual(boo.boo, undefined);

        var boo2 = ser.fromJSON(ser.toJSON(boo));

        assert.equal(constructed, 1);
        assert.equal(boo2.a, "a");
        assert.equal(boo2.b, "b");
        assert.equal(boo2.c, "c");
        assert.strictEqual(boo2.boo, "boo");
        assert.ok(boo2 instanceof Boo);
        assert.ok(boo2 instanceof Foo);

        var map = new Map();
        var foo = new Foo();

        map.add(foo, boo);
        map.add(boo2, foo);

        ser.registerKnownType("Foo", Foo);

        var mapStr = ser.stringify(map);
        var map2 = ser.parse(mapStr);

        assert.equal(constructed, 1);
        assert.equal(map2.count, 2);

        var fooValue = null;
        var fooKey = null;
        map2.forEach(function(kvp)
        {
            if (kvp.key instanceof Boo)
            {
                assert.ok(kvp.value instanceof Foo && !(kvp.value instanceof Boo));
                fooValue = kvp.value;
            }
            else if (kvp.key instanceof Foo)
            {
                assert.ok(kvp.value instanceof Boo);
                assert.equal(kvp.value.boo, "boo");
                fooKey = kvp.key;
            }
            else
            {
                assert.fail("This is not possible.");
            }
        });

        assert.strictEqual(fooKey, fooValue);
    });

    it("should support Backpack Collections", function()
    {
        var map = new Map();
        map.add("a", "b");
        map.add("c", "d");
        var ser = new Serializer();
        var data = ser.toJSON(map);
        var otherMap = ser.fromJSON(data);
        assert.ok(otherMap instanceof Map);
        assert.equal(map["a"], otherMap["a"]);
        assert.equal(map["c"], otherMap["c"]);
    });
});
