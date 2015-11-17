
ortmtApp.swipeTool = function(opt_options) {

  var options = opt_options || {};
  var this_ = this;
  var messageHolder = document.createElement('span');
  swipe = document.createElement('input');
  $(swipe).attr({ "title":'Swiper',"id" : 'swipe', 'type':'range', 'style':'width: 100%', 'value':'100', 'max':'100', 'min':'0', 'step':'.1'});
  messageHolder.appendChild(swipe);
  
  $(messageHolder).attr({ "id":'swipetool_placeholder'});
  
  var handleClick = function(e) {
	this_.getMap().render();
  };

 
  swipe.addEventListener('input', handleClick, false); //ff et chrome
  swipe.addEventListener('change', handleClick, false); //ie11

  ol.control.Control.call(this, {
    element: messageHolder,
    target: options.target
  });
  
};
ol.inherits(ortmtApp.swipeTool, ol.control.Control);

