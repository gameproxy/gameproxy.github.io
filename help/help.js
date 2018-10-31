function getURLParameter(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

$(function() {
    if (getURLParameter("article") != null) {
        $("#article").attr("markdownrf", "articles/" + getURLParameter("article") + ".md");
    } else {
        $("#article").attr("markdownrf", "articles/list.md");
    }
});