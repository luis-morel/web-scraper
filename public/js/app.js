$(document).ready(function () {

    $(document).on("click", "#commentDelete", function (event) {

        // event.preventDefault();
        var comment = { commentId: $(this).attr("data-id") };
        var headline = { headlineId: $("#commentInput").attr("data-id") };

        $.ajax({
            method: "DELETE",
            url: "/comments/" + comment.commentId,
            data: headline
        })
            .then(function (result) {
                var url = window.location.origin + "/comments/" + headline.headlineId;
                window.location.assign(url);
            });

    });

    $(document).on("click", "#commentButton", function (event) {

        event.preventDefault();
        var headline = { headlineId: $(this).attr("data-id") };

        $.ajax({
            method: "GET",
            url: "/comments",
            data: headline
        })
            .then(function (pathname) {
                var url = window.location.origin + pathname;
                window.location.assign(url);
            });

    });

    $("#commentInput").on("keyup", function (event) {

        if (event.which == 13) {

            var comment = { message: $(this).val().trim() };
            var headlineId = $(this).attr("data-id")

            $("#commentInput").val("");

            $.ajax({
                method: "POST",
                url: "/comments/" + headlineId,
                data: comment
            })
                .then(function () {
                    var url = window.location.origin + "/comments/" + headlineId;
                    window.location.assign(url);
                });

        };


    });

});