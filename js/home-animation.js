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

function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

function getColor(x, y) {
  var c = document.getElementById('canvas-1').getContext('2d');
  var p = c.getImageData(x, y, 1, 1).data; 
  var hex = ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
  
  var pplus = c.getImageData(x, y+1,1,1).data;
  var hexplus = ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
  var pminus = c.getImageData(x, y-1,1,1).data;
  var hexminus = ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
  var pplusmin = c.getImageData(x-1, y-1,1,1).data;
  var hexplusmin = ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
  var ppminmin = c.getImageData(x-1, y-1,1,1).data;
  var hexminmin = ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);

  if (pminus != p) {
    if (pplusmin == p) {
      // descendre
    }
    else if (pplusmin != p) {
      // monter
    }
    else if (pplusmin != p && pminmin != p) {
    	// pas bouger
    }
  }
  else if (pplus != p) {getColor(x, y+1)}
  else {getColor(x, y-1)}
}

/*if (hex_right > "efefef") {
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
  var size = canvas.width / 300 + 1;
  var size2 = canvas.width / 200 + 1;
  var size3 = canvas.width / 400 + 1
  // original image size / scaleX = size
  var img = new Image();
  img.src = "../img/vague3.png";
  img.style.opacity = "0.5";
  img.onload = function(e){
    for (var i = -size; i < size; i++) {
      store["wave" + i]	= new createjs.Bitmap(e.target);
      store["wave" + i].scaleX = 0.75;
      store["wave" + i].scaleY = 2;
      store["wave" + i].x = canvas.width - 300 * i;
      
      store["wave2"+i] = new createjs.Bitmap(e.target);
      store["wave2"+i].scaleX = 0.5;
      store["wave2"+i].scaleY = 2;
      store["wave2"+i].x = canvas.width - 200 * i;

      store["wave3"+i] = new createjs.Bitmap(e.target);
      store["wave3"+i].scaleX = 1;
      store["wave3"+i].scaleY = 2;
      store["wave3"+i].x = canvas.width - 400 * i;
      store["wave3" + i].y = 70; 

      createjs.Tween.get(store["wave" + i], {loop:true}).to({x:canvas.width - (300 * (Math.floor(size) + i)), y:0}, 100000);
      createjs.Tween.get(store["wave2"+i], {loop:true}).to({x:canvas.width - (200 * (Math.floor(size2) + i)), y:0}, 80000);
      createjs.Tween.get(store["wave3"+i], {loop:true}).to({x:canvas.width - (400 * (Math.floor(size3) + i)), y:0}, 60000);

      stage.addChild(store["wave" + i]);
      stage.addChild(store["wave2"+i]);
      stage.addChild(store["wave3"+i]);

      stage.update();
    }
    createjs.Ticker.addListener(store);
  }
}
launch();
}
