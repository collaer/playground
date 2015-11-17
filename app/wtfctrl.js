ortmtApp.ActivateLol = function(opt_options) {

  var options = opt_options || {};
  var this_ = this;
  var button = document.createElement('button');
  button.innerHTML = '?!';
  $(button).attr({ "title":'Pas cliquer ici !',"data-toggle" : 'tooltip'});
  var actif = false;
  
  var handleClick = function(e) {
	this_.getMap().getView().setRotation(Math.floor((Math.random() * 2) + 1) / Math.PI);
	var rotateLeft = ol.animation.rotate({duration: 5000, rotation: Math.PI*2 });
	map.beforeRender(rotateLeft);
	actif = true;
  };

  button.addEventListener('click', handleClick, false);
  button.addEventListener('touchstart', handleClick, false);

  var element = document.createElement('div');
  element.className = 'lol-tool ol-unselectable ol-control';
  element.appendChild(button);

  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });

};
ol.inherits(ortmtApp.ActivateLol, ol.control.Control);