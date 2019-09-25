$(document).ready(function () {


// Retirer l'écran de chargement initial
setTimeout(function() {
	$("#opener").fadeOut(800);
}, 200);


/*** Fonctionnalité de capture d'écran ***/

$("#capture").click(function() {

	// Fonction pour révéler les images dans l'interface
	var revealCaptures = function () {
		$("#gallery").append(
							'<div class="capture">'+
								'<img class="captureImage captureViewer" src="'+captureViewer+'"/>'+
								'<div class="vue">'+
									'<div class="vue-capture" title="Retourner au point de vue" lat="'+punaise.getLatLng().lat+'" lon="'+punaise.getLatLng().lng+'" time="'+videoTime+'">'+									
										'<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="50px" height="50px" viewBox="0 0 50 50" enable-background="new 0 0 50 50" xml:space="preserve"><g><path d="M24.954,0.563c-8.965,0-16.232,7.269-16.232,16.232c0,8.608,16.232,27.729,16.232,27.729s16.233-19.122,16.233-27.729C41.188,7.831,33.918,0.563,24.954,0.563z M30.298,10.446l2.582-1.413c0.446-0.245,1.336,1.376,0.889,1.622l-2.582,1.413c-0.142,0.077-0.294,0.114-0.443,0.114C30.416,12.182,29.851,10.691,30.298,10.446z M26.446,23.913c-0.44-0.461-1.792-1.762-2.728-2.231l-10.16-5.093c-0.313-0.157-0.313-1.497,0-1.653l10.162-5.094c1.446-0.725,2.674-2.172,2.687-2.186c0.331-0.393,1.744,0.797,1.416,1.188c-0.056,0.068-1.337,1.57-2.995,2.494c0.057,0.063,0.117,0.122,0.157,0.201c0.663,1.321,1,2.743,1,4.224c0,1.482-0.336,2.904-1,4.225c-0.04,0.079-0.089,0.148-0.146,0.209c1.353,0.789,2.875,2.367,2.945,2.439C28.136,23.004,26.628,24.103,26.446,23.913zM32.88,22.037l-2.582-1.413c-0.447-0.245,0.439-1.868,0.889-1.622l2.582,1.414C34.216,20.66,33.021,22.114,32.88,22.037zM34.243,17h-2.774C30.958,17,31,16.511,31,16s-0.042-1,0.469-1h2.774c0.511,0,0.549,0.489,0.549,1S34.754,17,34.243,17z"/><path d="M23.854,13.724c-0.129-0.465-0.302-0.918-0.522-1.357c-0.037-0.074-0.046-0.153-0.063-0.23l-7.233,3.625l7.233,3.625c0.016-0.078,0.025-0.156,0.063-0.231c0.237-0.472,0.418-0.959,0.55-1.461c0.024-0.09-1.341-1.097-1.341-1.934S23.889,13.849,23.854,13.724z"/></g><path d="M24.954,49.25c-3.101,0-6.039-0.579-8.273-1.631c-2.594-1.222-4.023-2.98-4.023-4.952s1.429-3.73,4.023-4.952c0.75-0.352,2.028,2.361,1.278,2.715c-1.419,0.668-2.301,1.525-2.301,2.237s0.882,1.569,2.301,2.237c1.815,0.855,4.365,1.346,6.995,1.346c2.63,0,5.18-0.49,6.995-1.346c1.419-0.668,2.301-1.525,2.301-2.237s-0.882-1.569-2.301-2.237c-0.75-0.354,0.529-3.066,1.277-2.715c2.595,1.222,4.023,2.98,4.023,4.952s-1.429,3.73-4.023,4.952C30.993,48.671,28.056,49.25,24.954,49.25z"/></svg>'+
									'</div>'+
									'<img class="captureImage captureCarte" src="'+captureCarte2+'"/>'+
								'</div>'+									
							'</div>'
						);
		$("#gallery").children().last().delay(600).animate({ opacity : "1"}, 800);
		$("#gallery").delay(500).animate({scrollTop: $("#gallery").prop("scrollHeight")}, 600);
	}

	// Synhtèse/préparation du dataURL (b64) principal
	var appendCaptures = function () {
		mergeImages([
			{ src: captureVideo, x: 0, y: 0 },
			{ src: captureCarte, x: 0, y: $("#video-container").height()-1 }
			],
			{ width: $("#viewer-pane").width(), height: $("#viewer-pane").height() }
			).then(b64 => {
				var firstMerge = b64;					
				// Si en train de dessiner...
				if (calqueState) {
					captureFabric = calque.toDataURL("image/png", 1.0);
					mergeImages([firstMerge, captureFabric]).then(b64 => {
						captureViewer = b64;
						revealCaptures();
					});
				}
				// Sinon, si pas en train de dessiner...
				else {
					captureViewer = firstMerge;
					revealCaptures();
				};
			});
	};

	// Fonction de capture de la carte
	var cartePromise = function () {
		leafletImage(carte, function(err, canvas) {
			captureCarte = canvas.toDataURL();
			leafletImage(carteCapture, function (err, canvas) {
				captureCarte2 = canvas.toDataURL();
				appendCaptures();
			})
		});
	};

	// Fonction de capture du panneau principal
	var videoPromise = function () {
		var cWidth = $("#video-container").width();
		var cHeight = $("#video-container").height();
		var video = document.getElementById("cpeum-video");
		var canVid = document.createElement("canvas");
		canVid.width = cWidth;
		canVid.height = cHeight;

		var scale = Math.min(cWidth / video.videoWidth, cHeight / video.videoHeight);
		var videoX = (cWidth-(video.videoWidth*scale))/2;
		var videoY = (cHeight-(video.videoHeight*scale))/2;
		canVid.getContext("2d").fillStyle = "rgb(25,28,30)";
		canVid.getContext("2d").fillRect(0, 0, cWidth, cHeight);
		canVid.getContext("2d").drawImage(video, videoX, videoY, video.videoWidth*scale, video.videoHeight*scale);
 
		captureVideo = canVid.toDataURL();

		cartePromise();
	};

	videoPromise();
});

// Restituer la vue de la capture
$("#gallery").on("click", ".vue-capture", function () {		
	document.getElementById("cpeum-video").currentTime = $(this).attr("time");
});


/*** UI/UX GLOBAL ***/

// Ouverture-fermeture du calque de dessin et suivi de l'état
calqueState = false;

$("#dessiner").on("click", function () {
	calqueState = !calqueState;
	if (calqueState) {
		$("#cpeum-video").removeAttr("controls");
	} else if (!calqueState) {
		$("#cpeum-video").attr("controls","");
	}
	$("#dessin-pane").slideToggle(350);
	$(this).children(".arret-dessiner").fadeToggle(200);
	//console.log("calque state ="+calqueState);
});

// Lightbox de la galerie
boiteOpen = false

$("#gallery").on("click", ".captureImage", function () {
	if (boiteOpen) {
		$(".lightboite img").attr("src", $(this).attr("src"));
	}
	else {
	$("#viewer-pane").append(
		'<div class="lightboite">'+
			'<img src="'+$(this).attr("src")+'"/>'+
			'<div class="eteindre">'+
				'<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="53px" height="53px" viewBox="0 0 50 50" enable-background="new 0 0 50 50" xml:space="preserve"><g id="dessiner-stop"><path d="M11.5,2.5"/><path d="M28.535,22l9.025-9.025c0.389-0.389,0.389-1.025,0-1.414L35.439,9.44c-0.389-0.389-1.025-0.389-1.414,0L25,18.465L15.975,9.44c-0.389-0.389-1.025-0.389-1.414,0l-2.121,2.121c-0.389,0.389-0.389,1.025,0,1.414L21.465,22l-9.025,9.025c-0.389,0.389-0.389,1.025,0,1.414l2.121,2.121c0.389,0.389,1.025,0.389,1.414,0L25,25.535l9.025,9.025c0.389,0.389,1.025,0.389,1.414,0l2.121-2.121c0.389-0.389,0.389-1.025,0-1.414L28.535,22z"/></g></svg>'+
			'</div>'+
		'</div>'
	);
	$(".lightboite").animate({width : "100%", opacity : "1"}, 200);
	boiteOpen = true
	}
});

$("#viewer-pane").on("click", ".eteindre", function () {
	boiteOpen = false
	$(this).parent().animate({width : "75%", opacity : "0"}, 200, function () {$(this).remove()});
});

// Téléchargement de la galerie
$("#telecharger").click( function () {
	
	var captureURLs = [];
	$("#gallery").find("img").each( function () {
		captureURLs.push($(this).attr("src"));
	});
	console.log("nombre de dataURL de captures :"+captureURLs.length);

	var captureZip = new JSZip();
	var count = 0;
	var zipFilename = "Images_CPEUM.zip";

	captureURLs.forEach( function (url, i) {
		var captureName = "Capture_" + document.title.replace("CPEUM : ", "") + "_" + (i + 1) + "." + captureURLs[i].substring("data:image/".length, captureURLs[i].indexOf(";base64"))
		// loading a file and add it in a zip file
		captureZip.file(captureName, captureURLs[i].replace(/^data:image\/(png|jpg);base64,/, ""), { base64: true });
		count++;
		if (count == captureURLs.length) {
			captureZip.generateAsync({ type: 'blob' }).then(function (content) {
				saveAs(content, zipFilename);
			});
		}
	});
});

// Corriger les "sticky hovers" des boutons sur appareils touch
function hoveroff() {
	//this.
};


/*** FIN SCRIPT GÉNÉRAL - CPEUM PARCOURS ***/

});
