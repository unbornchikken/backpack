var BagImpl = require("./bagImpl");
var StrMap = require("./strMap");
var util = require("util");

function StrBag()
{
    BagImpl.call(this, new StrMap());
}

util.inherits(StrBag, BagImpl);

module.exports = StrBag;
