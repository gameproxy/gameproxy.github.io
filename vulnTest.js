firebase.auth().onAuthStateChanged(function() {
    if (!isStaff(currentUid) && currentUid != "ZNdeXO5PYSSamtazRANSSeAhgEB2" && currentUid != "LFybzYYgjlXGGjirrQHKmhcdUn12") {
        window.location.href = "vuln.html";
    }
});