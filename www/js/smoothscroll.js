$(function() {
  var scrollElement = $("html");
  var scrollValue = scrollElement.scrollTop();
  if (scrollElement.scrollTop(scrollValue + 1).scrollTop() == scrollValue) {
    scrollElement = $("body");
  }
  else {
    scrollElement.scrollTop(scrollValue);
  }
  $("a[href*=#]").click(function() {
    if (location.hostname+location.pathname+location.search == this.hostname+this.pathname.replace(/^([^\/].*)/, "/$1")+this.search) {
      var hash = "#"+$(this).attr("href").split("#")[1];
      var target = $(hash == "#" ? body : hash);
      if (target.length) {
        var id = target.attr("id");
        target.attr("id", "");
        location.hash = hash;
        target.attr("id", id);
        var to = Math.min(target.offset().top, $(document).height() - $(window).height());
        scrollElement.animate({ scrollTop: to }, {
          duration: Math.abs($(window).scrollTop() - to) * 0.95,
          complete: function() { target.focus(); }
        });
        return false;
      }
    }
  });
});

