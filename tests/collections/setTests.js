var Set = require("../../").collections.Set;
var StrSet = require("../../").collections.StrSet;

function doSetTest(test, set)
{
    test.equals(set.count, 0);
    test.ok(set.add("a"));
    test.equals(set.count, 1);
    test.equals(set.add("a"), false);
    test.equals(set.count, 1);
    test.ok(set.add("b"));
    test.equals(set.count, 2);

    var aFound = false;
    var bFound = false;
    set.forEach(function(v)
    {
        if (v == "a") aFound++;
        if (v == "b") bFound++;
    });
    test.ok(aFound);
    test.ok(bFound);

    test.ok(set.remove("a"));
    test.equals(set.count, 1);
    test.equals(set.remove("a"), false);
    test.equals(set.count, 1);
    test.equals(set.exists("a"), false);
    test.ok(set.exists("b"));

    set.clear();

    test.equals(set.count, 0);
}

module.exports = {
    setTests: function (test)
    {
        doSetTest(test, new Set());
        doSetTest(test, new StrSet());
        test.done();
    }
}
