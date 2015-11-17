ortmtApp.ActivateGridCtrl = function(opt_options) {

  var options = opt_options || {};
  var this_ = this;
  var button = document.createElement('button');
  $(button).attr({ "title":'Matrice d\'accrochage',"data-toggle" : 'tooltip'});
  button.innerHTML = '<span class="glyphicon glyphicon-th"></span>';
  var actif = false;
  var theInteraction;
  var vectorGrid;
  var vectorLines;
  var gridSource;
  var linesSource;
  
  var handleClick = function(e) {
	if (actif) {
		this_.getMap().removeInteraction(theInteraction);
		this_.getMap().removeLayer(vectorGrid);
		this_.getMap().removeLayer(vectorLines);
		vectorGrid = '';
		vectorLines = '';
		ortmtApp.alertTool.show({msg : 'Grid et snapping sur grid supprimé.'});
		actif = false;
	} else {
		if (map.getView().getProperties().resolution >= 3) {
		  ortmtApp.alertTool.show({msg : 'Impossible de créer le grid à ce niveau d\'échelle, veuillez zoomer davantage.',level:'danger'});
		} else {
		  var step = Math.max(1,Math.floor(map.getView().getProperties().resolution*7));
		  createVectorGrid(this_, step);
		  //vectorGrid.set('selectable', false);
		  this_.getMap().addLayer(vectorGrid);
		  this_.getMap().addLayer(vectorLines);
		  moveLayerBefore(findLayer('GridLines'),findLayer('vector'));
		  theInteraction = new ol.interaction.Snap({
		  	source: gridSource
		  });
		  this_.getMap().addInteraction(theInteraction);
		  ortmtApp.alertTool.show({msg : 'Grid et snapping sur grid de taille ' + step + 'm créé pour la vue courrante.'});
		  actif = true;
		}
	}
  };
  
  
  var createVectorGrid = function(this_, step) {
	var emprise = map.getView().calculateExtent(map.getSize());
	var dx = 1 + Math.floor(emprise[2] - emprise[0]);
	var x0 = Math.floor(emprise[0]);
	var dy = 1 + Math.floor(emprise[3] - emprise[1]);
	var y0 = Math.floor(emprise[1]);
	var step = step || 1;
	var li = 0;
	var i = 0;
	var features = new Array(Math.ceil(dx/step)*Math.ceil(dy/step));
	var lineFeat = new Array(Math.floor(dx/step)+Math.floor(dy/step));
	
  
	for (var x = x0; x <= x0 + dx; x = x + step) {
	  for (var y = y0; y <= y0 + dy; y = y + step) {
	    features[i++] = new ol.Feature(new ol.geom.Point([x,y]));
		if (x == x0) {
		  lineFeat[li++] = new ol.Feature(new ol.geom.LineString([[x,y],[x+dx,y]]));
		} else if (y == y0) {
		  lineFeat[li++] = new ol.Feature(new ol.geom.LineString([[x,y],[x,y+dy]]));
		 }
	  }
	}
	
	gridSource = new ol.source.Vector({
		features: features
	});
	
	vectorGrid = new ol.layer.Vector({
		source: gridSource
		,style : gridStyle
		,name : 'GridPoints'
	});
	
	linesSource = new ol.source.Vector({
		features: lineFeat
	});
	
	vectorLines = new ol.layer.Vector({
		source: linesSource
		,style : lineGridStyle
		,name : 'GridLines'
	});

  };

  button.addEventListener('click', handleClick, false);
  button.addEventListener('touchstart', handleClick, false);

  var element = document.createElement('div');
  element.className = 'grid-tool ol-unselectable ol-control';
  element.appendChild(button);

  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });

};
ol.inherits(ortmtApp.ActivateGridCtrl, ol.control.Control);
