//var scrollSpeed = 90;
//var current = 0;
	
//function graphscroll(){
//	current -=1;
//	$("#home-page").css("background-position", current+"px 100%" );
	//$("#home-fuel-wrap").css("background-position",current+"px 00%");
	//$("#home-page").css("background-position");
	//console.log('$("#home-page").css("background-position);
//}
//var init = setInterval("graphscroll()", scrollSpeed); 

// Get color of canvas

/*function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

var c = getElementById('canvas-1').getContext('2d');
var p = c.getImageData(x, y, 1, 1).data; 
var hex = ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);

if (hex_right > "efefef") {
  // monter
}
else if (hex_left > "efefef" || hex_down <= "efefef") {
 // descendre
}*/

function init(){
  var stage;

  var store = {
    tick: function() {
      stage.update();
    }
  };

function launch() {
  var canvas = document.getElementById('canvas-1');
  stage = new createjs.Stage(canvas);
  stage.autoClear = true;
  var size = canvas.width / 278.25 + 1;  
  // original image size(371) / scaleX = size
  var img = new Image();
  img.src = "../img/wave-top.png";
  img.onload = function(e){
    for (var i = -size; i < size; i++) {
      store["wave" + i]	= new createjs.Bitmap(e.target);
      store["wave" + i].scaleX = 0.75;
      store["wave" + i].scaleY = 2.2;
      store["wave" + i].x = canvas.width - 278.25 * i;
      createjs.Tween.get(store["wave" + i], {loop:true}).to({x:canvas.width - (278.25 * (Math.floor(size) + i)), y:0}, 100000);
      stage.addChild(store["wave" + i]);
      stage.update();
    }
  }
  createjs.Ticker.addListener(store);
}
launch();
}
