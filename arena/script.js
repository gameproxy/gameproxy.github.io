var computerNumber = 0;
var currentUid = null;

function setComputerNumber() {
    if ($("#computerNumber").val() != "") {
        computerNumber = $("#computerNumber").val();

        $("#setComputerNumber").fadeOut();
        $(".signInSides").fadeIn();
    } else {
        alert("Please specify a computer number.", "Cannot set computer number");
    }
}

$(function() {
    $("#setComputerNumber").fadeIn();
});