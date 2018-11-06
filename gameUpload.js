function toDataUrl(url, callback) {
    if (url == null) {
        callback(null);
    } else {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            var reader = new FileReader();
            reader.onloadend = function() {
            callback(reader.result);
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.open("GET", url);
        xhr.responseType = "blob";
        xhr.send();
    }
}

function formatDate(date) {
    var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return day + " " + monthNames[monthIndex] + " " + year;
}

function gameUpload() {
    firebase.database().ref("users/" + currentUid + "/_settings/name").once("value", function(snapshot) {
        var name = snapshot.val();

        toDataUrl($("#gameThumbnail").val() ? "https://cors-anywhere.herokuapp.com/" + $("#gameThumbnail").val() : null, function(base64Img) {
            firebase.database().ref("games").push().set({
                title: profanity.clean($("#gameTitle").val()),
                thumbnail: base64Img,
                src: $("#gameLink").val(),
                description: profanity.clean($("#gameDescription").val()),
                metrics: {likes: 0},
                dateAdded: formatDate(new Date()),
                uid: currentUid,
                by: name,
                byStaff: (currentUid === 'Of1POOmyy1V89Rmv8tC7ft0oT1C2' || currentUid === 'WY63UtyjHLaDqjYGubdL2ETc8123' || currentUid === 'cyyClPPVuUfqtv2NzflhMpvjln03' || currentUid === 'jttQ41OFw6MAVNY8mlTL83irRoc2' || currentUid === 'qD54KuQzwOXMd07bMhriJmPYR163' || currentUid === 'sm20Y8fTGoPfA45tqudOPakR3mr1'),
                verified: (currentUid === 'Of1POOmyy1V89Rmv8tC7ft0oT1C2' || currentUid === 'WY63UtyjHLaDqjYGubdL2ETc8123' || currentUid === 'cyyClPPVuUfqtv2NzflhMpvjln03' || currentUid === 'jttQ41OFw6MAVNY8mlTL83irRoc2' || currentUid === 'qD54KuQzwOXMd07bMhriJmPYR163' || currentUid === 'sm20Y8fTGoPfA45tqudOPakR3mr1')
            }).then(function() {
                window.location.href = "index.html";
            });
        });
    });
}