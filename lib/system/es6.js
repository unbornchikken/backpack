var traceur = require("traceur");
var Module = require('module');

module.exports = {
    es6Module: function(path, module, exports) {

        var originalRequireJs = Module._extensions['.js'];
        path = path.replace(/\//, '[/\\\\]');

        var rex = new RegExp('^(?=.*' + path + ')+.+\.js$');

        var filter = function (filename) {
            return rex.test(filename);
        }

        try {
            traceur.require.makeDefault(function (filename) {
                return filter(filename);
            });

            module.exports = exports;
        }
        finally {
            Module._extensions['.js'] = originalRequireJs;
            filter = function () {
                return true;
            } // Because traceur filters is a global array... :S
        }
    },

    es6App: function() {
        traceur.require.makeDefault(function (filename) {
            return /^(?!.*node_modules)+.+\.js$/.test(filename);
        });
    }
}
