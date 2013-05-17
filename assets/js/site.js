$(function() {
   $('#carousel')
      .carousel();
});

var Pricer = (function() {

   var W = function(o) {
      this.initialize(o);
   };

   var p = W.prototype = new EventProducer();

   p.initialize_event = p.initialize;

   p.initialize = function(o) {
      this.initialize_event({
         waitFor: {
            'ready': ['pricelist_loaded', 'money_loaded']
         }
      });
      this.addEventListener('pricelist_loaded', _.bind(this.publishTech, this));
      this.addEventListener('instance.type.onselect', _.bind(function(i) {
         this.options.elem.find('.result .instance-type').text(i.name);
         this.displayFlavors(i.flavors);
      }, this));
      this.addEventListener('instance.count.onselect', _.bind(function(data) {
         this.options.elem.find('.result .instance-count').text(Math.round(data.min) + ' to ' + Math.round(data.max));
      }, this));
      this.addEventListener('instance.flavor.onselect', _.bind(function(f) {
         this.options.elem.find('.result .instance-flavor').text(f.name);
      }, this));
      
      $.ajax({
         url: 'https://console.clever-cloud.com/ccapi/dev/instances',
         datatype: 'jsonp',
         success: _.bind(this.recPricelist, this)
      });
      $.ajax({
         url: 'https://console.clever-cloud.com/ccapi/dev/prices',
         datatype: 'jsonp',
         success: _.bind(this.recPrices, this)
      });
      this.current = {
         tech: '',
         autoscaleout: true,
         min: 1,
         max: 4,
         autoscaleup: true,
         instance_name: []
      };
      this.options = o;

      this.options.elem.find(".range_slider")
         .editRangeSlider({
            arrows: false,
            bounds: {
               min: 1,
               max: 40
            },
            defaultValues: {
               min: this.current.min,
               max: this.current.max
            }
         })
         .bind("valuesChanged", _.bind(function(e, data) {
            this.fireEvent('instance.count.onselect', data.values);
         }, this));
      this.fireEvent('instance.count.onselect', this.current);
   };

   // 
   p.publishTech = function() {
      _.foldl(this.pricelist, function($ii, i, n) {
         var $i = $(this.options.$instance(i));
         $i.click(_.bind(function() {
            this.fireEvent('instance.type.onselect', i);
         }, this));

         if(n === 0) {
            $i.addClass('active');
            this.fireEvent('instance.type.onselect', i);
         }

         return $ii.append($i);
      }, this.options.elem.find(".choose_tech_group"), this);

      this.fireEvent('tech_published');
   };
   p.displayFlavors = function(ff) {
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
   p.recPricelist = function(c) {
      this.pricelist = c;
      this.fireEvent('pricelist_loaded');
   };
   p.recPrices = function(c) {
      this.prices = c;
      this.fireEvent('money_loaded');
   };

   return W;
})();
// 

$(function() {
   var p = new Pricer({
      elem: $('.pricing_evaluation'),

      $flavor:    _.template('<button type="button" class="btn flavor"><h4><%= name %></h4><%= description %></button>'),
      $instance:  _.template('<button type="button" class="btn instance"><%= name %></button>')
   });
});
