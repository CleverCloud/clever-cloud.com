$(function() {
   $('#carousel')
      .carousel();
});

var Pricer = (function() {

   var W = function(oo) {
      this.options = oo;
      this.initialize(oo);
   };

   var p = W.prototype = new EventProducer();

   p.initialize_event = p.initialize;

   p.initialize = function(oo) {
      /* Default values */
      this.flavorName   = oo.flavorName;
      this.flavor       = oo.flavor;
      this.minInstances = oo.minInstances || 1;
      this.maxInstances = oo.maxInstances || 4;
      this.price        = oo.price;

      /* On data receiving */
      this.addEventListener('prices.onload', _.bind(this.onprices, this));
      this.addEventListener('instances.onload', _.bind(this.oninstances, this));
      this.addEventListener('flavors.onload', _.bind(this.onflavors, this));

      /* On data selection */
      this.addEventListener('price.onselect', _.bind(this.onprice, this));
      this.addEventListener('instance.count.onselect', _.bind(this.oncount, this));
      this.addEventListener('instance.flavor.onselect', _.bind(this.onflavor, this));
      this.addEventListener('instance.type.onselect', _.bind(this.oninstance, this));

      /* Get data */
      if(oo.prices) {
         this.fireEvent('prices.onload', oo.prices);
      }
      else {
         $.ajax({
            url: 'https://console.clever-cloud.com/ccapi/v1/prices',
            datatype: 'jsonp',
            success: _.bind(function(pp) {
               this.fireEvent('prices.onload', pp);
            }, this)
         });
      }
      if(oo.instances) {
         this.fireEvent('instances.onload', oo.instances);
      }
      else {
         $.ajax({
            url: 'https://console.clever-cloud.com/ccapi/v1/instances',
            datatype: 'jsonp',
            success: _.bind(function(ii) {
               this.fireEvent('instances.onload', ii);
               $('.cc-pricing').fadeTo(300,1).removeClass("cc-opacity__zero");
            }, this)
         });
      }

      /* Configure the range slider */
      this.options.elem.find(".range_slider")
         .editRangeSlider({
            arrows: false,
            step:   1,
            bounds: {
               min: 1,
               max: 30
            },
            defaultValues: {
               min: this.minInstances,
               max: this.maxInstances
            }
         })
         .bind("valuesChanged", _.bind(function(e, data) {
            this.fireEvent('instance.count.onselect', data.values);
         }, this));

      /* Configure the simple slider */
      this.options.elem.find('.simple_slider')
         .slider({
            step: 1,
            min:  1,
            max:  30,
            stop: _.bind(function(e, data) {
               this.fireEvent('instance.count.onselect', {
                  min: data.value,
                  max: data.value
               });
            }, this)
         });

      /* Change slider, depending on checkbox value */
      this.options.elem.find('.autoscaleout').change(_.bind(function() {
         this.options.elem.find('.simple_slider').toggle().slider('option', 'value', this.minInstances);
         this.options.elem.find('.range_slider').toggle().editRangeSlider('values', this.minInstances, this.minInstances);
      }, this));

      this.fireEvent('instance.count.onselect', {
         min: this.minInstances,
         max: this.maxInstances
      });
   };

   /* Listeners */
   p.onprices = function(pp) {
      pp = typeof pp == 'string' ? JSON.parse(pp) : pp;
      this.fireEvent('price.onselect', _.find(pp, function(p) {
         return p.currency.toUpperCase() == 'EUR';
      }));
   };

   p.oninstances = function(ii) {
      ii = typeof ii == 'string' ? JSON.parse(ii) : ii;
      _.chain(ii)
         .map(function(i) {
            i.group = _.find(i.tags, function(t) {
               return (/^cat-/).test(t);
            }) || '';
            return i;
         })
         .filter(function(i) {
            return i.group.length > 0;
         })
         .groupBy(function(i) {
            return i.group;
         })
         .map(function(ii) {
            return _.first(ii);
         })
         .foldl(function($ii, i, n, ii) {
            var $i = $(this.options.$instance(i));
            $i.css('width', Math.floor(100 / ii.length) + '%');
            $i.click(_.bind(function() {
               $ii.find('.active').removeClass('active');
               $i.addClass('active');
               this.fireEvent('instance.type.onselect', i);
            }, this));

            if(n == 0) {
               $i.addClass('active');
               $i.css('width', (100 - (ii.length - 1) * Math.floor(100 / ii.length)) + '%');
               this.fireEvent('instance.type.onselect', i);
            }

            return $ii.append($i);
         }, this.options.elem.find('.instances').empty(), this)
         .value();
   };

   p.onflavors = function(ff) {
      _.chain(ff)
         .map(function(f) {
            // Let's consider a flavor is a range of flavor containing itself only
            return _.extend(f, {
               minFlavor: f,
               maxFlavor: f
            });
         })
         .union([{
            name:       'Optimize',
            minFlavor:  _.min(ff, function(f) { return f.price; }),
            maxFlavor:  _.max(ff, function(f) { return f.price; })
         }])
         .sortBy(function(f) {
            return f.price || 0;
         })
         .foldl(function($ff, f, n, ff) {
            var $f = $(this.options.$flavor(_.extend(f, {
               //description: (f.mem && f.cpus) ? f.mem + ' MB, ' + f.cpus + ' CPUs' : ' ',
               memDesc: (f.mem) ? f.mem + ' MB' : '<img src="/assets/img/64px/auto-resize.png" style="max-height: 32px;">',
               cpuDesc: (f.cpus) ? f.cpus + ' CPUs' : ''
            })));
            $f.css('width', (100 / ff.length) + '%');
            $f.click(_.bind(function() {
               this.fireEvent('instance.flavor.onselect', f);
            }, this));

            if(this.flavorName && f.name == this.flavorName) {
               $f.addClass('active');
               this.fireEvent('instance.flavor.onselect', f);
            }
            else if(!this.flavorName && n === 0) {
               $f.addClass('active');
               this.fireEvent('instance.flavor.onselect', f);
            }

            return $ff.append($f);
         }, this.options.elem.find('.flavors').empty(), this)
         .value();
   };

   p.onprice = function(p) {
      this.price = p;
      this.estimate();
   };

   p.oninstance = function(i) {
      this.instance = i;

      this.options.elem.find('.result .instance-type').text(i.group.replace(/^cat-/, ''));
      this.fireEvent('flavors.onload', i.flavors);
   };

   p.onflavor = function(f) {
      this.flavor = f;

      this.options.elem.find('.result .instance-flavor').text(f.price ? f.name : f.name + ' (' + f.minFlavor.name + ' — ' + f.maxFlavor.name + ')');
      this.estimate();
   };

   p.oncount = function(c) {
      this.minInstances = Math.round(c.min);
      this.maxInstances = Math.round(c.max);

      this.options.elem.find('.result .instance-count').text(this.minInstances == this.maxInstances ? this.minInstances : 'Auto-Scale (' + this.minInstances + ' to ' + this.maxInstances + ')');
      this.estimate();
   };

   /* Price estimation */
   p.estimate = function() {
      if(this.price && this.flavor && this.minInstances && this.maxInstances) {
         var min = Math.round(720 * 6 * 100 * this.price.value * (this.flavor.price || this.flavor.minFlavor.price) * this.minInstances) / 100;
         var max = Math.round(720 * 6 * 100 * this.price.value * (this.flavor.price || this.flavor.maxFlavor.price) * this.maxInstances) / 100;

         var f = function(n) {
            return Math.round(n*100).toString().replace(/(..)$/, '.$1');
         };

         this.options.elem.find('.result .price').text(
            (min == max) ? f(min) + '€' : f(min) + '€ - ' + f(max) + '€'
         );
      }
   };

   return W;
})();

$(function() {
   var p = new Pricer({
      elem: $('.cc-pricing'),

      flavorName: 'S',
      maxInstances: 3,

      $flavor:    _.template('<button type="button" class="btn flavor cc-btn-big cc-btn-big-with-title" ><h4 class="cc-btn-big__title"><%= name %></h4><div class="cc-btn-big__details"><%= cpuDesc %></div><div class="cc-btn-big__details"><%= memDesc %></div></button>'),
      $instance:  _.template('<button type="button" class="btn instance cc-btn-big <%= group.replace(/^cat-/, "").replace("/", "-", "g").toLowerCase() %>" onClick="_gaq.push(["_trackEvent", "Pricing-simulator", "Select Instance", "<%= group.replace(/^cat-/, "") %>"]);"><%= group.replace(/^cat-/, "") %></button>')
   });
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
      window.location.href = "http://www.clever-cloud.com/hello.html";
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
