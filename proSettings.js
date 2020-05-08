function pad(n, width, z) {
    z = z || "0";
    n = n + "";
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

$(function() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            firebase.database().ref("users/" + currentUid + "/_settings/gpPro/data/theme").on("value", function(snapshot) {
                if (snapshot.val() == null) {
                    $(".themeItem").removeClass("selected");
                    $(".themeItem[data-theme='-1']").addClass("selected");
                } else {
                    $(".themeItem").removeClass("selected");
                    $(".themeItem[data-theme='" + snapshot.val() + "']").addClass("selected");
                }
            });

            firebase.database().ref("users/" + currentUid + "/_settings/gpPro/purchaseTime").once("value", function(snapshot) {
                firebase.database().ref("users/" + currentUid + "/_settings/gpPro/vouchers").once("value", function(totalSnapshot) {
                    var totalPeriod = 0;
                
                    for (item in totalSnapshot.val()) {
                        totalPeriod += totalSnapshot.val()[item].period;
                    }

                    var now = new Date().getTime();
                    var countdownDate = snapshot.val() + totalPeriod;
                    
                    setInterval(function() {
                        var now = new Date().getTime();
                        var distance = countdownDate - now;

                        if (distance <= 0) {
                            $(".proSeconds").text("00, maybe");
                            
                            window.location.href = "/";
                        } else {
                            $(".proDays").text(pad(Math.floor(distance / (1000 * 60 * 60 * 24)), 2));
                            $(".proHours").text(pad(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)), 2));
                            $(".proMinutes").text(pad(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)), 2));
                            $(".proSeconds").text(pad(Math.floor((distance % (1000 * 60)) / 1000), 2));
                        }
                    }, 100);
                });
            });
        }
    });
});

function setTheme(theme) {
    firebase.database().ref("users/" + currentUid + "/_settings/gpPro/data/theme").set(theme).then(function() {
        if (theme == -1) {
            window.location.reload();
        }
    });
}