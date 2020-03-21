function getURLParameter(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

function getSpecificURLParameter(url, name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec("?" + (url.split("?")[1] || "")) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

function goToPage(page) {
    $(".mainView").attr("src", page);

    window.history.pushState({}, "Chat - GameProxy", "console.html?page=" + encodeURIComponent(page));
}

$(function() {
    if (getURLParameter("page") != null) {
        goToPage(getURLParameter("page"));
    }

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            firebase.database().ref("users/" + currentUid + "/_settings/chat/servers").on("value", function(snapshot) {
                $(".serverList").html("");

                for (var key in snapshot.val()) {
                    $(".serverList").append(
                        $("<a>")
                            .attr("href", "javascript:goToPage('server.html?server=" + encodeURIComponent(key) + "');")
                            .attr("data-key", key)
                            .append("<img onerror=\"this.onerror = null; this.src = '/media/NoThumbnail.png';\" alt=''>")
                    );

                    (function(key) {
                        firebase.database().ref("chat/servers/" + key + "/name").on("value", function(snapshot) {
                            $(".serverList a[data-key='" + key + "']").attr("title", snapshot.val());
                        });

                        firebase.database().ref("chat/servers/" + key + "/thumbnail").on("value", function(snapshot) {
                            $(".serverList a[data-key='" + key + "'] img").attr("src", snapshot.val());
                        });

                        firebase.database().ref("chat/servers/" + key).on("value", function(snapshot) {
                            if (snapshot.val() == null) {
                                firebase.database().ref("users/" + currentUid + "/_settings/chat/servers/" + key).set(null);
                            }
                        });
                    })(key);
                }
            });

            setInterval(function() {
                var currentPage = $(".mainView")[0].contentWindow.location.href.split("/")[$(".mainView")[0].contentWindow.location.href.split("/").length - 1];

                if (currentPage == "dashboard.html") {
                    $("nav a:not([data-page='dashboard'])").removeClass("selected");
                    $("nav a[data-page='dashboard']").addClass("selected");
                } else if (currentPage.startsWith("server.html?") || currentPage.startsWith("viewServer.html?") || currentPage.startsWith("serverSettings.html?")) {
                    $("nav a:not([data-key='" + getSpecificURLParameter(currentPage, "server") + "'])").removeClass("selected");
                    $("nav a[data-key='" + getSpecificURLParameter(currentPage, "server") + "']").addClass("selected");
                } else {
                    $("nav a").removeClass("selected");
                }
            });
        }
    });
});