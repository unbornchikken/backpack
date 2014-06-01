var Serializer = require("../../").system.Serializer;
var util = require("util");

module.exports = {
    serializeCircularTest: function(test)
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

        test.equals(a2.b, a.b);
        test.equals(a2.c, a2);

        test.equals(c2.b, c.b);
        test.strictEqual(c2.d, c2.a);
        test.ok(Array.isArray(c2.m));
        test.equals(c2.m.length, c.m.length);
        test.equals(c2.m[0], c.m[0]);
        test.equals(c2.m[1], c.m[1]);
        test.strictEqual(c2.m[2], c2.a);
        test.strictEqual(c2.x, c2.m);

        test.ok(Array.isArray(array2));
        test.equals(array2.length, array.length);
        test.equals(array2[0].b, a.b);
        test.strictEqual(array2[0].c, array2[0]);
        test.strictEqual(array2[2], array2[0]);
        test.strictEqual(array2[3], null);
        var c3 = array2[1];
        test.equals(c3.m.length, c.m.length);
        test.equals(c3.m[0], c.m[0]);
        test.equals(c3.m[1], c.m[1]);
        test.strictEqual(c3.m[2], c3.a);
        test.strictEqual(c3.m[2], array2[0]);
        test.strictEqual(c3.m[2], array2[2]);

        test.done();
    },

    serializeHiearchyTest: function (test)
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
    },

    serializeCustomTest: function (test)
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

        test.equals(constructed, 1);
        test.equals(boo.a, "a");
        test.equals(boo.b, "b");
        test.equals(boo.c, "c");
        test.strictEqual(boo.boo, undefined);

        var boo2 = ser.fromJSON(ser.toJSON(boo));

        test.equals(constructed, 1);
        test.equals(boo2.a, "a");
        test.equals(boo2.b, "b");
        test.equals(boo2.c, "c");
        test.strictEqual(boo2.boo, "boo");
        test.ok(boo2 instanceof Boo);
        test.ok(boo2 instanceof Foo);

        test.done();
    }
};
