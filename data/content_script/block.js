var objectModify = function (object, property, callback) {
    let _value;
    let descriptor = Object.getOwnPropertyDescriptor(object, property);
    Object.defineProperty(object, property, {
        "enumerable": true,
        "configurable": true,
        get: function () {
            return _value
        },
        set: function (v) {
            callback(v);
            if (descriptor && descriptor.set) descriptor.set(v);
            _value = v;
            return _value;
        }
    });
};

(function (e) {
    e(window, 'ytplayer', function (ytplayer) {
        e(ytplayer, 'config', function (config) {
            if (config && config.args) delete config.args.ad3_module;
        });
    });
})(objectModify);

document.addEventListener('spfpartprocess', function (e) {
    var _detail = e.detail;
    if (_detail) {
        var _part = _detail.part;
        if (_part) {
            var _data = _part.data;
            if (_data) {
                var _swfcfg = _data.swfcfg;
                if (_swfcfg) {
                    delete e.detail.part.data.swfcfg.args.ad3_module;
                }
            }
        }
    }
});