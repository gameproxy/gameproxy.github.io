firebase.auth().onAuthStateChanged(function() {
    if (!isStaff(currentUid)) {
        window.location.href = "vuln.html";
    }
});