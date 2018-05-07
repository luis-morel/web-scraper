$(document).ready(function () {

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

        // event.preventDefault();

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