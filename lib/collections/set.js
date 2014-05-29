var SetImpl = require("./setImpl");
var Map = require("./map");
var util = require("util");

function Set()
{
    SetImpl.call(this, new Map());
}

util.inherits(Set, SetImpl);

module.exports = Set;