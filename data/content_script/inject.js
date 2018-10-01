background.receive("page:set-storage", function (path) {
    var script = document.getElementById("adremover-for-youtube");
    if (script) script.parentNode.removeChild(script);
    /*  */
    var script = document.createElement('script');
    script.type = "text/javascript";
    script.setAttribute("id", "adremover-for-youtube");
    script.src = path + "data/content_script/block.js";
    document.documentElement.appendChild(script);
});

background.send("page:get-storage");

background.receive("page:reload", function () {
    document.location.reload()
});