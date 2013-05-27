$(function() {
   $('#carousel')
      .carousel();
});
//Animation of Service lists
$('.cc_service__list .cc_service__item img').addClass('hide');
$(document).scroll(function() {
var top = $(document).scrollTop();
if (top > 150) {
  $('.cc_service__list .cc_service__item img').each(function(i){
    var t = $(this);
    setTimeout(function(){ t.removeClass('hide').addClass('animated fadeInRight'); }, (i+1) * 50);
  });
}
else {
    $('.cc_instance__list .cc_instance__item img').css('opacity:0');
}
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
               max: 40
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
            max:  40,
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
         .groupBy(function(i, n) {
           return Math.floor(n / 6);
         })
         .foldl(function($II, I, N) {
            return $II.append(_.foldl(I, function($ii, i, n) {
               var $i = $(this.options.$instance(i));
               $i.css('width', Math.floor(100 / I.length) + '%');
               $i.click(_.bind(function() {
                  $II.find('.active').removeClass('active');
                  $i.addClass('active');
                  this.fireEvent('instance.type.onselect', i);
               }, this));

               if(n == 0 && N == 0) {
                  $i.addClass('active');
                  $i.css('width', (100 - (I.length - 1) * Math.floor(100 / I.length)) + '%');
                  this.fireEvent('instance.type.onselect', i);
               }

               return $ii.append($i);
            }, $(this.options.$instances()), this));
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
               memDesc: (f.mem) ? f.mem + ' MB' : '',
               cpuDesc: (f.cpus) ? f.cpus + ' CPUs' : '',
            })));
            $f.css('width', (100 / ff.length) + '%');
            $f.click(_.bind(function() {
               this.fireEvent('instance.flavor.onselect', f);
            }, this));

            if(n === 0) {
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

      this.options.elem.find('.result .instance-type').text(i.name);
      this.fireEvent('flavors.onload', i.flavors);
   };

   p.onflavor = function(f) {
      this.flavor = f;

      this.options.elem.find('.result .instance-flavor').text(f.price ? f.name : f.name + ' (' + f.minFlavor.name + ' to ' + f.maxFlavor.name + ')');
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
            (min == max) ? f(min) + '€' : f(min) + '€ to ' + f(max) + '€'
         );
      }
   };

   return W;
})();

$(function() {
   var p = new Pricer({
      elem: $('.cc-pricing'),

      $flavor:    _.template('<button type="button" class="btn flavor cc-btn-big cc-btn-big-with-title"><h4 class="cc-btn-big__title"><%= name %></h4><div class="cc-btn-big__details"><%= cpuDesc %></div><div class="cc-btn-big__details"><%= memDesc %></div></button>'),
      $instance:  _.template('<button type="button" class="btn instance cc-btn-big"><%= name %></button>'),
      $instances: _.template('<div class="btn-group cc-btn-group-big"></div>')
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
    $('#cc-pricing__flavor-label__help').fadeIn(100);
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
    $('#cc-pricing__autoscaleout__help').fadeIn(100);
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
    $('#cc-pricing__price__help').fadeIn(100);
  }, 
  function () {
    showDefaultHelp();
    $('#cc-pricing__price__help').hide();
  }
);
