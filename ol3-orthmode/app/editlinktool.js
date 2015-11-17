ortmtApp.ActivateEditLinkCtrl = function(opt_options) {

  var options = opt_options || {};
  var this_ = this;
  var button = document.createElement('button');
  button.innerHTML = '<span class="glyphicon glyphicon-link"></span>';
  $(button).attr({ "title":'Editer une liaison',"data-toggle" : 'tooltip'});
  var actif = false;
  var select = new ol.interaction.Select({
    style: overlayEditStyle,
    layers: [vectorLayer],
	filter : function(feature) {
	  if("OBJECTTYPE" in feature.getProperties() && feature.getProperties()["OBJECTTYPE"] == 'LINK'){
		
		return true;
	  }
	  return false;
	}
  });
  var modify = new ol.interaction.Modify({
    features: select.getFeatures(),
    style: overlayEditStyle,
    layers: [vectorLayer]
  });
  
  var handleClick = function(e) {
	if (actif) {
		map.removeInteraction(select);
		map.removeInteraction(modify);
		ortmtApp.alertTool.show({msg : 'Edition des liaisons désactivée.'});
		actif = false;
	} else {
		
		map.addInteraction(select);
		map.addInteraction(modify);
		ortmtApp.alertTool.show({msg : 'L\'édition des liaisons a été activée.'});
		actif = true;
	}
  };

  button.addEventListener('click', handleClick, false);
  button.addEventListener('touchstart', handleClick, false);

  var element = document.createElement('div');
  element.className = 'edit-lia-tool ol-selectable ol-control';
  element.appendChild(button);

  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
  
   $(document).keyup(function(e) {
    if (e.keyCode == 27) {
		select.getFeatures().clear();
	}
  });

};
ol.inherits(ortmtApp.ActivateEditLinkCtrl, ol.control.Control);
