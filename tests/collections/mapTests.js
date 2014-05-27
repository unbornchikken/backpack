var Map = require("../../").collections.Map;

module.exports = {
    keyGenTest: function(test)
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

        test.equals(Map.prototype._genKey(a), "foo");
        test.equals(Map.prototype._genKey(a.b.c.d.e.f), "55");
        test.equals(Map.prototype._genKey(a.b.c.d.e), "55");
        test.equals(Map.prototype._genKey(a.b.c.d), "55");
        test.equals(Map.prototype._genKey(a.b.c), Map.OBJECT);

        a = {
            a1: "a1",
            a2: "a2",
            a3: "a3",
            a4: "a4",
            b: {
                a1: "b1",
                a2: "b2",
                a3: "b3",
                a4: "b4"
            },
            a5: "a5",
            a6: "a6",
            a7: "a7",
            a8: "a8",
            a9: "a9"
        };

        test.done();
    }
}