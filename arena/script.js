var computerNumber = 0;
var currentUid = null;

function setComputerNumber() {
    if ($("#computerNumber").val() != "") {
        computerNumber = $("#computerNumber").val();

        $("#computerNumberReadout").text(computerNumber).css("display", "inline");

        $("#setComputerNumber").fadeOut();
        $(".game").fadeIn();
        $("#continueAfterSetup").fadeIn();
    } else {
        alert("Please specify a computer number.", "Cannot set computer number");
    }
}

function continueAfterSetup() {
    $(".game").fadeOut();
    $("#continueAfterSetup").fadeOut();
    $(".signInSides").fadeIn();
}

$(function() {
    firebase.auth().signOut();

    $("#setComputerNumber").fadeIn();

    $("#computerNumber").keydown(function(e) {
        if (e.keyCode == 13) {
            setComputerNumber();
        }
    });

    window.onbeforeunload = function() {
        return "Careful! Reloading this page may cause you to be removed from the competition. Do you really want to continue?";
    };
});