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
            url: 'https://console.clever-cloud.com/ccapi/dev/prices',
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
            url: 'https://console.clever-cloud.com/ccapi/dev/instances',
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

      this.fireEvent('instance.count.onselect', {
         min: this.minInstances,
         max: this.maxInstances
      });
   };

   /* Listeners */
   p.onprices = function(pp) {
      this.fireEvent('price.onselect', _.find(pp, function(p) {
         return p.currency.toUpperCase() == 'EUR';
      }));
   };

   p.oninstances = function(ii) {
      _.foldl(ii, function($ii, i, n) {
         var $i = $(this.options.$instance(i));
         $i.click(_.bind(function() {
            this.fireEvent('instance.type.onselect', i);
         }, this));

         if(n === 0) {
            $i.addClass('active');
            this.fireEvent('instance.type.onselect', i);
         }

         return $ii.append($i);
      }, this.options.elem.find(".choose_tech_group").empty(), this);
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
            name:       'Autoscalability',
            minFlavor:  _.min(ff, function(f) { return f.price; }),
            maxFlavor:  _.max(ff, function(f) { return f.price; })
         }])
         .sortBy(function(f) {
            return f.price || 0;
         })
         .foldl(function($ff, f, n) {
            var $f = $(this.options.$flavor(_.extend(f, {
               description: (f.mem && f.cpus) ? f.mem + ' MB, ' + f.cpus + ' CPUs' : ' '
            })));
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

      this.options.elem.find('.result .instance-flavor').text(f.name);
      this.estimate();
   };

   p.oncount = function(c) {
      this.minInstances = c.min;
      this.maxInstances = c.max;

      this.options.elem.find('.result .instance-count').text(Math.round(c.min) + ' to ' + Math.round(c.max));
      this.estimate();
   };

   /* Price estimation */
   p.estimate = function() {
      if(this.price && this.flavor && this.minInstances && this.maxInstances) {
         var min = Math.round(750 * 6 * 100 * this.price.value * (this.flavor.price || this.flavor.minFlavor.price) * this.minInstances) / 100;
         var max = Math.round(750 * 6 * 100 * this.price.value * (this.flavor.price || this.flavor.maxFlavor.price) * this.maxInstances) / 100;

         this.options.elem.find('.result .price').text(
            (min == max) ? min + '€' : min + '€/' + max + '€'
         );
      }
   };

   return W;
})();

$(function() {
   var p = new Pricer({
      elem: $('.pricing_evaluation'),

      $flavor:    _.template('<button type="button" class="btn flavor"><h4><%= name %></h4><%= description %></button>'),
      $instance:  _.template('<button type="button" class="btn instance"><%= name %></button>')
   });
});
