function getURLParameter(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

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
            $("#signIn").css("display", "none");
            $("#signUp").css("display", "none");

            $(".signedIn").css("display", "block");
            $(".notSignedIn").css("display", "none");

            firebase.database().ref("users/" + user.uid + "/_settings/name").on("value", function(snapshot) {
                $(".accountName").text(snapshot.val());

                if (isStaff(currentUid)) {
                    $(".accountName").css("color", "#27ef70");

                    if (window.location.pathname.split("/").pop() == "account.html") {
                        $(".adminBanner").show();
                    }
                } else if (isGameProxyPro(currentUid)) {
                    $(".accountName").css("color", "#b3c20f");
                } else {
                    $(".accountName").css("color", "white");
                    
                    if (window.location.pathname.split("/").pop() == "account.html") {
                        $(".adminBanner").hide();
                    }
                }

                setInterval(function() {
                    if (isStaff(currentUid)) {
                        $(".accountName").css("color", "#27ef70");

                        if (window.location.pathname.split("/").pop() == "account.html") {
                            $(".adminBanner").show();
                        }
                    } else if (isGameProxyPro(currentUid)) {
                        $(".accountName").css("color", "#b3c20f");
                    }
                });
            });

            refreshPpic();
        } else {
            // Sign out operation.
            $("#signIn").css("display", "block");
            $("#signUp").css("display", "none");

            $(".signedIn").css("display", "none");
            $(".notSignedIn").css("display", "block");
        }
    } else {
        alert("Sorry! You will not be able to use your GameProxy account on this device as it does not support HTML5 web storage.");
    }
}

var currentUid = null;
var signingUp = false;
var ensureAuth = false;

if (getURLParameter("ensureAuth") == "true") {
    firebase.auth().signOut();

    ensureAuth = true;

    $(function() {
        $("#accountSignInMessage").text("You're going into some potentially dangerous account settings! Please sign in again for security purposes.")
    });
}

if (getURLParameter("after") == "delete") {
    $(function() {
        $("#accountSignInMessage").text("Your account has been successfully deleted. We're sad to have you gone! 😔")
    });
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {currentUid = user.uid;} else {currentUid = null;}

    if (ensureAuth) {
        ensureAuth = false;

        return;
    }

    if (!signingUp) {
        change(user);
    }

    if (user && !signingUp) {
        if (getURLParameter("go") != null && window.location.pathname.split("/").pop() == "account.html" && user) {
            window.location.replace(getURLParameter("go"));
        }
    }
});

function refreshPpic() {
    try {
        firebase.storage().ref("users/" + currentUid + "/_settings/ppic.png").getDownloadURL().then(function(data) {
            $(".accountPicture").attr("src", data);
        });
    } catch (e) {
        $(".accountPicture").attr("src", "/media/AnonUser.png");
    }
}

function setPpic(data) {
    var file = dataURItoBlob(data);

    firebase.storage().ref("users/" + currentUid + "/_settings/ppic.png").put(file).then(function(snapshot) {
        refreshPpic();
    });
}

function setName(data) {
    if (profanity.clean(data).trim() != "") {
        firebase.database().ref("users/" + firebase.auth().currentUser.uid + "/_settings/name").set(profanity.clean(data).trim());
    } else {
        firebase.database().ref("users/" + firebase.auth().currentUser.uid + "/_settings/name").set("Anonymous");
    }
}

function checkFields() {
    if ($("#user").val() != "" && $("#pass").val() != "") {
        return true;
    } else {
        document.getElementById("error").innerHTML = "Oops! You have not filled out all of the required fields.";
        return false;
    }
}

function checkUsername() {
    if ($("#name").val() != "") {
        return true;
    } else {
        document.getElementById("error").innerHTML = "Oops! You have not filled out all of the required fields.";
        return false;
    }
}

function signIn() {
    document.getElementById("error").innerHTML = "";
    if (checkFields()) {
        firebase.auth().signInWithEmailAndPassword($("#user").val(), $("#pass").val()).catch(function(error) {
            document.getElementById("error").innerHTML = "Oops! " + error.message;
        });
    }
}

function signOutBefore() {
    document.getElementById("error").innerHTML = "";

    if (checkFields()) {
        $("#signIn").css("display", "none");
        $("#signUp").css("display", "block");
    }
}

function signUp() {
    document.getElementById("error").innerHTML = "";

    if (checkUsername()) {
        signingUp = true;

        firebase.auth().createUserWithEmailAndPassword($("#user").val(), $("#pass").val()).then(function() {
            firebase.database().ref("users/" + firebase.auth().currentUser.uid + "/_settings/name").set(profanity.clean($("#name").val().substring(0, 20)).trim()).then(function() {
                window.location.replace("/");
            });
        }).catch(function(error) {
            document.getElementById("error").innerHTML = "Oops! " + error.message;
        });
    }
}

function signOut() {
    $(".accountName").css("color", "white");
    $(".adminBanner").hide();

    document.getElementById("error").innerHTML = "";

    firebase.auth().signOut().catch(function(error) {
        document.getElementById("error").innerHTML = "Oops! Something went wrong on our side. Try again soon!";
    });
}

function reset() {
    $("#signIn").css("display", "block");
    $("#signUp").css("display", "none");
}

function copyShareProfileLink() {
    $(".shareProfileLink").removeAttr("disabled");

    document.getElementsByClassName("shareProfileLink")[0].select();
    document.execCommand("copy");

    $(".shareProfileLink").attr("disabled", "");
}

function shareProfile() {
    dialog(
        "Share Profile",
        `
            <div class="center">
                <p>Copy the link below to share your profile!</p>
                <input class="shareProfileLink fullWidth" disabled>
                <a href="javascript:copyShareProfileLink();">Just do it for me</a>
            </div>
        `
    );

    $(".shareProfileLink").val("/profile.html?user=" + currentUid);
}

function changeEmailAddress() {
    if ($("#accountNewEmail").val().trim() == $("#accountNewEmailAgain").val().trim()) {
        firebase.auth().currentUser.updateEmail($("#accountNewEmail").val().trim()).then(function() {
            alert("Your email address has been successfully changed! Use it to sign in from now on.", "Change successful");
        }).catch(function(error) {
            $("#emailError").text(error.message);
        });
    } else {
        $("#emailError").text("Make sure that both email addresses match!");
    }
}

function changePassword() {
    if ($("#accountNewPassword").val().trim() == $("#accountNewPasswordAgain").val().trim()) {
        firebase.auth().currentUser.updatePassword($("#accountNewPassword").val().trim()).then(function() {
            alert("Your password has been successfully changed! Use it to sign in from now on.", "Change successful");
        }).catch(function(error) {
            $("#passwordError").text(error.message);
        });
    } else {
        $("#passwordError").text("Make sure that both passwords match!");
    }
}

function deleteAccountError(error) {
    alert(`
        Sorry! Your account couldn't be deleted. Please try signing out or
        signing back in again. If that doesn't work, please contact our support
        team who will be happy to do it manually:
        <a href="mailto:support@gameproxy.host">support@gameproxy.host</a>
    `, "Couldn't delete account");

    console.log("{gpxy:debug} Account deletion error:", error);
}

function deleteAccount() {
    firebase.storage().ref("users/" + currentUid + "/_settings/ppic.png").delete().then(function() {
        firebase.database().ref("users/" + firebase.auth().currentUser.uid + "/_settings/name").set("[Deleted Account]").then(function() {
            firebase.auth().currentUser.delete().then(function() {
                window.location.replace("account.html?after=delete");
            }).catch(function(error) {
                deleteAccountError(error);
            });
        }).catch(function(error) {
            deleteAccountError(error);
        });
    }).catch(function() {
        firebase.auth().currentUser.delete().then(function() {
            window.location.replace("account.html?after=delete");
        }).catch(function(error) {
            deleteAccountError(error);
        });
    });
}

function showDeleteAccountDialog() {
    dialog("Delete account?", `
        Do you really want to delete your account? This is your final chance to cancel!
    `, [
        {text: "Cancel", onclick: "closeDialog();", type: "bad"},
        {text: "Delete", onclick: "deleteAccount(); closeDialog();", type: "reallyBad"}
    ]);
}

var input = document.getElementById("pass");

try {
    input.addEventListener("keyup", function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            signIn();
        }
    });
} catch (e) {}

$("#ppicFile").on("change", function(evt) {
    function handleFile(file) {
        var fileData = new FileReader();
        fileData.readAsDataURL(file);
        fileData.onload = function(evt) {
            setPpic(evt.target.result);
        }
    }

    var files = evt.target.files;
    handleFile(files[0]);
});

$(function() {
    setInterval(function() {
        if (currentUid != null) {
            firebase.database().ref("users/" + currentUid + "/_settings/lastSeen").set(firebase.database.ServerValue.TIMESTAMP);
        }
    }, 5000);
});