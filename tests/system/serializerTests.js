var Serializer = require("../../").system.Serializer;

module.exports = {
    serializeCircularTest: function(test)
    {
        var ser = new Serializer();

        var a = { b: 5 };
        a.c = a;
        var c = { b: 1, a: a, m: [1, 2, a] };
        c.d = a;

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
    }
}
