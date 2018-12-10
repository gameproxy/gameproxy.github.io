firebase.auth().onAuthStateChanged(function() {
    if (!isStaff(currentUid) && currentUid != "LFybzYYgjlXGGjirrQHKmhcdUn12") {
        window.location.href = "vuln.html";
    }
});