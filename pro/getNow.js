var selectedTime = "";
var enteredCode = "";

function usePayPal() {
    dialog("Pay via PayPal", `
        <div class="center">
            <h2>Choose a price to pay</h2>
            <p>Pay anywhere from 1 month's worth to 2 years' worth!</p>
            <div>
                <select id="PayPalAmount">
                    <option value="1mo">1 month - &pound;1.50</option>
                    <option value="6mo">6 months - &pound;7.00</option>
                    <option value="1yr">1 year - &pound;12.00</option>
                    <option value="2yr">2 years - &pound;18.00</option>
                </select>
            </div>
            <p>We apply bulk discounts depending on the period that you buy.</p>
        </div>
    `, [
        {text: "Cancel", onclick: "closeDialog();", type: "bad"},
        {text: "Next", onclick: "usePayPalNext();", type: "primary"}
    ]);
}

function usePayPalNext() {
    selectedTime = $("#PayPalAmount").val();

    var amount = {
        "1mo": 1.50,
        "6mo": 7.00,
        "1yr": 12.00,
        "2yr": 18.00
    }[selectedTime];

    var buttonID = {
        "1mo": "ME5X4PRGFZJJS",
        "6mo": "HYDLYJSAQYGLL",
        "1yr": "KKAN649WLHTF4",
        "2yr": "T75QKHUEC5LF8"
    }[selectedTime];

    dialog("Pay via PayPal", `
        <div>
            <h2 class="noMargin">GameProxy Pro ` + selectedTime + ` - &pound;` + amount.toFixed(2) + `</h2>
            <p>
                By purchasing GameProxy Pro, you agree to the <a href="proTerms.html" target="_blank">GameProxy Pro Terms</a>.
            </p>
            <div class="center">
                <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
                    <input type="hidden" name="cmd" value="_s-xclick" />
                    <input type="hidden" name="hosted_button_id" value="` + buttonID + `" />
                    <input type="image" src="/media/paymentIcons/pay.png" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Pay securely via PayPal" class="payViaPaypalButton" />
                    <img alt="" border="0" src="https://www.paypal.com/en_GB/i/scr/pixel.gif" width="1" height="1" />
                </form>
            </div>
            <p>
                <strong>You're nearly there!</strong> We'll take you to a secure PayPal page
                to complete your payment.
            </p>
            <p>
                Please note that GameProxy Pro is only refundable by contacting the
                GameProxy admins. You can purchase more than one GameProxy Pro
                membership; if you do the expiry date will be appended to match your
                new payment.
            </p>
        </div>
    `, [
        {text: "Cancel", onclick: "closeDialog();", type: "bad"},
        {text: "Back", onclick: "usePayPal();", type: "bad"}
    ]);
}

function useCodeAction() {
    window.location.replace("paymentRequest.html?token=" + encodeURIComponent(btoa(enteredCode.replace(/\//g, "-").replace(/ /g, ""))));
}

function useCode() {
    dialog("Use voucher or code", `
        <div class="center">
            <h2>Enter the code you wish to redeem</h2>
            <p>Get GameProxy Pro by using a voucher or special code!</p>
            <div>
                <input autocomplete="off" spellcheck="off" class="center monospace" id="enteredCode"></input>
            </div>
        </div>
    `, [
        {text: "Cancel", onclick: "closeDialog();", type: "bad"},
        {text: "Next", onclick: "useCodeNext();", type: "primary"}
    ]);

    $("#enteredCode").keydown(function(e) {
        if (e.keyCode == 13) {
            useCodeNext();
        }
    });
}

function useCodeNext() {
    enteredCode = $("#enteredCode").val();

    if (enteredCode.replace(/\//g, "-").replace(/ /g, "") == "") {
        dialog("Use voucher or code", `
            <div class="center">
                <p>The code you entered is invalid.</p>
            </div>
        `, [
            {text: "Cancel", onclick: "closeDialog();", type: "bad"},
            {text: "Try Again", onclick: "useCode();", type: "primary"}
        ]);
    } else {
        dialog("Use voucher or code", `
            <div class="center">
                <p>Please wait, checking database...</p>
            </div>
        `, [], false);

        firebase.database().ref("vouchers/" + enteredCode.replace(/\//g, "-").replace(/ /g, "")).once("value", function(snapshot) {
            if (snapshot.val() != null) {
                    dialog("Use voucher or code", `
                        <div>
                            <h2 class="noMargin">GameProxy Pro - ` + (snapshot.val().title == undefined ? "Untitled" : snapshot.val().title.replace(/</g, "&lt;").replace(/>/g, "&gt").replace(/&/g, "&amp;")) + `</h2>
                            <p>
                                By redeeming a voucher or special code to get GameProxy Pro, you agree to
                                the <a href="proTerms.html" target="_blank">GameProxy Pro Terms</a>.
                            </p>
                            <p>
                                <strong>You're nearly there!</strong> All you have to do is press the
                                Redeem button and you'll be getting GameProxy Pro in no time!
                            </p>
                            <p>
                                Please note that GameProxy Pro cannot be refunded when paid for with
                                vouchers or special codes. You can get more than one GameProxy Pro
                                membership; if you do the expiry date will be appended to match your
                                new payment.
                            </p>
                        </div>
                    `, [{text: "Cancel", onclick: "closeDialog();", type: "bad"}, {text: "Back", onclick: "useCode();", type: "bad"}, {text: "Redeem", onclick: "useCodeAction();", type: "primary"}]);
            } else {
                dialog("Use voucher or code", `
                    <div class="center">
                        <p>The code you entered is invalid.</p>
                    </div>
                `, [
                    {text: "Cancel", onclick: "closeDialog();", type: "bad"},
                    {text: "Try Again", onclick: "useCode();", type: "primary"}
                ]);
            }
        });
    }
}