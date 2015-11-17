var devMode = true;

var mdf = 'Library://POC_ORTO/ORTOMT.MapDefinition';
var agentUrl = 'http://localhost:8008/mapguide/mapagent/mapagent.fcgi?USERNAME=Anonymous';
var MapGuideProtocoleVersion = '3.0.0';

if (devMode) {
  MapGuideProtocoleVersion = '2.0.0';
  mdf = 'Library://Applications/Schmt/Schématique MT.MapDefinition';
  agentUrl = 'http://netgis.url/mapserver2012/mapagent/mapagent.fcgi?USERNAME=Anonymous';
  $('#infoOres')[0].innerHTML = 'dev mode';
}

var bounds = [0,0,450000,450000];



/**
* Init vector layer & data from grosjason geojson FME export file
*/
var arrayLength = Allmyjasons.length;
var vectorSource;
var editsVectorSource = new ol.source.Vector();
  
for (var i = 0; i < arrayLength; i++) {
	if (i == 0)	{
		vectorSource = new ol.source.Vector({
			features: (new ol.format.GeoJSON()).readFeatures(Allmyjasons[i])
		});
	}else{
		vectorSource.addFeatures( (new ol.format.GeoJSON()).readFeatures(Allmyjasons[i]) );
	}
}
var vectorLayer = new ol.layer.Vector({
  source: vectorSource,
  style: styleFunction,
  name: 'vector'
});

/**
* Init Mapguide ORTMT background layer
*/
var ortmapguide = new ol.layer.Image({
  extent: bounds,
  name : 'mapguide',
  source: new ol.source.ImageMapGuide({
	projection: 'EPSG:31370',
	url: agentUrl,
	useOverlay: false,
	metersPerUnit: 1,
	params: {
	  MAPDEFINITION: mdf,
	  FORMAT: 'PNG',
	  VERSION : MapGuideProtocoleVersion
	},
	ratio: 2
  })
});

/**
* Init map
*/
var map = new ol.Map({
  layers: [
	vectorLayer,
	ortmapguide	
  ],
  target: 'map',
  view: new ol.View({
    center: [99023,50644],
    zoom: 19
  })
});

	var zoomslider = new ol.control.ZoomSlider();
	var fullMan = new ol.control.FullScreen();
	map.addControl(zoomslider);
	map.addControl(fullMan);
	
	var swipe = document.createElement('input');
	ortmapguide.on('precompose', function(event) {
	  var ctx = event.context;
	  var width = ctx.canvas.width * (swipe.value / 100);

	  ctx.save();
	  ctx.beginPath();
	  ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height);
	  ctx.clip();
	});
	ortmapguide.on('postcompose', function(event) {
	  var ctx = event.context;
	  ctx.restore();
	});

//For the lol uncomment and click drag on map : 
//map.addInteraction(new ol.interaction.DragRotateAndZoom());

//petites méthode map à consolider dans un objet 'carte'
   var ZoomTo = function(x,y,zl) {
     zl = zl || 21;
	 var view = new ol.View({
      center: [x,y],
      zoom: zl
    });
	map.setView(view);
   };
   
   
 var moveLayerBefore = function (old_idx, new_idx){
    if((old_idx === -1) || (new_idx === -1)){
        return false;
    }

    layer = map.getLayers().removeAt(old_idx);
    map.getLayers().insertAt(new_idx, layer);
};

var findLayer = function(layer_name){
    var layer_idx = -1;
    $.each(map.getLayers().getArray(), function (k,v){
        var this_layer_name = v.get('name');
        if(this_layer_name == layer_name){
            layer_idx = k;
        }
    });

    return layer_idx;
}

   
/*   
// Create the graticule component
var graticule = new ol.Graticule({
  // the style to use for the lines, optional.
  strokeStyle: new ol.style.Stroke({
    color: 'rgba(255,255,255,0.5)',
    width: 2,
    lineDash: [0.5, 4]
  })
});
graticule.setMap(map);
*/