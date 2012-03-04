$(document).ready(function() {
    $('#signup-form').submit(function() {
        var mail = $("#signup-email").val();

        $.ajax({
            type: "POST",
            url: "http://www.clever-cloud.com/resources/mail/add",
            data: "betasignup=" + mail,
			statusCode: {
				200: function() {
	                //ajouter un p && supprimer des éléments
	                $('#signup-form').empty();
	                $('#signup-form').append('<p class="subscribe_success">Mail ok</p>');
	            },
				401: function() {
					//ajouter un p && supprimer des éléments
	                $('#signup-form').empty();
	                $('#signup-form').append('<p class="subscribe_fail">Mail already exists existe</p>');
			    },
				404: function() {
	                //ajouter un p && supprimer des éléments
	                $('#signup-form').empty();
	                $('#signup-form').append('<p class="subscribe_fail">404 error. Sorry about that</p>');
	            },
				500: function() {
	                //ajouter un p && supprimer des éléments
	                $('#signup-form').empty();
	                $('#signup-form').append('<p class="subscribe_fail">Oops, somethiung went wrong… and we have no whale.</p>');
	            },
			  }
        });
        return false;
    });
});