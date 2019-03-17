function getURLParameter(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

function paymentError(code) {
    window.location.href = "paymentError.html?code=" + code;
}

function paymentComplete() {
    window.location.href = "paymentComplete.html";
}

function clearVoucher(snapshotVal, token, callback = function() {}) {
    if (snapshotVal.oneTime == true) {
        firebase.database().ref("vouchers/" + token).set(null, callback);
    } else {
        callback();
    }
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        if (getURLParameter("token") == undefined) {
            paymentError("00");
        } else {
            var token = atob(getURLParameter("token"));

            firebase.database().ref("vouchers/" + token).once("value", function(snapshot) {
                
                if (snapshot.val() != null) {
                    firebase.database().ref("users/" + currentUid + "/_settings/gpPro/previouslyUsed").once("value", function(puSnapshot) {
                        if (puSnapshot.val() == null || !(sha256(token) in puSnapshot.val())) {
                            var period = snapshot.val().period;
        
                            var pushVoucherRef = firebase.database().ref("users/" + currentUid + "/_settings/gpPro/vouchers").push();
        
                            pushVoucherRef.set({
                                origin: token,
                                period: period
                            }, function(errored) {
                                if (errored) {
                                    paymentError("02");
                                } else {
                                    pushVoucherRef.child("origin").set(null, function() {
                                        firebase.database().ref("users/" + currentUid + "/_settings/gpPro/previouslyUsed/" + sha256(token)).set(true, function() {
                                            firebase.database().ref("users/" + currentUid + "/_settings/gpPro/purchaseTime").once("value", function(ptSnapshot) {
                                                if (ptSnapshot.val() == null) {
                                                    firebase.database().ref("users/" + currentUid + "/_settings/gpPro/purchaseTime").set(new Date().getTime(), function() {
                                                        clearVoucher(snapshot.val(), token, paymentComplete);
                                                    });
                                                } else {
                                                    clearVoucher(snapshot.val(), token, paymentComplete);
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