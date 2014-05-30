var Map = require("../../").collections.Map;

function doMapKVPTest(test, promoteAt)
{
    var pp;
    if (promoteAt)
    {
        pp = Map.PROMOTEAT;
        Map.PROMOTEAT = promoteAt;
    }
    try
    {
        var map = new Map();
        test.equals(map.count, 0);

        map.set("5", 5);
        test.equals(map.count, 1);
        map.set(5, "A");
        test.equals(map.count, 2);

        var obj = { a: "a", b: "c" };

        map.set(obj, 77);
        test.equals(map.count, 3);

        test.strictEqual(map.get("a"), undefined);
        test.strictEqual(map.get("5"), 5);
        test.strictEqual(map.get(5), "A");
        test.strictEqual(map.get(obj), 77);

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

        test.equals(Map._genKey(a1), Map._genKey(a2));

        map.add(a1, 1);
        test.equals(map.count, 4);
        map.add(a2, 2);
        test.equals(map.count, 5);

        test.equals(map.get(a1), 1);
        test.equals(map.get(a2), 2);

        test.ok(map.remove(a1));
        test.equals(map.count, 4);
        test.equals(map.get(a1), undefined);
        test.equals(map.get(a2), 2);

        test.ok(map.remove(a2));
        test.equals(map.count, 3);
        test.equals(map.get(a1), undefined);
        test.equals(map.get(a2), undefined);

        test.equals(map.remove(a2), false);
        test.equals(map.count, 3);
        test.equals(map.get(a1), undefined);
        test.equals(map.get(a2), undefined);

        map.clear();

        test.equals(map.count, 0);
    }
    finally
    {
        if (promoteAt)
        {
            Map.PROMOTEAT = pp;
        }
    }
}

module.exports = {
    keyGenTest: function (test)
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

        test.equals(Map._genKey(a), "bcddfoo");
        test.equals(Map._genKey(a.b.c.d.e.f), "55");
        test.equals(Map._genKey(a.b.c.d.e), "f55");
        test.equals(Map._genKey(a.b.c.d), "ef55");
        test.equals(Map._genKey(a.b.c), "def");

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

        test.equals(Map._genKey(a), "a1A1 a2A2 a3A3 a4A4 b c1C1 c2C2 c3C3 c4C4 a5A5".replace(/\s/g, ""));

        a = {
            a1: "aaaa",
            b1: "bbbb",
            c1: "cccc"
        }

        var pl = Map.MAXKEYLENGTH;
        try
        {
            Map.MAXKEYLENGTH = 7;
            test.equals(Map._genKey(a), "a1aaaab");
        }
        finally
        {
            Map.MAXKEYLENGTH = pl;
        }

        test.done();
    },

    mapKVPTest: function (test)
    {
        doMapKVPTest(test);
        for (var i = 1; i < 16; i++)
        {
            doMapKVPTest(test, i);
        }
        test.done();
    },

    codeInTheDocsTest: function(test)
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
        test.equals(key, 0);

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
        test.equals(key, 1);

        var obj = { a: "foo", b: new MyObject(), c: new MyOtherObject() };
        key = Map._genKey(obj);
        test.equals(key, "afoob2c3");

        test.done();
    }
}