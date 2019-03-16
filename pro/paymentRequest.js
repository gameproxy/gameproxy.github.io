function getURLParameter(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

function paymentError(code) {
    window.location.href = "paymentError.html?code=" + code;
}

function paymentComplete() {
    window.location.href = "paymentComplete.html";
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        if (getURLParameter("token") == undefined) {
            paymentError("00");
        } else {
            firebase.database().ref("vouchers/" + getURLParameter("token")).once("value", function(snapshot) {
                
                if (snapshot.val() != null) {
                    firebase.database().ref("users/" + currentUid + "/_settings/gpPro/previouslyUsed").once("value", function(puSnapshot) {
                        if (puSnapshot.val() == null || !(sha256(getURLParameter("token")) in puSnapshot.val())) {
                            if (snapshot.val().oneTime == true) {
                                firebase.database().ref("vouchers/" + getURLParameter("token")).set(null);
                            }
        
                            var pushVoucherRef = firebase.database().ref("users/" + currentUid + "/_settings/gpPro/vouchers").push();
        
                            pushVoucherRef.set({
                                origin: getURLParameter("token"),
                                period: snapshot.val().period
                            }, function(errored) {
                                if (errored) {
                                    paymentError("02");
                                } else {
                                    pushVoucherRef.child("origin").set(null, function() {
                                        firebase.database().ref("users/" + currentUid + "/_settings/gpPro/previouslyUsed/" + sha256(getURLParameter("token"))).set(true, function() {
                                            firebase.database().ref("users/" + currentUid + "/_settings/gpPro/purchaseTime").once("value", function(snapshot) {
                                                if (snapshot.val() == null) {
                                                    firebase.database().ref("users/" + currentUid + "/_settings/gpPro/purchaseTime").set(new Date().getTime(), function() {
                                                        paymentComplete();
                                                    });
                                                } else {
                                                    paymentComplete();
                                                }
                                            });
                                        });
                                    });
                                }
                            });
                        } else {
                            paymentError("04");
                        }
                    });
                } else {
                    paymentError("01");
                }
            });
        }
    } else {
        paymentError("03");
    }
});