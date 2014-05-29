var StrMap = require("../../").collections.StrMap;

module.exports = {
    mapKVPTest: function (test)
    {
        var map = new StrMap();
        test.equals(map.count, 0);

        map.set("5", 5);
        test.equals(map.count, 1);
        map.set("51", "A");
        test.equals(map.count, 2);
        var obj = "bovcce";
        map.set(obj, 77);
        test.equals(map.count, 3);
        test.strictEqual(map.get("a"), undefined);
        test.strictEqual(map.get("5"), 5);
        test.strictEqual(map.get("51"), "A");
        test.strictEqual(map.get(obj), 77);

        var a1 = "a1";

        var a2 = "a2";

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

        test.done();
    }
}
