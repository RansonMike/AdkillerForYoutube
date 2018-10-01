var app = {};

app.log = false;
app.parent = {};
app.base = chrome.runtime.getURL('');
app.version = function () {
    return chrome.runtime.getManifest().version
};
app.homepage = function () {
    return chrome.runtime.getManifest().homepage_url
};
app.tab = {
    "open": function (url) {
        chrome.tabs.create({"url": url, "active": true})
    }
};

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    if (tabId) delete app.parent[tabId]
});
chrome.tabs.onCreated.addListener(function (tab) {
    if (tab && tab.url && tab.id) app.parent[tab.id] = tab.url
});
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (tab && tab.url && tab.id) app.parent[tab.id] = tab.url
});

app.storage = (function () {
    var objs = {};
    window.setTimeout(function () {
        chrome.storage.local.get(null, function (o) {
            objs = o;
            var script = document.createElement("script");
            script.src = "../common.js";
            document.body.appendChild(script);
        });
    }, 300);
    /*  */
    return {
        "read": function (id) {
            return objs[id]
        },
        "write": function (id, data) {
            var tmp = {};
            data = data + '';
            objs[id] = data;
            tmp[id] = data;
            chrome.storage.local.set(tmp, function () {
            });
        }
    }
})();

app.onBeforeRequest = function (callback) {
    var onBeforeRequest = function (e) {
        var id = {}, type = e.type, current = e.url, initiator = e.initiator;
        if (current.indexOf("http") === 0) {
            id.a = e.tabId;
            id.b = e.tabId + '|' + e.frameId;
            if (type === "ping" || type === "main_frame" || type === "sub_frame") {
                app.parent[id.a] = current;
                app.parent[id.b] = current;
            }
            /*  */
            return callback(initiator, app.parent[id.a], app.parent[id.b], current, type);
        }
    };
    /*  */
    chrome.webRequest.onBeforeRequest.addListener(onBeforeRequest, {"urls": ["http://*/*", "https://*/*"]}, ["blocking"]);
};

app.addon = (function () {
    var tmp = {};
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        for (var id in tmp) {
            if (tmp[id] && (typeof tmp[id] === "function")) {
                if (request.method === id) {
                    var o = request.data || {};
                    if (sender.tab) {
                        o["top"] = sender.tab.url;
                        o["tabId"] = sender.tab.id;
                        app.parent[sender.tab.id] = sender.tab.url;
                    }
                    /*  */
                    tmp[id](o);
                }
            }
        }
    });
    /*  */
    return {
        "receive": function (id, callback) {
            tmp[id] = callback
        },
        "send": function (id, data, tabId) {
            chrome.runtime.sendMessage({"method": id, "data": data});
            chrome.tabs.query({}, function (tabs) {
                tabs.forEach(function (tab) {
                    if (tab.url.indexOf("http") === 0) {
                        if (!tabId || (tabId && tab.id === tabId)) {
                            var o = data || {};
                            o["top"] = tab.url;
                            o["tabId"] = tab.id;
                            app.parent[tab.id] = tab.url;
                            chrome.tabs.sendMessage(tab.id, {"method": id, "data": o}, function () {
                            });
                        }
                    }
                });
            });
        }
    }
})();
