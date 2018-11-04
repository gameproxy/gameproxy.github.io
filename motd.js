var currentMotd = 0;

function loadMotd() {
    if (currentMotd < 0) {
        currentMotd = motdList.length - 1;
    }

    if (currentMotd >= motdList.length) {
        currentMotd = 0;
    }

    $("#motdMessage").attr("src", motdList[currentMotd]["src"]);
    $("#motdMessage").attr("alt", motdList[currentMotd]["alt"]);
    $("#motdMessage").attr("onclick", motdList[currentMotd]["onclick"]);
}

function motdPrev() {
    currentMotd--;

    loadMotd();
}

function motdNext() {
    currentMotd++;

    loadMotd();
}

$(function() {
    setInterval(function() {
        currentMotd++;
        
        loadMotd();
    }, 7000);
});