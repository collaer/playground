ortmtApp.ActivateDragCabCCtrl = function(opt_options) {

  var options = opt_options || {};
  var this_ = this;
  var bufferSize = 3;
  var button = document.createElement('button');
  button.innerHTML = '<span class="glyphicon glyphicon-move"></span>';
  $(button).attr({ "title":'Déplacer une cabine détaillée',"data-toggle" : 'tooltip'});
  var actif = false;
  var initialCabine;
  var initialExtent;
  var finalCabine;
  
  var select = new ol.interaction.Select({
    style: overlayEditStyle,
    layers: [vectorLayer]
  });

  var translation = new ol.interaction.Translate({
    style: overlayEditStyle,
    layers: [vectorLayer],
	features: select.getFeatures()
  });
  
  var handleClick = function(e) {
	if (actif) {
		
		select.getFeatures().un('add', getMyLiasons);
		//select.getFeatures().un('remove', removeMyLiasons);
		translation.un('translateend', deplaced);
		removeSelection();
		map.removeInteraction(select);
		map.removeInteraction(translation);
		ortmtApp.alertTool.show({msg : 'Déplacement de cabine détaillée désactivée.'});
		actif = false;
	} else {
		map.addInteraction(select);
		map.addInteraction(translation);
		translation.on('translateend', deplaced); //pas disponible dans la version 3.10.1 mais déjà dans le master : https://github.com/openlayers/ol3/blob/v3.10.1/src/ol/interaction/translateinteraction.js versus https://github.com/openlayers/ol3/blob/master/src/ol/interaction/translateinteraction.js)
		select.getFeatures().on('add', getMyLiasons);
		//select.getFeatures().on('remove', removeMyLiasons);
		removeSelection();
		ortmtApp.alertTool.show({msg : 'Déplacement de cabine détaillée a été activé.'});
		actif = true;
	}
  };
  
  var removeSelection = function() {
	  select.getFeatures().clear();
  };

  button.addEventListener('click', handleClick, false);
  button.addEventListener('touchstart', handleClick, false);

  var element = document.createElement('div');
  element.className = 'edit-cabt-tool ol-selectable ol-control';
  element.appendChild(button);

  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
  
  var removeMyLiasons = function(e) {
      //map.removeInteraction(translation);
  };
  
  var getMyLiasons = function(e) {
      select.getFeatures().un('add', getMyLiasons);
	  if (e.target.getLength() == 1){
	    var CabinFeature = e.target.item(0);
		if("OBJECTTYPE" in CabinFeature.getProperties())
		{
		  if (CabinFeature.getProperties()["OBJECTTYPE"] == 'CABIN' && CabinFeature.getProperties()["ISCOMPLEX"] == 1){
			var parser = new jsts.io.olParser();
		    initialCabine = parser.read(CabinFeature.getGeometry());
			initialExtent = CabinFeature.clone().getGeometry().getExtent(); //attention référence ici, il faut cloner !
		} else {
		     //pas une cabine complexe
			 removeSelection();
		   }
		 }
		 else
		 {
		   //depuis que tous les objets ont un objecttype cela ne devrait plus être utile
		   removeSelection();
		 }
	  } //Plus d'un objet a été sélectionné
	  else removeSelection();
	  select.getFeatures().on('add', getMyLiasons);
  };
  
  var deplaced = function(e) {
	var parser = new jsts.io.olParser();
	var WKTformat = new ol.format.WKT();
	var WKTreader = new jsts.io.WKTReader();
	
	finalCabine = parser.read(e.features.getArray()[0].getGeometry());
	var finalExtent = e.features.getArray()[0].getGeometry().getExtent();
	removeSelection();
	var deltaX = finalExtent[0] - initialExtent[0];
	var deltaY = finalExtent[1] - initialExtent[1];
    var extent = initialExtent;
	extent[0]=extent[0] - bufferSize;
    extent[1]=extent[1] - bufferSize;
    extent[2]=extent[2] + bufferSize;
    extent[3]=extent[3] + bufferSize;
	var buffered = initialCabine.buffer(bufferSize);
	var objetEdition = [];
	//vectorSource.addFeature(new ol.Feature(parser.write(buffered)));
	for (var i = 0; i < vectorLayer.getSource().getFeaturesInExtent(extent).length; i++) {
	  var OLfeature = vectorLayer.getSource().getFeaturesInExtent(extent)[i];
	  var laGeom = OLfeature.getGeometry();
	   if(typeof laGeom !== 'undefined' && laGeom != null && laGeom != "" && OLfeature.getProperties()['OBJECTTYPE'] != 'CABIN'){
		 var aGeom = parser.read(laGeom);
		 if (buffered.intersects(aGeom) == true) {
		   objetEdition[i] = {OBJECTTYPE: OLfeature.getProperties()['OBJECTTYPE'], ID: OLfeature.getProperties()['ID'], geom : null};
		   var coordinates = laGeom.getCoordinates();
		   switch(laGeom.getType()) {
		     case 'LineString':
			   objetEdition[i]['geom']	= 'LINESTRING' + computeMyCoordinates([coordinates], buffered, WKTreader, deltaX, deltaY);	
			 break;
		     case 'MultiLineString':
			   objetEdition[i]['geom']	= 'MULTILINESTRING(' + computeMyCoordinates(coordinates, buffered, WKTreader, deltaX, deltaY) + ')';		   
			 break;
			 case 'Point':
			   var wktPoint = 'POINT('+(laGeom.getCoordinates()[0]+deltaX)+' '+(laGeom.getCoordinates()[1]+deltaY)+')';
			   objetEdition[i]['geom']=wktPoint; 
			   //ol.format.WKT.prototype.writeGeometry(laGeom);
			 break;
			 default:
			   console.log('Unexpected geometry type : '+laGeom.getType() + ' we skip that.');
			 break;
		   }
		 }; // else console.log(' !!!!!!!!!!!!!!!!! dont intersect, this message should never happend ?!');
	   }; //else console.log(' !!!!!!!!!!!!!!!!! Null geometry or cabin');
	}
	
	//All gemetry are computed, now we can access them and correct (cannot be done in the loop before, otherwise while iterating this will change geometry order inside the list)
	//Since the the features recieved by getFeaturesInExtent(extent) return pointers to geometries
	for (var i = 0; i < objetEdition.length; i++) {
	  //rechercher la geom correspondante
	  var theOne;
	  if (typeof objetEdition[i] !== 'undefined' && objetEdition[i] != null && objetEdition[i] != "") {
		  for (var j = 0; j < vectorLayer.getSource().getFeaturesInExtent(extent).length; j++) {
			theOne = vectorLayer.getSource().getFeaturesInExtent(extent)[j];
			if (theOne.getProperties()['OBJECTTYPE'] == objetEdition[i]["OBJECTTYPE"] && theOne.getProperties()['ID'] == objetEdition[i]["ID"])
			  break;
		  }
		  //editer sa geom
		  var feature = WKTformat.readFeature(objetEdition[i]["geom"]);
		  theOne.setGeometry(feature.getGeometry());
	  }
	}
	//var geojson = ol.format.GeoJSON.prototype.writeFeatures(vectorLayer.getSource().getFeaturesInExtent(extent));
	//$('#geojson-delta-area')[0].value = geojson;	
  };
  
  var computeMyCoordinates = function(coordinates, buffered, WKTreader, deltaX, deltaY) {
       //coordinates : listes de linestring
	   //linestring = liste de points (minimum 2 items)
	   var newGeometryString = '(';
	   
	   for (var i = 0; i < coordinates.length; i++) {
	     newGeometryString = newGeometryString + (i==0?'':'),(');
		 var linestring = coordinates[i];

		 for (var j = 0; j < linestring.length; j++) {
		   newGeometryString = newGeometryString + (j==0?'':',');
		   var point = linestring[j];
			var wktPoint = 'POINT('+point[0]+' '+point[1]+')';
			var jstsPoint = WKTreader.read(wktPoint); 
			var newX, newY;
			if (buffered.contains(jstsPoint) == true) {
			   newX = point[0] + deltaX;
			   newY = point[1] + deltaY;
			 } else {
			   newX = point[0];
			   newY = point[1];
			 }
			newGeometryString = newGeometryString + newX + ' ' + newY;
		 }
	   };
	   newGeometryString = newGeometryString + ')';
	   return (newGeometryString);
  };
  
  $(document).keyup(function(e) {
    if (e.keyCode == 27) {
		removeSelection();
	}
  });
  
};
ol.inherits(ortmtApp.ActivateDragCabCCtrl, ol.control.Control);
