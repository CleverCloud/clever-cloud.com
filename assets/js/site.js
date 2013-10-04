$(function() {
   $('#carousel')
      .carousel();
});

// initialisation Pricer
$(document).ready(function () {
  if(window.location.href.indexOf("pricing") > -1) {
    $(function() {
      var p = new Pricer({
        elem: $('.cc-pricing'),
        maxInstances: 3,
        $flavor:    _.template('<button type="button" class="btn flavor cc-btn-big cc-btn-big-with-title" ><h4 class="cc-btn-big__title"><%= name %></h4><div class="cc-btn-big__details"><%= cpuDesc %></div><div class="cc-btn-big__details"><%= memDesc %></div></button>'),
        $instance:  _.template('<button type="button" class="btn instance cc-btn-big <%= group.replace(/^cat-/, "").replace("/", "-", "g").toLowerCase() %>" onClick="_gaq.push(["_trackEvent", "Pricing-simulator", "Select Instance", "<%= group.replace(/^cat-/, "") %>"]);"><%= group.replace(/^cat-/, "") %></button>')
      });
    });
  }
});

// Helper flavors
var hideDefaultHelp = function() {
  $('#cc-pricing__default__help').hide();
}

var showDefaultHelp = function() {
  $('#cc-pricing__default__help').fadeIn(400);
}

$('.cc-pricing__flavor-label').hover(
  function () {
    hideDefaultHelp();
    $('#cc-pricing__flavor-label__help').fadeIn(400);
  }, 
  function () {
    showDefaultHelp();
    $('#cc-pricing__flavor-label__help').hide();
  }
);

// Helper autoscale
$('.cc-pricing__autoscaleout').hover(
  function () {
    hideDefaultHelp();
    $('#cc-pricing__autoscaleout__help').fadeIn(400);
  }, 
  function () {
    showDefaultHelp();
    $('#cc-pricing__autoscaleout__help').hide();
  }
);

// Helper autoscale
$('.cc-pricing__price').hover(
  function () {
    hideDefaultHelp();
    $('#cc-pricing__price__help').fadeIn(400);
  }, 
  function () {
    showDefaultHelp();
    $('#cc-pricing__price__help').hide();
  }
);

// Signup input
$(".cc_subscribe__input").focusout(function(e) {
  if ($(e.target).val() != "") {
    $(e.target).addClass("formvalidated");
  }
})

$(".cc_subscribe__input").focusin(function(e) {
  $(e.target).removeClass("formvalidated");
});

// Signup button
$(".cc_subscribe__btn").click(function(e) {
  e.preventDefault();
  e.stopPropagation();
  var email = $(".cc_subscribe__form input[name='email']").val();
  var password = $(".cc_subscribe__form input[name='pass']").val();
  var terms = $(".cc_subscribe__form input[name='terms']").is(":checked");
  $.ajax({
    type: "POST",
    headers: {"Content-Type":"application/json"},
    url: "https://console.clever-cloud.com/ccapi/v1/users",
    data: JSON.stringify({
      email: email,
      password: password,
      terms: terms
    }),
    success: function(e) {
      window.location.href = "http://www.clever-cloud.com/en/hello.html";
    },
    error: function(e) {
      var temp = JSON.parse(e.responseText);
      $(".help-email").text("");
      $(".help-pwd").text("");
      $(".help-check").text("");

      $(".help-email").text(temp.fields.email);
      $(".help-pwd").text(temp.fields.password);
      $(".help-check").text(temp.fields.terms);
    }
  })
})


var urlList = ["tour", "pricing", "compatibility"];
_.each(urlList, function(x, y) {
  var y = x + ".html";
  if (_.contains(window.location.pathname.split( '/' ), y)) {
    $($(".nav-" + x)[0]).addClass("active");
  }
})

// custom jquery plugin loadText()
$.fn.randomText = function( textArray, interval, randomEle, prevText ) {
    var obj = $(this);
    if( $('#text-content').length == 0 ){ obj.append('<div id="text-content">'); }
    var textCont = $('#text-content');
    textCont.fadeOut( 'slow', function() {
        var chosenText = random_array( textArray );
        while( chosenText == prevText ) { chosenText = random_array( textArray ); }
        textCont.empty().html( chosenText );
        textCont.fadeIn( 'slow' );
        sendText = chosenText;
    });
    timeOut = setTimeout( function(){ obj.randomText( textArray, interval, randomEle, sendText ); }, interval );
    $("#randomizer").click( function(){
        if( !textCont.is(':animated') ) { clearTimeout( timeOut ); obj.randomText( textArray, interval, randomEle, sendText );} // animation check prevents "too much recursion" error in jQuery 
    });
}
//public function
function random_array( aArray ) {
    var rand = Math.floor( Math.random() * aArray.length + aArray.length );
    var randArray = aArray[ rand - aArray.length ];
    return randArray;
}

//Testimonials
var testimonials = [{
    "content": "My blog migrated to CleverCloud this night. Impressed by how fast it is!",
    "author": "Jeremie Berrebi, @jberrebi",
    "job_title": "Venture capitalist",
    "photo_url": "\/assets\/img\/testimonials\/jberrebi.jpg"
}, {
    "content": "Many reasons to go for Clever Cloud :)",
    "author": "Maxime Alay-Eddine, @tarraschk",
    "job_title": "Founder of Argaus",
    "photo_url": "\/assets\/img\/testimonials\/tarraschk.jpg"
}, {
    "content": "Something that you should test!",
    "author": "Tugdual Grall, @tgrall",
    "job_title": "Technical Evangelist @couchbase",
    "photo_url": "\/assets\/img\/testimonials\/tgrall.png"
}, {
    "content": "Our projet at Angelhack is hosted on Clever Cloud! It's really nice and fast!",
    "author": "Jonathan Winandy, @ahoy_jon",
    "job_title": "BI Platform Engineer at Viadeo",
    "photo_url": "\/assets\/img\/testimonials\/ahoy_jon.jpg"
}];
var currentTestimonial = 0;
$(function () {
    setInterval(cycleTestimonial, 7000);
});

function cycleTestimonial() {
    if (!testimonials) {
        return;
    }
    if (testimonials.length == currentTestimonial + 1) {
        currentTestimonial = 0;
    } else {
        currentTestimonial++;
    }
    $('.testimonials-quote').fadeTo('slow', 0, function () {
        var cur = testimonials[currentTestimonial];
        $('.cc_quote-text span').html(cur.content);
        $('.cc_quote-author span').html(cur.author);
        $('.cc_quote-job span').html(cur.job_title);
        $('.cc_quote-author img').attr('src', cur.photo_url);
    }).fadeTo('fast', 1);
}

$(".cc_compatibility_head").click(function(e) {
  if (e.target.href != "http://console.clever-cloud.com/auth/signup") {
    e.preventDefault();
    e.stopPropagation();
    $('html, body').animate({
      scrollTop: $($(e.target).attr("data-anchor")).offset().top
    }, 500);
  };
});

$(".cc_pricing__services__listelt").click(function(e) {
  var newservice = $(this).attr("data-service");
  $($(".cc_pricing__services__list .selected")[0]).removeClass("selected");
  $(this).addClass("selected");

  $($(".cc_pricing__services__list__tables .selected")[0]).removeClass("selected");
  $(".cc_pricing__services__list__tables" + " ." + newservice).addClass("selected");
})
