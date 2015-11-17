ortmtApp.ActivateEditCabCCtrl = function(opt_options) {

  var options = opt_options || {};
  var this_ = this;
  var bufferSize = 1;
  var button = document.createElement('button');
  button.innerHTML = '<span class="glyphicon glyphicon-edit"></span>';
  $(button).attr({ "title":'Editer intérieur cabine détaillée',"data-toggle" : 'tooltip'});
  var actif = false;
  
  var select = new ol.interaction.Select({
    style: overlayEditStyle,
    layers: [vectorLayer]
  });

  var modify = new ol.interaction.Modify({
    features: select.getFeatures(),
    style: overlayEditStyle,
    layers: [vectorLayer]
  });
  
  var handleClick = function(e) {
	if (actif) {
		modify.un('modifyend', modified);
		select.getFeatures().un('add', getMyLiasons);
		select.getFeatures().un('remove', removeMyLiasons);
		map.removeInteraction(select);
		map.removeInteraction(modify);
		ortmtApp.alertTool.show({msg : 'Edition de cabine détaillée désactivée.'});
		actif = false;
	} else {
		map.addInteraction(select);
		map.addInteraction(modify);
		modify.on('modifyend', modified);
		select.getFeatures().on('add', getMyLiasons);
		select.getFeatures().on('remove', removeMyLiasons);
		select.getFeatures().clear();
		ortmtApp.alertTool.show({msg : 'L\'édition de cabine détaillée a été activée.'});
		actif = true;
	}
  };
    
  var removeSelection = function() {
	select.getFeatures().clear();
  };

  button.addEventListener('click', handleClick, false);
  button.addEventListener('touchstart', handleClick, false);

  var element = document.createElement('div');
  element.className = 'edit-cabc-tool ol-selectable ol-control';
  element.appendChild(button);

  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
  
  var removeMyLiasons = function(e) {
    
  };
  
  var getMyLiasons = function(e) {
      select.getFeatures().un('add', getMyLiasons);
	  if (e.target.getLength() == 1){
	    var CabinFeature = e.target.item(0);
		if("OBJECTTYPE" in CabinFeature.getProperties())
		{
		  if (CabinFeature.getProperties()["OBJECTTYPE"] == 'CABIN' && CabinFeature.getProperties()["ISCOMPLEX"] == 1){
			  var extent = CabinFeature.getGeometry().getExtent();
			  extent[0]=extent[0] - bufferSize;
			  extent[1]=extent[1] - bufferSize;
			  extent[2]=extent[2] + bufferSize;
			  extent[3]=extent[3] + bufferSize;
			  //Note : Utiliser jsts est une sécurité inutile vu l'utilisation de getFeaturesInExtent depuis ol3		  
              var parser = new jsts.io.olParser();
		      var jstsGeom = parser.read(CabinFeature.getGeometry());
		      var buffered = jstsGeom.buffer(bufferSize);
		      for (var i = 0; i < vectorLayer.getSource().getFeaturesInExtent(extent).length; i++) {
			    var laGeom = vectorLayer.getSource().getFeaturesInExtent(extent)[i].getGeometry();
			    if(typeof laGeom !== 'undefined' && laGeom != null && laGeom != ""){
				  var aGeom = parser.read(laGeom);
			      if (buffered.intersects(aGeom) == true)
				  {
			        //dont push the same feature several times !
					if (jstsGeom.equals(aGeom) == false)
					{
					  select.getFeatures().push(vectorLayer.getSource().getFeaturesInExtent(extent)[i]); 
					}
				  }
				}
		      }
			}
		  else
		   {
		     //pas une cabine complexe
			 select.getFeatures().clear();
		   }
		 }
		 else
		 {
		   //depuis que tous les objets ont un objecttype cela ne devrait plus être utile
		   select.getFeatures().clear();
		 }
	  } //Plus d'un objet a été sélectionné
	  else select.getFeatures().clear();
	  select.getFeatures().on('add', getMyLiasons);
  };
  
 
  
  var modified = function(e) {
	//var geojson = ol.format.GeoJSON.prototype.writeFeatures(e.features.a);
	//$('#geojson-delta-area')[0].value = geojson;	
  };
  
  
  $(document).keyup(function(e) {
    if (e.keyCode == 27) {
		select.getFeatures().clear();
	}
  });
  
};
ol.inherits(ortmtApp.ActivateEditCabCCtrl, ol.control.Control);
