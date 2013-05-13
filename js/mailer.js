$(document).ready(function() {
    $('#signup-form').submit(function() {
        var mail = encodeURIComponent($("#signup-email").val());

        $.ajax({
            type: "POST",
            url: "http://www.clever-cloud.com/resources/mail/add",
            data: "betasignup=" + mail,
			statusCode: {
				200: function() {
	                $('#signup-email').hide();
					$('#signup-button').hide();
	                $('#subscribe_success').show("fast");
	            },
				401: function() {
	                $('#signup-email').hide();
					$('#signup-button').hide();
	                $('#subscribe_error_401').show("fast");
			    },
				404: function() {
	                $('#signup-email').hide();
					$('#signup-button').hide();
	                $('#subscribe_error_404').show("fast");
	            },
				500: function() {
	                $('#signup-email').hide();
					$('#signup-button').hide();
	                $('#subscribe_error_500').show("fast");
	            },
			  }
        });
        return false;
    });
});
