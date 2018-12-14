firebase.auth().onAuthStateChanged(function() {
    if (!isStaff(currentUid) && currentUid != "ZNdeXO5PYSSamtazRANSSeAhgEB2" && currentUid != "LFybzYYgjlXGGjirrQHKmhcdUn12" && currentUid != "5C0gg40VsDaNKxyDa6IDlGESYGI3") {
        window.location.href = "vuln.html";
    }
});