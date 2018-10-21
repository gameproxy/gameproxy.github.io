function gameUpload() {
    firebase.database().ref("users/" + currentUid + "/_settings/name").once("value", function(snapshot) {
        var name = snapshot.val();

        firebase.database().ref("games").push().set({
            title: $("#gameTitle").val(),
            thumbnail: $("#gameThumbnail").val(),
            src: $("#gameLink").val(),
            description: $("#gameDescription").val(),
            metrics: {likes: 0},
            uid: currentUid,
            by: name
        }).then(function() {
            window.location.href = "index.html";
        });
    });
}