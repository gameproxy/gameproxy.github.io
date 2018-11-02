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
            by: name,
            byStaff: (currentUid === 'Of1POOmyy1V89Rmv8tC7ft0oT1C2' || currentUid === 'WY63UtyjHLaDqjYGubdL2ETc8123' || currentUid === 'cyyClPPVuUfqtv2NzflhMpvjln03' || currentUid === 'jttQ41OFw6MAVNY8mlTL83irRoc2' || currentUid === 'qD54KuQzwOXMd07bMhriJmPYR163' || currentUid === 'sm20Y8fTGoPfA45tqudOPakR3mr1'),
            verified: (currentUid === 'Of1POOmyy1V89Rmv8tC7ft0oT1C2' || currentUid === 'WY63UtyjHLaDqjYGubdL2ETc8123' || currentUid === 'cyyClPPVuUfqtv2NzflhMpvjln03' || currentUid === 'jttQ41OFw6MAVNY8mlTL83irRoc2' || currentUid === 'qD54KuQzwOXMd07bMhriJmPYR163' || currentUid === 'sm20Y8fTGoPfA45tqudOPakR3mr1')
        }).then(function() {
            window.location.href = "index.html";
        });
    });
}