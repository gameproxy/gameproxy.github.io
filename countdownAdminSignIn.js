setInterval(function() {
    if (currentUid != null && isStaff(currentUid)) {
        window.location.href = "/";
    }
}, 100);