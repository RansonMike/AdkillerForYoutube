var connect = function (elem, pref) {
    var att = "value";
    if (elem) {
        if (elem.type === "checkbox") att = "checked";
        if (elem.localName === "span") att = "textContent";
        if (elem.localName === "select") att = "selectedIndex";
        /*  */
        var pref = elem.getAttribute("data-pref");
        background.send("options:get-storage", pref);
        elem.addEventListener("change", function () {
            background.send("options:change-storage", {"pref": pref, "value": this[att]})
        });
    }
    /*  */
    return {
        get value() {
            return elem[att]
        },
        set value(val) {
            if (elem.type === "file") return;
            elem[att] = val;
        }
    }
};

background.receive("options:set-storage", function (o) {
    if (window[o.pref]) window[o.pref].value = o.value
});

var init = function () {
    var prefs = document.querySelectorAll("*[data-pref]");
    [].forEach.call(prefs, function (elem) {
        var pref = elem.getAttribute("data-pref");
        window[pref] = connect(elem, pref);
    });
    /*  */
    window.removeEventListener("load", init, false);
};

window.addEventListener("load", init, false);
