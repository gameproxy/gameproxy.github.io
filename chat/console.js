function getURLParameter(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

function goToPage(page) {
    $(".mainView").attr("src", page);

    window.history.pushState({}, "Chat - GameProxy", "console.html?page=" + page);
}

$(function() {
    if (getURLParameter("page") != null) {
        goToPage(getURLParameter("page"));
    }
});