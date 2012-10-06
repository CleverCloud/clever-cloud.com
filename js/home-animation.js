var scrollSpeed = 90;
var current = 0;
	
function graphscroll(){
	current -=1;
	$("#home-page").css("background-position", current+"px 100%" );
	$("#home-fuel-wrap").css("background-position",current+"px 00%");
	$("#home-page").css("background-position");
	//console.log('$("#home-page").css("background-position);
}
var init = setInterval("graphscroll()", scrollSpeed); 
