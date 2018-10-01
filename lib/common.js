app.addon.receive("page:get-storage", function (e) {
    if (config.youtube.nativeBlock === true) {
        if (app.log) console.error(">> Blocking Ads Using Complementary Method");
        app.addon.send("page:set-storage", app.base, e.tabId);
    }
});

app.addon.receive("options:change-storage", function (e) {
    config.set(e.pref, e.value);
    app.addon.send("options:set-storage", {"pref": e.pref, "value": config.get(e.pref)}, null);
    if (e.pref === "youtube.nativeBlock") {
        if (e.value === true) app.addon.send("page:reload", null, null)
    }

});

app.onBeforeRequest(function (top1, top2, top3, current, type) {
    var flag1 = top1 && config.youtube.requestBlock.matchRegexp.test(top1);
    var flag2 = top2 && config.youtube.requestBlock.matchRegexp.test(top2);
    var flag3 = top3 && config.youtube.requestBlock.matchRegexp.test(top3);
    /*  */
    if (flag1 || flag2 || flag3) {
        if (current.indexOf(".googlevideo.") !== -1) return;
        /*  */
        var isad = config.youtube.requestBlock.blockAdsRegexp.test(current);
        if (isad) {
            if (app.log) console.error(">> Blocking Ad", current);
            return {"cancel": true};
        }
        /*  */
        if (config.youtube.annotations === true) {
            var isannotation = config.youtube.requestBlock.blockAnnotationsRegexp.test(current);
            if (isannotation) {
                if (app.log) console.error(">> Blocking Annotation", current);
                return {"cancel": true};
            }
        }
    }
});

app.addon.receive("options:get-storage", function (e) {
    app.addon.send("options:set-storage", {"pref": e, "value": config.get(e)}, null)
});
