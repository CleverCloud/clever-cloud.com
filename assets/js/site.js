$(function() {
   $('#carousel')
      .carousel();
});

$(function() {;
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
         range_min: 1,
         range_max: 4,
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
            min: this.current.range_min,
            max: this.current.range_max
         }
      });
   };
   
   // 
   p.publishTech = function() {
      this.options.elem.find(".choose_tech_group").append(_.map(this.pricelist, function(i){
         return '<button type="button" class="btn">'+i.name+'</button>'
      }).join());
      this.fireEvent('tech_published');
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
   new Pricer({
      elem: $('.pricing_evaluation')
   });
});
