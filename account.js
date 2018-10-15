function dataURItoBlob(dataURI) {
    // Convert base64 to raw binary data held in a string.
    // Doesn't handle URLEncoded DataURIs.
    var byteString = atob(dataURI.split(",")[1]);

    // Separate out the mime component.
    var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0]

    // Write the bytes of the string to an ArrayBuffer.
    var ab = new ArrayBuffer(byteString.length);

    // Create a view into the buffer.
    var ia = new Uint8Array(ab);

    // Set the bytes of the buffer to the correct values.
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    // Write the ArrayBuffer to a blob, and you're done.
    var blob = new Blob([ab], {type: mimeString});
    return blob;
}

function change(user) {
    if (typeof(Storage) !== "undefined") {
        if (user && user.uid != null) {
            // Sign in operation.
            document.getElementById("signIn").style.display = "none";
            document.getElementById("signUp").style.display = "none";

            $(".signedIn").css("display", "block");
            $(".notSignedIn").css("display", "none");

            firebase.database().ref("users/" + user.uid + "/_settings/name").on("value", function(snapshot) {
                $(".accountName").text(snapshot.val());
            });

            refreshPpic();
        } else {
            // Sign out operation.
            document.getElementById("signIn").style.display = "block";
            document.getElementById("signUp").style.display = "none";

            $(".signedIn").css("display", "none");
            $(".notSignedIn").css("display", "block");
        }
    } else {
        alert("Sorry! You will not be able to use your GameProxy account on this device as it does not support HTML5 web storage.");
    }
}

var currentUid = null;
var signingUp = false;

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {currentUid = user.uid;} else {currentUid = null;}

    // Checks if user auth state has changed.
    if (!signingUp) {
        change(user);
    } else {
        firebase.database().ref("users/" + firebase.auth().currentUser.uid + "/_settings/name").set(profanity.clean(document.getElementById("name").value.substring(0, 20))).then(function() {
            window.location.href = "index.html";
        });
    }
});

function refreshPpic() {
    firebase.storage().ref("users/" + currentUid + "/_settings/ppic.png").getDownloadURL().then(function(data) {
        $(".accountPicture").attr("src", data);
    });
}

function setPpic(data) {
    var file = dataURItoBlob(data);
    firebase.storage().ref("users/" + currentUid + "/_settings/ppic.png").put(file).then(function(snapshot) {
        refreshPpic();
    });
}

function setName(data) {
    firebase.database().ref("users/" + firebase.auth().currentUser.uid + "/_settings/name").set(document.getElementById("nameSet").value);
}

function checkFields() {
    if (document.getElementById("user").value != "" && document.getElementById("pass").value != "") {
        return true;
    } else {
        document.getElementById("error").innerHTML = "Oops! You have not filled out all of the required fields.";
        return false;
    }
}

function checkUsername() {
    if (document.getElementById("name").value != "") {
        return true;
    } else {
        document.getElementById("error").innerHTML = "Oops! You have not filled out all of the required fields.";
        return false;
    }
}

function signIn() {
    document.getElementById("error").innerHTML = "";
    if (checkFields()) {
        firebase.auth().signInWithEmailAndPassword(document.getElementById("user").value, document.getElementById("pass").value).catch(function(error) {
            document.getElementById("error").innerHTML = "Oops! " + error.message;
        });
    }
}

function signOutBefore() {
    document.getElementById("error").innerHTML = "";
    if (checkFields()) {
        document.getElementById("signIn").style.display = "none";
        document.getElementById("signUp").style.display = "block";
    }
}

function signUp() {
    document.getElementById("error").innerHTML = "";
    if (checkUsername()) {
        firebase.auth().createUserWithEmailAndPassword(document.getElementById("user").value, document.getElementById("pass").value).then(function() {signingUp = true;}).catch(function(error) {
            document.getElementById("error").innerHTML = "Oops! " + error.message;
        });
    }
}

function signOut() {
    document.getElementById("error").innerHTML = "";
    firebase.auth().signOut().catch(function(error) {
        document.getElementById("error").innerHTML = "Oops! Something went wrong on our side. Try again soon!";
    });
}

function reset() {
    document.getElementById("signIn").style.display = "block";
    document.getElementById("signUp").style.display = "none";
    document.getElementById("signUp").style.display = "none";
}

var input = document.getElementById("pass");

input.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        signIn();
    }
});

$("#ppicFile").on("change", function(evt) {
    function handleFile(file) {
        var fileData = new FileReader()
        fileData.readAsDataURL(file);
        fileData.onload = function(evt) {
            setPpic(evt.target.result);
        }
    }

    var files = evt.target.files;
    handleFile(files[0]);
});