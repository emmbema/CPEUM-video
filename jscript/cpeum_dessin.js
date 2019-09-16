$(document).ready(function() {


/*** CPEUM DESSIN ***/

calqueBackGround = "rgba(235,235,235,0.15)";

calque = new fabric.Canvas("cpeum-dessin", { allowTouchScrolling: false, backgroundColor: calqueBackGround, enableRetinaScaling: true});
calque.selection = false;

// Dessin main levé, configuration initiale
unSelected = false;

calque.isDrawingMode = true;
calque.freeDrawingCursor = "default";
calque.freeDrawingBrush.shadow = new fabric.Shadow({
	blur: 3,
	offsetX: 1,
	offsetY: 1,
	affectStroke: true,
	color: "rgba(0,0,0,0.05)",
});

// Gestion des options

inkColor = {r: 36, g: 46, b: 56};

cfgFabric = function () {
	inkOpacity = parseInt($("#opacity-slider").val(), 10);
	brushSize = parseInt($("#brush-size-slider").val(), 10);
	textSize = parseInt($("#text-size-slider").val(), 10);
	calque.freeDrawingBrush.width = brushSize;
	calque.freeDrawingBrush.color = "rgba("+inkColor.r+","+inkColor.g+","+inkColor.b+","+inkOpacity/100+")";
};
cfgFabric();

// Palette de couleurs

$("#goutte").css({ backgroundColor : "rgb("+inkColor.r+","+inkColor.g+","+inkColor.b+")" });
$(".echantillons").each( function () {
	$(this).css({ backgroundColor : "rgb("+$(this).attr("r")+", "+$(this).attr("g")+", "+$(this).attr("b")+")" })
});

$(".echantillons").click( function (e) {		
	inkColor = {r: $(this).attr("r"), g: $(this).attr("g"), b: $(this).attr("b")};		
	calque.freeDrawingBrush.color = "rgba("+inkColor.r+","+inkColor.g+","+inkColor.b+","+inkOpacity/100+")";
	updateFabricText();
	calque.renderAll();
	$("#goutte").css({ backgroundColor : "rgb("+inkColor.r+","+inkColor.g+","+inkColor.b+")" });
	
	var currentMode;
	if ( calque.isDrawingMode ) {
		currentMode = $("#dessiner-mode");
	}
	else if ( !calque.isDrawingMode ) {
		currentMode = $("#ecrire-mode");
	};
	currentMode.css({ backgroundColor : "rgb("+inkColor.r+","+inkColor.g+","+inkColor.b+")" });

	// Éviter que le click de choix de couleur referme la palette automatiquement
	e.stopPropagation();
});

// Mise à jour du texte...

updateFabricText = function () {
	if ( calque.getActiveObject() !== undefined && calque.getActiveObject() !== null && calque.getActiveObject().isType("i-text") ) {
		calque.getActiveObject().set({
			fontSize : textSize,
			fill : "rgb("+inkColor.r+","+inkColor.g+","+inkColor.b+")"
		});
	};
}

// ...et réponse aux inputs sliders

$(".cfg-fabric").on("input", function () {
	cfgFabric();
	updateFabricText ();
	calque.renderAll();
});

	// Curseur de dessin

	$("#cpeum-dessin").after("<div id='curseur-dessin'></div>");
	brushTimer = 0;
	$(window).mousemove(function (e) {
		if ( calque.isDrawingMode ) {
			clearInterval(brushTimer);
			$("#curseur-dessin").css({
				"display" : "block",
				"top" : e.pageY - brushSize*scaleZoom/2 + "px",
				"left" : e.pageX - brushSize*scaleZoom/2 + "px",
				"width" : brushSize*scaleZoom + "px",
				"height" : brushSize*scaleZoom + "px",
				"backgroundColor" : "rgba("+inkColor.r+","+inkColor.g+","+inkColor.b+","+inkOpacity/100+")",
				"border-radius" : "100%",
			});
			brushTimer = setTimeout( function(){$("#curseur-dessin").fadeOut(700);}, 1400 );
		}
		else  {
			$("#curseur-dessin").css({
				"display" : "none",
				"top" : e.pageY - brushSize*scaleZoom/2 + "px",
				"left" : e.pageX - brushSize*scaleZoom/2 + "px",
				"width" : "0px",
				"height" : "0px",
			})
		}
	});

// Bouton-dessiner

$("#calque-dessiner").on("click", function () {
	if ( !calque.isDrawingMode ) {
		activeDessiner();
	};
	unSelected = false;
	calque.isDrawingMode = true;
});

// Bouton-ecrire	

	// Fonction pour permettre la selection uniquement avec les éléments textes interactifs

	selecText = function (object) {
		if (object.isType("i-text")) {
			object.selectable = true;
			object.set({
				borderColor: 'gray',
				cornerColor: 'black',
				cornerSize: 10,
				transparentCorners: false,
			});
			object.setControlsVisibility({
				bl: true,
				br: true,
				mb: false,
				ml: false,
				mr: false,
				mt: false,
				tl: true,
				tr: true,
				mtr: true,
			});
			calque.bringToFront(object);
		} else {
			object.selectable = false;
			object.hoverCursor = "default";
		};
	};

$("#calque-ecrire").on("click", function () {
	if (!unSelected) {
		activeEcrire();
	};
	unSelected = true;
	calque.isDrawingMode = false;
	calque.forEachObject(selecText);
});

	// Vérifier si hover élément texte pour permettre de le sélectionner directement et interrompre la persistence du mode création

	var textHover = false;
	calque.on("mouse:over", function (hovered) {
		if ( hovered.target !== null && hovered.target.isType("i-text") ) {
				textHover = true;
		};
	});
	calque.on("mouse:out", function() {
		textHover = false;
	});

$("#dessin-pane canvas").last().on("click", function (e) {
	if ( !calque.isDrawingMode && unSelected && !textHover ) {
		var itextPoint = new fabric.Point(e.clientX, e.clientY);
		var correctedPoint = fabric.util.transformPoint(itextPoint, viewerTransformed);
		calque.add(new fabric.IText("Insérez une annotation", { 
		  fontFamily: "Overpass",
		  left: correctedPoint.x-textSize/2,
		  top: correctedPoint.y-2*textSize/3,
		  fontSize: textSize,
		  fill: "rgb("+inkColor.r+","+inkColor.g+","+inkColor.b+")",
		}));
		unSelected = false;
		calque.forEachObject(selecText);
		console.log("Bloc texte inséré à : "+correctedPoint);
	}
	else if ( !calque.isDrawingMode && unSelected && textHover ) {
		unSelected = false;
	}
	else if ( !calque.isDrawingMode && !unSelected && !textHover ) {
		unSelected = true;
	};
	console.log("Click!");
});

// Boutons effacer-undo-redo

isRedoing = false;
h = [];

calque.on("object:added", function() {
  if(!isRedoing){
    h = [];
  }
  isRedoing = false;
});

$("#calque-undo").on("click", function () {
  if (calque._objects.length > 0) {
   h.push(calque._objects.pop());
   calque.renderAll();
  }
});

$("#calque-redo").on("click", function () {  
  if (h.length > 0) {
   isRedoing = true;
   calque.add(h.pop());
  }
});

$("#calque-effacer-tout").on("click", function () {		
	calque.clear();
	calque.allowTouchScrolling = false;
	calque.backgroundColor = calqueBackGround;
	calque.enableRetinaScaling = true;
});


// Rester attentif au redimensionnement du fureteur

initWidth = $("#viewer-pane").width();
initHeight = $("#viewer-pane").height();
scaleZoom = 1;
scalePanOffset = 0;
scaleZoomOffset = 0;

viewerTransformed = 0;

calqueResize = function () {
 	viewerWidth = $("#viewer-pane").width();
 	viewerHeight = $("#viewer-pane").height();
	calque.setWidth(viewerWidth);
	calque.setHeight(viewerHeight);

	// Correction de l'échelle selon changement de hauteur

	scaleZoom = viewerHeight/initHeight;
	calque.setZoom(scaleZoom);
	scaleZoomOffset = (viewerHeight-initHeight)*initWidth/initHeight/2; // Règle de 3 pour trouver le deltaX engendré par zoom de deltaY

	// Correction du deltaX introduit par changement de largeur

	scalePanOffset = (initWidth-viewerWidth)/2;
	centerPan = new fabric.Point(scalePanOffset+scaleZoomOffset, 0);
	calque.absolutePan(centerPan);

	// Correction de la position pour l'ajout ultérieur de boites texte

	viewerTransformed = fabric.util.invertTransform(calque.viewportTransform)
	calque.renderAll();
}
calqueResize();

$(window).resize(calqueResize);



/*** FIN CPEUM DESSIN ***/

});