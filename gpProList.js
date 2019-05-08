var gpProList = [];

firebase.database().ref("users").orderByChild("_settings/gpPro/hasGPPro").startAt(true).once("value", function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
        gpProList.push(childSnapshot.ref.toString().split("/")[4]);
    });
});

function isGameProxyPro(uid) {
    return gpProList.indexOf(uid) > -1;
}