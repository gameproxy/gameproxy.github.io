$(function() {
    $("*[import]").each(function() {
        if (!window.location.href.startsWith("file:///")) {
            $.ajax({
                url: $(this).attr("import"),
                error: function() {
                    $(this).html("Could not load associated information.");
                }
            }).done(function(data) {
                $(this).html(data);
            });
        } else {
            $(this).html("<em>Content will go here at run-time: " + $(this).attr("import") + "</em>");
        }
    });
});

$(function() {
    $("*[markdown]").each(function() {
        if (!window.location.href.startsWith("file:///")) {
            $.ajax({
                url: $(this).attr("markdown"),
                error: function() {
                    $(this).html("Could not load associated information.");
                }
            }).done(function(data) {
                $(this).html(new showdown.Converter().makeHtml(data));
            });
        } else {
            $(this).html("<em>Content will go here at run-time: " + $(this).attr("markdown") + "</em>");
        }
    });
});