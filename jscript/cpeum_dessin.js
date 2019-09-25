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
	blur: 2,
	offsetX: 1,
	offsetY: 1,
	affectStroke: true,
	color: "rgba(0,0,0,0.07)",
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

	// Mettre à jour automatiquement la visibilité du calque correspondant
	var isCalque = $("#calque-book #"+$(this).attr("forlayer"));
	if ( !isCalque.prop("checked") ) {
		isCalque.click();
	};

	// Éviter que le click de choix de couleur referme la palette automatiquement
	e.stopPropagation();
});

// Rendre automatiquement visible le calque de la couleur du trait dessiné
calque.on("mouse:down:before", function () {
	var calqueName = $("#palette [r="+inkColor.r+"][g="+inkColor.g+"][b="+inkColor.b+"]").attr("forlayer");
	var liveCalque = $("#calque-book #"+calqueName);
	if ( !liveCalque.prop("checked") ) {
		liveCalque.click();
	}
})


// Mise à jour du texte...
updateFabricText = function () {
	var currentObj = calque.getActiveObject();
	if ( currentObj !== undefined && currentObj !== null && currentObj.isType("i-text") ) {
		currentObj.set({
			fontSize : textSize,
			fill : "rgba("+inkColor.r+","+inkColor.g+","+inkColor.b+",1)"
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
	$("#cpeum-dessin").after("<div id='curseur-dessin'></div><div id='curseur-dessin-bracket'></div>");
	brushTimer = 0;
	$(window).mousemove(function (e) {
		if ( calque.isDrawingMode ) {
			clearInterval(brushTimer);
			$("#curseur-dessin").css({
				"display": "block",
				"top": e.pageY - brushSize*scaleZoom/2 - 1 +"px",
				"left": e.pageX - brushSize*scaleZoom/2 - 1 +"px",
				"width": brushSize*scaleZoom +"px",
				"height": brushSize*scaleZoom +"px",
				"backgroundColor": "transparent",
				"border": "1px solid rgba("+inkColor.r+","+inkColor.g+","+inkColor.b+","+inkOpacity/100+")",
				"border-radius": "100%",
			});
			$("#curseur-dessin-bracket").css({
				"display": "none",
			});
			brushTimer = setTimeout( function(){$("#curseur-dessin").fadeOut(700);}, 1400 );
		}
		else if ( !calque.isDrawingMode && unSelected && !textHover ) {
			clearInterval(brushTimer);
			$("#curseur-dessin").css({
				"display": "block",
				"top": e.pageY - 2*textSize*scaleZoom/3 - 1 +"px",
				"left": e.pageX - 1 +"px",
				"width": textSize*scaleZoom/4 +"px",
				"height": textSize*scaleZoom +"px",
				"backgroundColor": "transparent",
				"border": "1px solid rgba("+inkColor.r+","+inkColor.g+","+inkColor.b+",1)",
				"border-right": "none",
				"border-radius": "3px 0px 0px 3px",
			});
			$("#curseur-dessin-bracket").css({
				"display": "block",
				"top": e.pageY - 2*textSize*scaleZoom/3 - 1 +"px",
				"left": e.pageX - textSize*scaleZoom/4 - 1 +"px",
				"width": textSize*scaleZoom/4 +"px",
				"height": textSize*scaleZoom +"px",
				"backgroundColor": "transparent",
				"border": "1px solid rgba("+inkColor.r+","+inkColor.g+","+inkColor.b+",1)",
				"border-left": "none",
				"border-radius": "0px 3px 3px 0px",
			});
			brushTimer = setTimeout( function(){$("#curseur-dessin, #curseur-dessin-bracket").fadeOut(700);}, 1400 );
		}
		else  {
			$("#curseur-dessin, #curseur-dessin-bracket").css({
				"display": "none",
				"top": e.pageY - brushSize*scaleZoom/2 + "px",
				"left": e.pageX - brushSize*scaleZoom/2 + "px",
				"width": "0px",
				"height": "0px",
			})
		}
	});


/*** Interface graphique ***/

// Surlignage du mode Dessiner
activeDessiner = function () {
	$("#dessiner-mode").css({ backgroundColor : "rgb("+inkColor.r+","+inkColor.g+","+inkColor.b+")", width : "434px", cursor : "default" });
	$("#calque-dessiner").children("svg").css({ left : "18px",  fill : "rgb(245,245,250)" });
	$("#ecrire-mode").css({ backgroundColor : "", width : "", cursor : "" });
	$("#calque-ecrire").children("svg").css({ left : "", fill : "" });

	$("#text-size").hide(250);
	$("#brush-size").show(350);
	$("#opacity").show(350);
};
activeDessiner();

// Surlignage du mode Écrire
activeEcrire = function () {
	$("#ecrire-mode").css({ backgroundColor : "rgb("+inkColor.r+","+inkColor.g+","+inkColor.b+")", width : "244px", cursor : "default" });
	$("#calque-ecrire").children("svg").css({ left : "18px", fill : "rgb(245,245,250)" });
	$("#dessiner-mode").css({ backgroundColor : "", width : "", cursor : "" });
	$("#calque-dessiner").children("svg").css({ left : "", fill : "" });

	$("#brush-size").hide(250);
	$("#opacity").hide(250);
	$("#text-size").show(350);
};

// Affichage de la palette de couleur
$("#palette").click( function () {
	$("#echantillons-container").toggle(250);
});

// Affichage de la liste des calques
$("#calque-choose").click( function () {
	if ( !$(event.target).parents("form").length ) {
		$("#calque-book").toggle(250);
	};
});


/*** Bouton-dessiner ***/

$("#calque-dessiner").on("click", function () {
	if ( !calque.isDrawingMode ) {
		activeDessiner();
	};
	unSelected = false;
	calque.isDrawingMode = true;
});

/*** Bouton-écrire ***/

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
		  left: correctedPoint.x-textSize/4,
		  top: correctedPoint.y-2*textSize/3,
		  fontSize: textSize,
		  fill: "rgba("+inkColor.r+","+inkColor.g+","+inkColor.b+",1)",
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

/*** Options undo-redo ***/

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
$(document).keydown(function(e){
	var currentObj = calque.getActiveObject();
	// Pour option de "delete"
	if(( e.key == "Backspace" || e.key == "Delete" ) && currentObj !== undefined && currentObj !== null && !currentObj.isEditing && calqueState) {
		h.push(currentObj);
		calque.remove(currentObj);
	}
	// Pour option "undo" avec ctrl-z
	else if (( e.key == "z" || e.key == "Z" ) && ( e.ctrlKey || e.altKey ) && calqueState) {
		if (calque._objects.length > 0) {
			h.push(calque._objects.pop());
			calque.renderAll();
		}
	}
	// Pour option "redo" avec ctrl-y
	else if (( e.key == "y" || e.key == "Y" ) && ( e.ctrlKey || e.altKey ) && calqueState) {
		if (h.length > 0) {
			isRedoing = true;
			calque.add(h.pop());
		}
	}
});

$("#calque-effacer-tout").on("click", function () {
	calque.clear();
	calque.allowTouchScrolling = false;
	calque.backgroundColor = calqueBackGround;
	calque.enableRetinaScaling = true;
});

/*** Option de visibilité des calques-participants ***/

// Construction de la liste de checkboxes
$(".echantillons").each( function(i) {
	var it = i+1;
	var isCalque = $(this).attr("forlayer");
	var isColor = {
		"r": $(this).attr("r"),
		"g": $(this).attr("g"),
		"b": $(this).attr("b")
	};
	$("#calque-book").append("<input type='checkbox' id='"+isCalque+"' checked='checked'><label for='"+isCalque+"' class='calque-select'><div r='"+isColor.r+"' g='"+isColor.g+"' b='"+isColor.b+"'></div>Participant "+it+"</label>");
});
$(".calque-select div").each( function() {
	$(this).css({
		backgroundColor: "rgba("+$(this).attr("r")+","+$(this).attr("g")+","+$(this).attr("b")+",1)"
	})
});

// Interagir avec les checkboxes
$("#calque-book input").on("input", function (event) {
	var subCalque = event.target.id;
	var isOn = event.target.checked;
	var colSource = $("#palette ul li[forlayer="+subCalque+"]");
	var subColor = "rgba("+colSource.attr("r")+","+colSource.attr("g")+","+colSource.attr("b");	// On coupe ici comme l'opacité (alpha) peut varirer pour les dessins

	calque.forEachObject( function (thisObj) {
		var currentColor;
		if ( thisObj.isType("i-text") ) {
			currentColor = thisObj.fill;
		} else {
			currentColor = thisObj.stroke;
		}
		if ( currentColor.startsWith(subColor) ) {
			if ( isOn ) {
				thisObj.opacity = 1;
			} else if ( !isOn ) {
				thisObj.opacity = 0;
			}
			calque.discardActiveObject();
		 	calque.renderAll();
		};
	});
})

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