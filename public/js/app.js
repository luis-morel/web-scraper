$(document).ready(function () {

    $(document).on("click", "#commentButton", function (event) {

        event.preventDefault();

        var headlineId = $(this).attr("data-id");

        $.ajax({
            method: "GET",
            url: "/comments/" + headlineId,
        })
        .then(function (dbData) {
            console.log("[Ajax GET] dbData:\n", dbData);
        })
        .catch(function (error) {
            if (error) throw error;
        });

    });

});