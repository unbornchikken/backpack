"use strict";

/* global describe,it */

let Serializer = require("../../../").system.Serializer;
let util = require("util");
let assert = require("assert");
let _ = require("lodash");

describe("Serialize", function () {
    it("should serialize circular objects", function () {
        let ser = new Serializer();

        let a = { b: 5 };
        a.c = a;
        let c = { b: 1, a: a, m: [1, 2, a] };
        c.d = a;
        c.x = c.m;

        let array = [a, c, a, null];

        let a2 = ser.parse(ser.stringify(a));
        let c2 = ser.fromJSON(ser.toJSON(c));
        let array2 = ser.parse(ser.stringify(array));

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
        let c3 = array2[1];
        assert.equal(c3.m.length, c.m.length);
        assert.equal(c3.m[0], c.m[0]);
        assert.equal(c3.m[1], c.m[1]);
        assert.strictEqual(c3.m[2], c3.a);
        assert.strictEqual(c3.m[2], array2[0]);
        assert.strictEqual(c3.m[2], array2[2]);
    });

    it("should serialize class hieararchies", function () {
        function Animal() {
            this.voice = null;
        }

        Animal.prototype.makeSound = function () {
            if (this.voice) {
                return "I say: " + this.voice + ".";
            }
        };

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

        let cat = new Cat();
        let dog = new Dog();
        let spaceDog = new SpaceDog();
        // Add an instance-only function:
        spaceDog.futureStuff = function () {
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

        let ser = new Serializer();
        ser.registerKnownType("Cat", Cat);
        ser.registerKnownType("Dog", Dog);
        ser.registerKnownType("SpaceDog", SpaceDog);

        let data = ser.stringify(
            {
                cat: cat,
                dog: dog,
                spaceDog: spaceDog
            });

        assert.ok(typeof data === "string");

        let deserialized = ser.parse(data);

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

    it("should support custom serialization", function () {
        let constructed = 0;

        function Foo() {
            this.a = "a";
            this.b = "b";
        }

        function Boo() {
            Foo.call(this);
            this.c = "c";
            constructed++;
        }

        util.inherits(Boo, Foo);

        Boo.prototype.serializeToJSON = function () {
            return {
                a: this.a,
                b: this.b,
                c: this.c
            };
        };

        Boo.prototype.deserializeFromJSON = function (json) {
            this.a = json.a;
            this.b = json.b;
            this.c = json.c;
            this.boo = "boo";
        };

        let ser = new Serializer();
        ser.registerKnownType("Boo", Boo);

        let boo = new Boo();

        assert.equal(constructed, 1);
        assert.equal(boo.a, "a");
        assert.equal(boo.b, "b");
        assert.equal(boo.c, "c");
        assert.strictEqual(boo.boo, undefined);

        let boo2 = ser.fromJSON(ser.toJSON(boo));

        assert.equal(constructed, 1);
        assert.equal(boo2.a, "a");
        assert.equal(boo2.b, "b");
        assert.equal(boo2.c, "c");
        assert.strictEqual(boo2.boo, "boo");
        assert.ok(boo2 instanceof Boo);
        assert.ok(boo2 instanceof Foo);

        let map = new Map();
        let foo = new Foo();

        map.set(foo, boo);
        map.set(boo2, foo);

        ser.registerKnownType("Foo", Foo);

        let mapStr = ser.stringify(map);
        let map2 = ser.parse(mapStr);

        assert.equal(constructed, 1);
        assert.equal(map2.size, 2);

        let fooValue = null;
        let fooKey = null;
        map2.forEach(function (key, value) {
            if (key instanceof Boo) {
                assert.ok(value instanceof Foo && !(value instanceof Boo));
                fooValue = value;
            }
            else if (key instanceof Foo) {
                assert.ok(value instanceof Boo);
                assert.equal(value.boo, "boo");
                fooKey = key;
            }
            else {
                assert.fail("This is not possible.");
            }
        });

        assert.strictEqual(fooKey, fooValue);
    });

    it("should support Map", function () {
        let map = new Map();
        map.set("a", "b");
        map.set("c", "d");
        let ser = new Serializer();
        let data = ser.toJSON(map);
        let otherMap = ser.fromJSON(data);
        assert.ok(otherMap instanceof Map);
        assert.equal(otherMap.size, 2);
        assert.equal(otherMap.get("a"), map.get("a"));
        assert.equal(otherMap.get("c"), map.get("c"));
    });

    it("should support Set", function () {
        let set = new Set();
        set.add("a");
        set.add("b");
        set.add("c");
        set.add(["d", { e: "f" }]);
        let ser = new Serializer();
        let data = ser.toJSON(set);
        let otherSet = ser.fromJSON(data);
        assert.ok(otherSet instanceof Set);
        assert.equal(otherSet.size, 4);
        assert(otherSet.has("a"));
        assert(otherSet.has("b"));
        assert(otherSet.has("c"));
        let all = [];
        for (let item of otherSet.values()) {
            all.push(item);
        }
        let obj = _(all).filter(function(i) { return _.isArray(i); }).first();
        assert(_.isArray(obj));
        assert.equal(obj[0], "d");
        assert(_.isObject(obj[1]));
        assert.equal(obj[1].e, "f");
    });

    it("should support Date", function () {
        let obj = {
            a: new Date()
        };
        let ser = new Serializer();
        let data = ser.toJSON(obj);
        let otherObj = ser.fromJSON(data);
        assert(_.isPlainObject(otherObj));
        assert(_.isDate(otherObj.a));
        assert.equal(otherObj.a.getTime(), obj.a.getTime());
    });

    it("should support Regex", function () {
        let obj = {
            a: /abc/g
        };
        let ser = new Serializer();
        let data = ser.toJSON(obj);
        let otherObj = ser.fromJSON(data);
        assert(_.isPlainObject(otherObj));
        assert(_.isRegExp(otherObj.a));
        assert.equal(otherObj.a.toString(), obj.a.toString());
    });
});
