var Map = require("../../").collections.Map;
var assert = require("assert");

function doMapKVPTest(promoteAt, forceES6Map)
{
    var pp;
    if (promoteAt)
    {
        pp = Map.PROMOTEAT;
        Map.PROMOTEAT = promoteAt;
    }
    try
    {
        var map = new Map({
            forceES6Map: forceES6Map
        });
        assert.equal(map.count, 0);

        map.set("5", 5);
        assert.equal(map.count, 1);
        map.set(5, "A");
        assert.equal(map.count, 2);

        var obj = { a: "a", b: "c" };

        map.set(obj, 77);
        assert.equal(map.count, 3);

        assert.strictEqual(map.get("a"), undefined);
        assert.strictEqual(map.get("5"), 5);
        assert.strictEqual(map.get(5), "A");
        assert.strictEqual(map.get(obj), 77);

        var a1 = {
            b: {
                c: {
                    d: {
                        e: {
                            f: "55"
                        }
                    }
                }
            },
            d: "foo"
        };

        var a2 = {
            b: {
                c: {
                    d: {
                        e: {
                            f: "555"
                        }
                    }
                }
            },
            d: "foo"
        };

        assert.equal(Map._genKey(a1), Map._genKey(a2));

        map.add(a1, 1);
        assert.equal(map.count, 4);
        map.add(a2, 2);
        assert.equal(map.count, 5);

        assert.equal(map.get(a1), 1);
        assert.equal(map.get(a2), 2);

        assert.ok(map.remove(a1));
        assert.equal(map.count, 4);
        assert.equal(map.get(a1), undefined);
        assert.equal(map.get(a2), 2);

        assert.ok(map.remove(a2));
        assert.equal(map.count, 3);
        assert.equal(map.get(a1), undefined);
        assert.equal(map.get(a2), undefined);

        assert.equal(map.remove(a2), false);
        assert.equal(map.count, 3);
        assert.equal(map.get(a1), undefined);
        assert.equal(map.get(a2), undefined);

        map.clear();

        assert.equal(map.count, 0);
    }
    finally
    {
        if (promoteAt)
        {
            Map.PROMOTEAT = pp;
        }
    }
}

describe("Map", function ()
{
    describe("#_genKey()", function()
    {
        it("should generate expected keys", function()
        {
            var a = {
                b: {
                    c: {
                        d: {
                            e: {
                                f: "55"
                            }
                        }
                    }
                },
                d: "foo"
            };

            assert.equal(Map._genKey(a), "bcddfoo");
            assert.equal(Map._genKey(a.b.c.d.e.f), "55");
            assert.equal(Map._genKey(a.b.c.d.e), "f55");
            assert.equal(Map._genKey(a.b.c.d), "ef55");
            assert.equal(Map._genKey(a.b.c), "def");

            a = {
                a1: "A1",
                a2: "A2",
                a3: "A3",
                a4: "A4",
                b: {
                    c1: "C1",
                    c2: "C2",
                    c3: "C3",
                    c4: "C4"
                },
                a5: "A5",
                a6: "A6",
                a7: "A7",
                a8: "A8",
                a9: "A9"
            };

            assert.equal(Map._genKey(a), "a1A1 a2A2 a3A3 a4A4 b c1C1 c2C2 c3C3 c4C4 a5A5".replace(/\s/g, ""));

            a = {
                a1: "aaaa",
                b1: "bbbb",
                c1: "cccc"
            }

            var pl = Map.MAXKEYLENGTH;
            try
            {
                Map.MAXKEYLENGTH = 7;
                assert.equal(Map._genKey(a), "a1aaaab");
            }
            finally
            {
                Map.MAXKEYLENGTH = pl;
            }
        });
        
        it("should handle function properties", function()
        {
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
            assert.equal(key, 0);

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
            assert.equal(key, 1);

            var obj = { a: "foo", b: new MyObject(), c: new MyOtherObject() };
            key = Map._genKey(obj);
            assert.equal(key, "afoob2c3");
        });
    });
    
    describe("#get() #set()", function()
    {
        it("should work as expected", function()
        {
            doMapKVPTest(true);
            for (var i = 1; i < 16; i++)
            {
                doMapKVPTest(i, i % 2 === 0);
            }
        });
    });
});