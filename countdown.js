var countdownDate = new Date("Nov 24, 2018 16:00:00").getTime();

function pad(n, width, z) {
  z = z || "0";
  n = n + "";
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

setInterval(function() {
    var now = new Date().getTime();
    
    var distance = countdownDate - now;

    if (distance <= 0) {
        window.location.href = "index.html";
    } else {
        $(".days").text(pad(Math.floor(distance / (1000 * 60 * 60 * 24)), 2));
        $(".hours").text(pad(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)), 2));
        $(".minutes").text(pad(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)), 2));
        $(".seconds").text(pad(Math.floor((distance % (1000 * 60)) / 1000), 2));
        $(".millis").text(pad(pad(Math.floor((distance % (1000 * 60))), 5).substring(2, 4), 2));

        $(".days").css("color", "#8449fc");
        $(".hours").css("color", "#8449fc");
        $(".minutes").css("color", "#8449fc");
        $(".seconds").css("color", "#8449fc");

        if (Math.floor(distance / (1000 * 60 * 60 * 24)) == 0) {
            $(".days").css("color", "#7e7e7e");

            if (Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) == 0) {
                $(".hours").css("color", "#7e7e7e");

                if (Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)) == 0) {
                    $(".minutes").css("color", "#7e7e7e");

                    if (Math.floor((distance % (1000 * 60)) / 1000) == 0) {
                        $(".seconds").css("color", "#7e7e7e");
                    }
                }
            }
        }

        
    }
}, 1);