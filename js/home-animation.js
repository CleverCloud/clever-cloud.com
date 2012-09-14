var scrollSpeed = 90;
var current = 0;
	
function graphscroll(){
	current -=1;
	$("#home-page").css("background-position-x",current+"px");
	$("#home-fuel-wrap").css("background-position-x",current+"px");
}
var init = setInterval("graphscroll()", scrollSpeed); 
