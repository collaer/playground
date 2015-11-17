ortmtApp.ActivateSnapCtrl = function(opt_options) {

  var options = opt_options || {};
  var this_ = this;
  var button = document.createElement('button');
  button.innerHTML = '<span class="glyphicon glyphicon-magnet"></span>';
  $(button).attr({ "title":'Accrochage',"data-toggle" : 'tooltip'});
  var snapInteraction = new ol.interaction.Snap({
    source: vectorSource
  });
  var snapActif = false;
  
  var handleClick = function(e) {
	if (snapActif) {
		this_.getMap().removeInteraction(snapInteraction);
		ortmtApp.alertTool.show({msg : 'Le snapping sur couche vectoriel a été désactivé.'});
		snapActif = false;
	} else {
		this_.getMap().addInteraction(snapInteraction);
		ortmtApp.alertTool.show({msg : 'Le snapping sur couche vectoriel est activé.'});
		snapActif = true;
	}
  };

  button.addEventListener('click', handleClick, false);
  button.addEventListener('touchstart', handleClick, false);

  var element = document.createElement('div');
  element.className = 'snap-tool ol-unselectable ol-control';
  element.appendChild(button);

  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });

};
ol.inherits(ortmtApp.ActivateSnapCtrl, ol.control.Control);
