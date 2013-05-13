$(function(){
   $('#carousel').carousel();
});

$(function(){
   $("#range_slider").editRangeSlider();;
});



// 

$(function(){
   $.ajax({
      url:'https://console.clever-cloud.com/ccapi/dev/instances',
      datatype:'jsonp',
      onSuccess:function(i){
         console.log(i);
      }
   });
});