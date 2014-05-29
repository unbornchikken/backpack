var SetImpl = require("./setImpl");
var StrMap = require("./strMap");
var util = require("util");

function StrSet()
{
    SetImpl.call(this, new StrMap());
}

util.inherits(StrSet, SetImpl);

module.exports = StrSet;