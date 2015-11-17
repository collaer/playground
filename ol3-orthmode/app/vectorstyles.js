/**
* Init ORT MT application namespace
*/
window.ortmtApp = {};
var ortmtApp = window.ortmtApp;

ortmtApp.showLabels = false;
ortmtApp.ActivateTextTool = function(opt_options) {

  var options = opt_options || {};
  var this_ = this;
  var button = document.createElement('button');
  button.innerHTML = '<span class="glyphicon glyphicon-font"></span>';
  $(button).attr({ "title":'Afficher les libellés',"data-toggle" : 'tooltip'});
  
  var handleClick = function(e) {
	ortmtApp.showLabels = !ortmtApp.showLabels;
	map.renderSync();
  };

  button.addEventListener('click', handleClick, false);
  button.addEventListener('touchstart', handleClick, false);

  var element = document.createElement('div');
  element.className = 'label-tool ol-unselectable ol-control';
  element.appendChild(button);

  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });

};
ol.inherits(ortmtApp.ActivateTextTool, ol.control.Control);

var getText = function(feature, resolution) {
  if (!ortmtApp.showLabels) return '';
  
  var type = 'normal';
  var maxResolution = 0.314159;
  var text = feature.get('TOOLTIPS');
  //var text = feature.get('ID');

  if (resolution > maxResolution) {
    text = '';
  } else if (type == 'hide') {
    text = '';
  } else if (type == 'shorten') {
    text = text.trunc(12);
  } else if (type == 'wrap') {
    text = stringDivider(text, 16, '\n');
  }
  return text;
};

var createTextStyle = function(feature, resolution) {
  var align = 'left';
  var baseline = 'alphabetic';
  var size = '12px';
  var offsetX = 0;
  var offsetY = 0;
  var weight = 'normal';
  var rotation = 0;
  var font = weight + ' ' + size + ' ' + 'Verdana';
  var fillColor = '#000000';
  var outlineColor = '#ffffff';
  var outlineWidth = 2;

  return new ol.style.Text({
    textAlign: align,
    textBaseline: baseline,
    font: font,
    text: getText(feature, resolution),
    fill: new ol.style.Fill({color: fillColor}),
    stroke: new ol.style.Stroke({color: outlineColor, width: outlineWidth}),
    offsetX: offsetX,
    offsetY: offsetY,
    rotation: rotation
  });
};


var styleFunction = function(feature, resolution) {
	var style;
    var maxResolution = 5.9;    
	if (resolution < maxResolution) {
		var myBeautifullColor = 'black';
		switch(parseInt(feature.get('COLOR'))) {
			case 1:
				myBeautifullColor = 'Red';
			break;
			case 106:
				myBeautifullColor = 'ForestGreen';
			break;
			case 3:
				myBeautifullColor = 'Green';
			break;
			case 204:
				myBeautifullColor = 'BlueViolet';
			break;
			case 221:
				myBeautifullColor = 'Salmon';
			break;
			case 25:
				myBeautifullColor = 'Brown';
			break;
			case 251:
				myBeautifullColor = 'LightGray';
			break;
			case 30:
				myBeautifullColor = 'Chocolate';
			break;
			case 4:
				myBeautifullColor = 'Aqua';
			break;
			case 43:
				myBeautifullColor = 'DarkOliveGreen';
			break;
			case 5:
				myBeautifullColor = 'Blue';
			break;
			case 6:
				myBeautifullColor = 'Fuchsia';
			break;
			case 7:
			case '-':
				myBeautifullColor = 'Black';
			break;
			case 9:
				myBeautifullColor = 'DarkSlateGray';
			break;
			case 92:
				myBeautifullColor = 'Green';
			break;
			case 52:
				myBeautifullColor = 'Yellow';
			break;
			case 142:
				myBeautifullColor = 'Blue';
			break;
			case 191:
				myBeautifullColor = 'Pink';
			break;
			default:
				myBeautifullColor = 'White';
		   }
		   
		switch (feature.getGeometry().getType())
		{
		   case 'Polygon': 
		    d = document.createElement("div");
			d.style.color = myBeautifullColor;
			document.body.appendChild(d);
			//Color in RGB 
			var rgb = window.getComputedStyle(d).color;
			rgb = rgb.replace("rgb","rgba");
			rgb = rgb.replace(")",",0.25)");
			

		   style = [new ol.style.Style({
				text: createTextStyle(feature, resolution),
				stroke: new ol.style.Stroke({
				  color: 'White',
				  //lineDash: [4],
				  width: 1
				}),
				fill: new ol.style.Fill({
				  color: rgb
				})
			  })];
		   break;
		   
		   case 'LineString' :
		   case 'MultiLineString' :
		   style = [new ol.style.Style({
				text: createTextStyle(feature, resolution),
				stroke: new ol.style.Stroke({
				  color: myBeautifullColor,
				  width: 2
				})
			  })];
		   break;
		   
		   case 'Point' :
		    
		   var ssymbol = getBlockStyle(feature, myBeautifullColor);
		   var styles = [];
		   for (i=0;i<ssymbol.length;i++) {
		     styles[i] = new ol.style.Style({
				text: createTextStyle(feature, resolution),
				image: ssymbol[i]
			  });
		   }
		   style = styles;
		   break;
		   default: statement(s)
		}
	}
  return style;
};


var gridStyle = function(feature, resolution) {
  	var broleque = [new ol.style.Style({
      image: new ol.style.RegularShape({
		  fill: new ol.style.Fill({color: 'rgba(255,255,255,0.2)'}),
		  stroke: new ol.style.Stroke({color: 'rgba(255,255,255,0.2)', width: 1}),
		  points: 4,
		  radius: 2,
		  radius2: 0,
		  angle: 0
		})})];
	  
    return [];
};

var lineGridStyle = function(feature, resolution) {
  return [new ol.style.Style({
      stroke: new ol.style.Stroke({color: [205, 205, 205, .5],width: 1})
    })];
};


var getBlockStyle = function(feature, myBeautifullColor) {
  var symbole = [];
  var radius = 8;
  //@todo : make iconstyle for all : 
  //image: new ol.style.Icon({
  //        anchor: [0.5, 0.5],
  //        size: [52, 52],
  //        offset: [52, 0],
  //        opacity: 1,
  //        scale: 0.25,
  //        src: '../assets/img/dots.png'
  //      })
  switch(feature.getProperties()["BLOCKNAME"]) {
    case 'C_200_50':
	//petit triangle sur base vide
	symbole = [new ol.style.RegularShape({
		  stroke: new ol.style.Stroke({color: myBeautifullColor, width: 2}),
		  points: 3,
		  radius: radius / 2,
		  rotation: 0,
		  angle: 0
		})];	
	break;
    case 'C_200_09':
	//triangle sur base plein
	symbole = [new ol.style.RegularShape({
		  fill: new ol.style.Fill({ color: myBeautifullColor}),
		  stroke: new ol.style.Stroke({color: myBeautifullColor, width: 2}),
		  points: 3,
		  radius: radius,
		  rotation: 0,
		  angle: 0
		})];
	break;
    case 'C_200_07':
	//carré barré sur la diagonale quadrant 1-3 vide
	symbole = [new ol.style.RegularShape({
		  stroke: new ol.style.Stroke({color: myBeautifullColor, width: 2}),
		  points: 4,
		  radius: radius,
		  angle: Math.PI / 4
		}),new ol.style.RegularShape({
		  stroke: new ol.style.Stroke({color: myBeautifullColor, width: 2}),
		  points: 2,
		  radius: radius,
		  radius2: 0,
		  angle: Math.PI / 4
		})];	
	break;
    case 'C_200_06':
	//carré plein
	symbole = [new ol.style.RegularShape({
		  stroke: new ol.style.Stroke({color: myBeautifullColor, width: 2}),
		  fill: new ol.style.Fill({ color: myBeautifullColor}),
		  points: 4,
		  radius: radius,
		  angle: Math.PI / 4
		})];	
	break;
    case 'C_200_05':
	//carré vide
	symbole = [new ol.style.RegularShape({
		  stroke: new ol.style.Stroke({color: myBeautifullColor, width: 2}),
		  points: 4,
		  radius: radius,
		  angle: Math.PI / 4
		})];
	break;
    case 'C_200_02':
	  //rond plein
	  symbole = [new ol.style.Circle({
			radius: radius,
			stroke: new ol.style.Stroke({color: myBeautifullColor, width: 2}), 
			fill: new ol.style.Fill({ color: myBeautifullColor})
	  })];		
	break;
    case 'C_200_03':
	//rond vide barré en diagonale
	symbole = [new ol.style.Circle({
			radius: radius,
			stroke: new ol.style.Stroke({color: myBeautifullColor, width: 2})
	  }),new ol.style.RegularShape({
		  stroke: new ol.style.Stroke({color: myBeautifullColor, width: 2}),
		  points: 2,
		  radius: radius,
		  radius2: 0,
		  angle: Math.PI / 4
		})
	  ];	
	break;
	case 'C_200_04':
	//rond mi-vide / mi rempli en diagonale

	symbole = [new ol.style.Circle({
			radius: radius,
			stroke: new ol.style.Stroke({color: myBeautifullColor, width: 4})
	  }),new ol.style.RegularShape({
		  stroke: new ol.style.Stroke({color: myBeautifullColor, width: 5}),
		  points: 2,
		  radius: radius,
		  radius2: 0,
		  angle: Math.PI / 4
		})
	  ];		
	break;
    case 'C_200_34':
	  //rond plein avec bord vide
	  //console.log('Symbole rond plein avec bord vide, pwoet pwoet : '+feature.getProperties()["BLOCKNAME"]);
	  symbole = [new ol.style.Circle({
			radius: radius,
			stroke: new ol.style.Stroke({color: myBeautifullColor, width: 2})
	  }),
	  new ol.style.Circle({
			radius: radius/1.5,
			stroke: new ol.style.Stroke({color: myBeautifullColor, width: 2}), 
			fill: new ol.style.Fill({ color: myBeautifullColor})
	  })];	
	break;
	default:
	  //console.log('Specific symbol no set : '+feature.getProperties()["BLOCKNAME"]);
	  symbole = [new ol.style.Circle({
			radius: 3,
			stroke: new ol.style.Stroke({color: myBeautifullColor, width: 2}), 
			fill: new ol.style.Fill({ color: myBeautifullColor})
	  })];
  };

  
  return symbole;
};

var overlayEditStyle = (function() {
  /* jshint -W069 */
  var styles = {};
  styles['Polygon'] = [
    new ol.style.Style({
      fill: new ol.style.Fill({
        color: [255, 255, 255, 0.5]
      })
    }),
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: [255, 255, 255, 1],
        width: 5
      })
    }),
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: [0, 153, 255, 1],
        width: 3
      })
    })
  ];
  styles['MultiPolygon'] = styles['Polygon'];

  styles['LineString'] = [
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: [255, 255, 255, 1],
        width: 5
      })
    }),
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: [0, 153, 255, 1],
        width: 3
      })
    })
  ];
  styles['MultiLineString'] = styles['LineString'];

  styles['Point'] = [
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
          color: [0, 153, 255, 1]
        }),
        stroke: new ol.style.Stroke({
          color: [255, 255, 255, 0.75],
          width: 1.5
        })
      }),
      zIndex: 100000
    })
  ];
  styles['MultiPoint'] = styles['Point'];

  styles['GeometryCollection'] = styles['Polygon'].concat(styles['Point']);

  return function(feature, resolution) {
    return styles[feature.getGeometry().getType()];
  };
  /* jshint +W069 */
})();

var overlayStyle = function(feature, resolution) {

  var styles = {};
  styles['Polygon'] = [
    new ol.style.Style({
      fill: new ol.style.Fill({
        color: [255, 0, 0, 0.3]
      })
    }),
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: [255, 0, 0, 0.5],
        width: 8
      })
    }),
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: [255, 0, 0, 0.5],
        width: 6
      })
    })
  ];
  styles['MultiPolygon'] = styles['Polygon'];

  styles['LineString'] = [
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: [255, 0, 0, 0.5],
        width: 8
      })
    }),
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: [255, 0, 0, 0.5],
        width: 6
      })
    })
  ];
  styles['MultiLineString'] = styles['LineString'];

  styles['Point'] = [
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: 9,
        fill: new ol.style.Fill({
          color: [255, 0, 0, 0.5]
        }),
        stroke: new ol.style.Stroke({
          color: [255, 0, 0, 0.5],
          width: 3
        })
      }),
      zIndex: 100000
    })
  ];
  styles['MultiPoint'] = styles['Point'];

  styles['GeometryCollection'] = styles['Polygon'].concat(styles['Point']);

  return styles[feature.getGeometry().getType()];

};
