setInterval(function() {
    if (currentUid != null && isStaff(currentUid)) {
        window.location.href = "index.html";
    }
}, 100);