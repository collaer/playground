ortmtApp.ActivateRotCabCCtrl = function(opt_options) {

  var options = opt_options || {};
  var this_ = this;
  var bufferSize = 3;
  var button = document.createElement('button');
  button.innerHTML = '<span class="glyphicon glyphicon-repeat"></span>';
  $(button).attr({ "title":'Rotation 90° d\'une cabine détaillée',"data-toggle" : 'tooltip'});
  var actif = false;
  var initialCabine;
  var initialExtent;
  var finalCabine;
  
  var select = new ol.interaction.Select({
    style: overlayEditStyle,
    layers: [vectorLayer]
  });

  var handleClick = function(e) {
	if (actif) {
		select.getFeatures().un('add', getMyLiasons);
		removeSelection();
		map.removeInteraction(select);
		ortmtApp.alertTool.show({msg : 'Rotation 90° de cabine détaillée désactivée.'});
		actif = false;
	} else {
		map.addInteraction(select);
		select.getFeatures().on('add', getMyLiasons);
		removeSelection();
		ortmtApp.alertTool.show({msg : 'Rotation de 90° de cabine détaillée a été activé.'});
		actif = true;
	}
  };
  
  var removeSelection = function() {
	  select.getFeatures().clear();
  };

  button.addEventListener('click', handleClick, false);
  button.addEventListener('touchstart', handleClick, false);

  var element = document.createElement('div');
  element.className = 'edit-cabr-tool ol-selectable ol-control';
  element.appendChild(button);

  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
  
  var removeMyLiasons = function(e) {
	deplaced(e);
	// A supprimer dès que nouvelle version OpenLayers et que l'event translateend est ready
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
			var rotationCenter = initialCabine.getCentroid();
			var angle = Math.PI / 2;
			rotateAll(rotationCenter, angle);
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
  
  var rotateAll = function(rotationCenter, angle) {
    var WKTreader = new jsts.io.WKTReader();
	var WKTformat = new ol.format.WKT();
	var parser = new jsts.io.olParser();
	
	var extent = initialExtent;
	extent[0]=extent[0] - bufferSize;
    extent[1]=extent[1] - bufferSize;
    extent[2]=extent[2] + bufferSize;
    extent[3]=extent[3] + bufferSize;
	var buffered = initialCabine.buffer(bufferSize);
	var objetEdition = [];
	for (var i = 0; i < vectorLayer.getSource().getFeaturesInExtent(extent).length; i++) {
	  var OLfeature = vectorLayer.getSource().getFeaturesInExtent(extent)[i];
	  var laGeom = OLfeature.getGeometry();
	  if(typeof laGeom !== 'undefined' && laGeom != null && laGeom != ""){
	    var aGeom = parser.read(laGeom);
		if (buffered.intersects(aGeom) == true) {
		  objetEdition[i] = {OBJECTTYPE: OLfeature.getProperties()['OBJECTTYPE'], ID: OLfeature.getProperties()['ID'], geom : null};
		  var coordinates = laGeom.getCoordinates();
		  switch(laGeom.getType()) {
		    case 'LineString':
			  objetEdition[i]['geom'] = 'LINESTRING' + computeLinesCoordinates([coordinates], buffered, WKTreader, rotationCenter, angle);			
			break;
			case 'MultiLineString':
			  objetEdition[i]['geom'] = 'MULTILINESTRING(' + computeLinesCoordinates(coordinates, buffered, WKTreader, rotationCenter, angle) +')';
			break;
			case 'Point':
			  var rotatedPoint = rotatePoint(WKTreader, aGeom, rotationCenter, angle);
			  objetEdition[i]['geom'] = 'POINT('+(rotatedPoint.getX())+' '+(rotatedPoint.getY())+')';
			break;
			case 'Polygon':
			  objetEdition[i]['geom'] = 'POLYGON((' + computePolygonCoordinates(coordinates[0], buffered, WKTreader, rotationCenter, angle)+ '))';
			break;
			default:
			  console.log('Unexpected geometry type : '+laGeom.getType() + ' we\'ll try to skip that.');
			break;
		  }; //end switch
		} else console.log('Not intersected ?!!!! why ?????????');
	  } else console.log('null geometry ?');
	  removeSelection();
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
  
    var computePolygonCoordinates = function(coordinates, buffered, WKTreader, rotationCenter, angle) {
	   var newGeometry = '';
	   for (var k = 0; k < coordinates.length ; k++) {
         if (k > 0 ) newGeometry = newGeometry + ','; 
		 
		 var cpoint = coordinates[k];
		 var wktPoint = 'POINT('+cpoint[0]+' '+cpoint[1]+')';
		 var jstsPoint = WKTreader.read(wktPoint); 
		 var newPoint;
		 if (buffered.contains(jstsPoint) == true) {
		   newPoint = rotatePoint(WKTreader, jstsPoint, rotationCenter, angle)
		 } else {
		   newPoint = jstsPoint;
		 }
		   newGeometry = newGeometry + newPoint.getX() + ' ' + newPoint.getY();
	   }
	   return newGeometry;
  };
  
 
    var computeLinesCoordinates = function(coordinates, buffered, WKTreader, rotationCenter, angle) {
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
			var newPoint;
			if (buffered.contains(jstsPoint) == true) {
			   newPoint = rotatePoint(WKTreader, jstsPoint, rotationCenter, angle)
			 } else {
			   newPoint = jstsPoint;
			 }
			newGeometryString = newGeometryString + newPoint.getX() + ' ' + newPoint.getY();
		 }
	   };
	   newGeometryString = newGeometryString + ')';
	   return (newGeometryString);
  };
  
  var rotatePoint = function(WKTreader, point, rotationCenter, angle) {
    var deltaX = point.getX() - rotationCenter.getX();
	var deltaY = point.getY() - rotationCenter.getY();
	var vector = {x:null,y:null};
	vector.x = -1*deltaX;
	vector.y = -1*deltaY;
	var rotatedVector = rotateVector(vector, angle);
	var rotatedwktPoint = 'POINT('+(rotationCenter.getX()+ rotatedVector.x)+' '+(rotationCenter.getY()+rotatedVector.y)+')';
	return (WKTreader.read(rotatedwktPoint)); 
  };
  
  var rotateVector = function(vec, angle) {
    return {x : vec.x * Math.cos(angle) - vec.y * Math.sin(angle), y : vec.x * Math.sin(angle) + vec.y * Math.cos(angle)};
  };
    
  
};
ol.inherits(ortmtApp.ActivateRotCabCCtrl, ol.control.Control);
