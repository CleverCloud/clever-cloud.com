var scrollSpeed = 90;
var current = 0;
	
function graphscroll(){
	current -=1;
	$("#home-page").css("background-position", current+"px 100%" );
	$("#home-fuel-wrap").css("background-position",current+"px 00%");
	$("#home-page").css("background-position");
	//console.log('$("#home-page").css("background-position);
//}
//var init = setInterval("graphscroll()", scrollSpeed); 

// Get color of canvas

function movingPoints() {
  var d1 = $('div.span8 div.row:last div.span4:first p:first');
  var d2 = $('div.span8 div.row:last div.span4:last p:first');
  var x1 = d1.offset().top - d1.height() + 2;
  var x2 = d2.offset().top - d2.height() + 2;

  function rgbToHex(r, g, b) {
      if (r > 255 || g > 255 || b > 255)
          throw "Invalid color component";
      return ((r << 16) | (g << 8) | b).toString(16);
  }

  function h2d(h) {return parseInt(h,16);}
  
  function getColor(x, y) {
    var c = document.getElementById('canvas-1').getContext('2d');
    var p = c.getImageData(x, y, 1, 1).data; 
    var hex = ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
    return h2d(hex);
  }

  function move(x) {
    for (y = 100; y > 0; y--) {  
      var p = getColor(x,y);
      var pminus = getColor(x,y-1);
      var pplus = getColor(x,y+1);

      if (pminus != p) {
        var pplusmin = getColor(x+1, y-1);
        var pminmin = getColor(x-1, y-1);
        if (pplusmin == p) {
          // descendre
        }
        else if (pplusmin != p) {
          // monter
        }
        else if (pplusmin != p && pminmin != p) {y++; continue;}
      }
      else if (pplus != p) {y++; continue;}
      else {continue;}
    }
  }
  move(x1);
  move(x2);
}

// create waves

function init() {
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
    var size2 = canvas.width / 280 +1;
    var size3 = canvas.width / 500 + 1;
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
        store["wave2"+i].scaleX = 0.70;
        store["wave2"+i].scaleY = 2;
        store["wave2"+i].x = canvas.width - 280 * i;

        store["wave3"+i] = new createjs.Bitmap(e.target);
        store["wave3"+i].scaleX = 1;
        store["wave3"+i].scaleY = 2;
        store["wave3"+i].x = canvas.width - 500 * i;

        createjs.Tween.get(store["wave" + i], {loop:true}).to({x:canvas.width - (300 * (Math.floor(size) + i)), y:0}, 100000);
        createjs.Tween.get(store["wave2"+i], {loop:true}).to({x:canvas.width - (280 * (Math.floor(size2) + i)), y:0}, 75000);
        createjs.Tween.get(store["wave3"+i], {loop:true}).to({x:canvas.width - (500 * (Math.floor(size3) + i)), y:0}, 60000);

        stage.addChild(store["wave" + i]);
        stage.addChild(store["wave2" + i]);
        stage.addChild(store["wave3" + i]);

        stage.update();
      }
      createjs.Ticker.addListener(store);
    	movingPoints();
    }
  }
launch();
}
var init = setInterval("graphscroll()", scrollSpeed); 
