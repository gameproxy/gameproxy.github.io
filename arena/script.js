var computerNumber = 0;
var currentUid = null;

function setComputerNumber() {
    if ($("#computerNumber").val() != "") {
        computerNumber = $("#computerNumber").val();

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
    $("#setComputerNumber").fadeIn();
});