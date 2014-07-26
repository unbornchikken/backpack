var StrMap = require("../../").collections.StrMap;
var assert = require("assert")

describe("StrMap", function()
{
    it("should work as expected", function()
    {
        var map = new StrMap();
        assert.equal(map.count, 0);

        map.set("5", 5);
        assert.equal(map.count, 1);
        map.set("51", "A");
        assert.equal(map.count, 2);
        var obj = "bovcce";
        map.set(obj, 77);
        assert.equal(map.count, 3);
        assert.strictEqual(map.get("a"), undefined);
        assert.strictEqual(map.get("5"), 5);
        assert.strictEqual(map.get("51"), "A");
        assert.strictEqual(map.get(obj), 77);

        var a1 = "a1";

        var a2 = "a2";

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
    });
});
