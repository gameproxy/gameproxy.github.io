var uploadingGame = false;

function toDataUrl(url, callback) {
    if (url == null) {
        callback(null);
    } else if (url.startsWith("data:")) {
        callback(url);
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
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.responseType = "blob";
        xhr.send();
    }
}

function formatDate(date) {
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return day + " " + monthNames[monthIndex] + " " + year;
}

function gameUpload() {
    if (!uploadingGame) {
        uploadingGame = true;

        $(".uploadGame").text("Uploading...");
        $(".uploadGame").css({
            backgroundColor: "#7e7e7e",
            color: "black",
            cursor: "default"
        });

        firebase.database().ref("users/" + currentUid + "/_settings/name").once("value", function(snapshot) {
            var name = snapshot.val();

            toDataUrl(
                $("#gameLink").val().startsWith("https://scratch.mit.edu/projects/")?
                    "https://cors-anywhere.herokuapp.com/" + "https://cdn2.scratch.mit.edu/get_image/project/" + $("#gameLink").val().split("/")[4] + "_288x216.png"
                :   (
                        $("#gameThumbnail").val() != "" ?
                            "https://cors-anywhere.herokuapp.com/" + $("#gameThumbnail").val()
                        :   null
                    )
                ,
                function(base64Img) {
                    var newGame = firebase.database().ref("games").push()
                    
                    newGame.set({
                        title: profanity.clean($("#gameTitle").val()),
                        thumbnail: base64Img,
                        src: $("#gameLink").val().replace(/http:\/\//g, "https://"),
                        description: profanity.clean($("#gameDescription").val()),
                        metrics: {likes: 0},
                        dateAdded: formatDate(new Date()),
                        uid: currentUid,
                        by: name,
                        byStaff: isStaff(currentUid),
                        verified: isStaff(currentUid)
                    }).then(function() {
                        console.log(newGame);
                        window.location.href = "game.html?play=" + newGame.key;
                    });
                }
            );
        });
    }
}