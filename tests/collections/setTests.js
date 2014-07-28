var Set = require("../../").collections.Set;
var StrSet = require("../../").collections.StrSet;
var assert = require("assert");

function doSetTest(set)
{
    assert.equal(set.count, 0);
    assert.ok(set.add("a"));
    assert.equal(set.count, 1);
    assert.equal(set.add("a"), false);
    assert.equal(set.count, 1);
    assert.ok(set.add("b"));
    assert.equal(set.count, 2);

    var aFound = false;
    var bFound = false;
    set.forEach(function(v)
    {
        if (v == "a") aFound++;
        if (v == "b") bFound++;
    });
    assert.ok(aFound);
    assert.ok(bFound);

    assert.ok(set.remove("a"));
    assert.equal(set.count, 1);
    assert.equal(set.remove("a"), false);
    assert.equal(set.count, 1);
    assert.equal(set.exists("a"), false);
    assert.ok(set.exists("b"));

    set.clear();

    assert.equal(set.count, 0);
}

describe("Set", function()
{
    it("should work as expected", function()
    {
        doSetTest(new Set());
    });
});

describe("StrSet", function()
{
    it("should work as expected", function()
    {
        doSetTest(new StrSet());
    });
});
