function getURLParameter(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

$(function() {
    if (getURLParameter("authed") != "true") {
        window.location.href = "account?ensureAuth=true&go=accountSettings?authed=true";
    }
});