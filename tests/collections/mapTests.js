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

        test.equals(Map._genKey(a), "bcddfoo");

        test.done();
    }
}