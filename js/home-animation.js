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

var stage;
function tick() {
  stage.update();
}

function init() {
  var canvas = document.getElementById('canvas-1');
  stage = new createjs.Stage(canvas);
  stage.autoClear = true;
  
  var img = new Image();
  img.src = "../img/wave-top.png";
  img.onload = function(e){
    var title = new createjs.Bitmap(e.target);
    title.scaleX = 1;
    title.scaleY = 2.1;    
     var tween = createjs.Tween.get(title, {loop:true})
                 .to({x:canvas.width, y:0}, 5000);
    stage.addChild(title);
    stage.update();
  }
  createjs.Ticker.addListener(window);
}
