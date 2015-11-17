ortmtApp.ErrorGridCtrl = function(opt_options) {

  var options = opt_options || {};
  var this_ = this;
  var button = document.createElement('button');
  button.innerHTML = '<span class="glyphicon glyphicon-remove-circle"></span>';
  $(button).attr({ "title":'Visualiser les anomalies',"data-toggle" : 'tooltip', 'data-loading-text':".."});
  var actif = false;
  var elementGrid = document.createElement('div');
  elementGrid.className = "grid-container";
  var grid = document.createElement('table');
  grid.className = "table table-striped";
  var redLining;
  var redLiningSource;
  
  var handleClick = function(e) {
	if (actif) {
		$(elementGrid).css( "display", "none" );
		this_.getMap().removeLayer(redLining);
		actif = false;
	} else {
	    $(grid).remove();
		if (devMode)
		  initLayer(staticErrorJason);
		else
		  alloFME();
		actif = true;
	}
  };
  
  var alloFME = function() {
    var $btn = $(this).button('loading');
	var geojson = ol.format.GeoJSON.prototype.writeFeatures(vectorLayer.getSource().getFeatures());
	
	$.ajax({
       url : 'check.php',
       type : 'POST', 
       dataType : 'html',
	   data : 'Jason=' + encodeURIComponent(geojson),
	   success : function(code_html, statut) {
	     ortmtApp.alertTool.show({msg : 'La validation des éditions a été réalisée',level:'danger'});
		 $btn.button('reset');
		 this_.getMap().render();
	   }
    }).done(function(response) {
	  var errorjason = $.parseJSON(response);
	  if ( errorjason != '' && (errorjason.length == 0 || typeof(errorjason.length) == 'undefined'))
		  errorjason = [errorjason];
	  initLayer(errorjason);
	});
  };
  
  var initLayer = function(errorjason) {
    for (var i = 0; i < errorjason.length; i++) {
		if (i == 0)	{
			redLiningSource = new ol.source.Vector({
				features: (new ol.format.GeoJSON()).readFeatures(errorjason[i])
			});
		}else{
			redLiningSource.addFeatures( (new ol.format.GeoJSON()).readFeatures(errorjason[i]) );
		}
	}
	redLining = new ol.layer.Vector({
	  source: redLiningSource,
	  style: overlayStyle,
	  name: 'redLining'
	});

	this_.getMap().addLayer(redLining);

	grid = document.createElement('table');
	grid.className = "table table-striped";
	grid.innerHTML = "<tr><td><strong>Type</strong></td><td><strong>Message</strong></td><td><strong>Localiser</strong></td></tr>" + populateGrid(errorjason);
	elementGrid.appendChild(grid);

	$(elementGrid).show();	
  };
  
  var populateGrid = function(errorjason) {
     var htmlresponse = '';
	 var geojsonparser = new jsts.io.GeoJSONParser()
	 for (var i = 0; i < errorjason.length; i++) {
	   //console.log(errorjason[i]);
	   var features = errorjason[i]["features"];
	   var type = errorjason[i]["name"];
	   for (var j = 0; j < features.length; j++) {
		 var geom = geojsonparser.read(features[j]);
		 var centroide = geom.geometry.getCentroid();
		 htmlresponse = htmlresponse + '<tr><td><strong><font color="red">'+type+'</font></strong></td><td>'+features[j]["properties"]["TEXT"]+'</td><td align="center"><a href="javascript:void(null)" OnClick="ZoomTo(' + centroide.getX() + ',' + centroide.getY() + ');"><span class="glyphicon glyphicon-zoom-in"></a></td></tr>';
	   };
	   
	 }
	 
	 
	 return htmlresponse;
	 /*
	 	$.ajax({
       url : 'brol.php',
       type : 'POST', 
       dataType : 'html',
	   data : 'Jason=' + encodeURIComponent(geojson),
	   success : function(code_html, statut) {
	     ortmtApp.alertTool.show({msg : 'Le plan a été mis à jour',level:'danger'});
		 $btn.button('reset');
		 map.renderSync();
	   }
    });
	 */
  };

  button.addEventListener('click', handleClick, false);
  button.addEventListener('touchstart', handleClick, false);

  var element = document.createElement('div');
  element.className = 'error-tool ol-unselectable ol-control';
  element.appendChild(button);
  elementGrid.appendChild(grid);
  element.appendChild(elementGrid);
  $(elementGrid).hide();

  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });

};
ol.inherits(ortmtApp.ErrorGridCtrl, ol.control.Control);
