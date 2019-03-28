var gpProList = [];

firebase.database().ref("users").orderByChild("_settings/gpPro/purchaseTime").startAt(0).once("value", function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
        gpProList.push(childSnapshot.ref.toString().split("/")[4]);
    });
});

function isGameProxyPro(uid) {
    return gpProList.indexOf(uid) > -1;
}