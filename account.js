function change(user) {
    if (typeof(Storage) !== "undefined") {
        if (user && user.uid != currentUid) {
            // Sign in operation.
            document.getElementById("signIn").style.display = "none";
            document.getElementById("signUp").style.display = "none";

            $(".signedIn").show();
            $(".notSignedIn").hide();

            firebase.database().ref("users/" + user.uid + "/_settings/name").on("value", function(snapshot) {
                $(".accountName").text(snapshot.val());
            });
        } else {
            // Sign out operation.
            document.getElementById("signIn").style.display = "unset";
            document.getElementById("signUp").style.display = "none";

            $(".signedIn").hide();
            $(".notSignedIn").show();
        }
    } else {
        alert("Sorry! You will not be able to use your GameProxy account on this device as it does not support HTML5 web storage.");
    }
}

var currentUid = null;
var signingUp = false;
firebase.auth().onAuthStateChanged(function(user) {
    // Checks if user auth state has changed.
    if (!signingUp) {
        change(user);
    } else {
        firebase.database().ref("users/" + firebase.auth().currentUser.uid + "/_settings/name").set(profanity.clean(document.getElementById("name").value.substring(0, 20))).then(function() {
            window.location.href = "index.html";
        });
    }
});

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
        document.getElementById("signUp").style.display = "unset";
        document.getElementById("signUp").style.display = "none";
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
    document.getElementById("signIn").style.display = "unset";
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