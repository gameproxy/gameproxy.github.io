var serverInfo = {
    key: null,
    name: "Untitled Server"
};

function getURLParameter(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

$(function() {
    if (getURLParameter("server") == null) {
        window.location.replace("dashboard.html");
    }

    firebase.database().ref("chat/directory/" + getURLParameter("server")).on("value", function(snapshot) {
        $(".serverName").text(snapshot.val().name);

        var converter = new showdown.Converter();

        $(".serverDescription").html(converter.makeHtml(snapshot.val().description.replace(/</g, "&lt;").replace(/>/g, "&gt;")));

        $("#viewServerThumbnail").attr("src", snapshot.val().thumbnail);
    });
});