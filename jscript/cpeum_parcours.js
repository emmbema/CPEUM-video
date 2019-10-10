$(document).ready(function () {


// Retirer l'écran de chargement initial
setTimeout(function() {
	$("#opener").fadeOut(800);
}, 200);


/*** Fonctionnalité de capture d'écran ***/

$("#capture").click(function() {

	// Fonction pour révéler les images dans l'interface
	var revealCaptures = function () {
		$("#gallery").append(`<div class="capture">
								<img class="captureImage captureViewer" src="`+captureViewer+`"/>
								<div class="vue">
									<div class="vue-capture" title="Retourner au point de vue" lat="`+punaise.getLatLng().lat+`" lon="`+punaise.getLatLng().lng+`" time="`+videoTime+`">
										<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="50px" height="50px" viewBox="0 0 50 50" enable-background="new 0 0 50 50" xml:space="preserve">
											<g>
												<path d="M25,14.733c-6.809,0-13.147,3.683-16.543,9.611c-0.232,0.407-0.232,0.906,0,1.313c3.396,5.929,9.735,9.61,16.543,9.61
												c6.808,0,13.147-3.682,16.544-9.61c0.232-0.407,0.232-0.906,0-1.313C38.147,18.416,31.808,14.733,25,14.733z M25,32.627
												c-5.609,0-10.85-2.904-13.856-7.627c3.006-4.724,8.247-7.627,13.856-7.627S35.85,20.276,38.856,25
												C35.85,29.723,30.609,32.627,25,32.627z"/>
												<path d="M25,19.72c-2.912,0-5.28,2.368-5.28,5.28c0,2.911,2.368,5.28,5.28,5.28c2.911,0,5.28-2.369,5.28-5.28
												C30.28,22.088,27.911,19.72,25,19.72z M25,27.64c-1.456,0-2.64-1.184-2.64-2.64c0-1.456,1.185-2.64,2.64-2.64
												c1.456,0,2.64,1.185,2.64,2.64C27.64,26.456,26.456,27.64,25,27.64z"/>
												<path d="M0,4.073V7h2V4.073C2,2.988,2.988,2,4.073,2H7V0H4.073C1.865,0,0,1.865,0,4.073z"/>
												<path d="M2,45.928V43H0v2.928C0,48.135,1.865,50,4.073,50H7v-2H4.073C2.988,48,2,47.013,2,45.928z"/>
												<path d="M48,45.928C48,47.013,47.013,48,45.928,48H43v2h2.928C48.135,50,50,48.135,50,45.928V43h-2V45.928z"/>
												<path d="M45.928,0H43v2h2.928C47.013,2,48,2.988,48,4.073V7h2V4.073C50,1.865,48.135,0,45.928,0z"/>
											</g>
										</svg>
									</div>
									<img class="captureImage captureCarte" src="`+captureCarte2+`"/>
								</div>
							</div>`);
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
	var captureType = [];
	$("#gallery").find("img").each( function () {
		captureURLs.push($(this).attr("src"));
		if ( $(this).hasClass("captureViewer") ) {
			captureType.push("Perspective");
		} else {
			captureType.push("Carte");
		};
	});
	console.log("nombre de dataURL de captures :"+captureURLs.length);

	var captureZip = new JSZip();
	var count = 0;
	var zipFilename = "Images_CPEUM.zip";

	captureURLs.forEach( function (url, i) {
		var pairN;
		if ( captureType[i]=="Perspective" ) { pairN = (i+2)/2 } else if ( captureType[i]=="Carte" ) { pairN = (i+1)/2 };
		var captureName = "Capture_" + document.title.replace("CPEUM : ", "") + "_" + pairN + "_" + captureType[i] + "." + captureURLs[i].substring("data:image/".length, captureURLs[i].indexOf(";base64"))
		
		// Loading a file and add it in a zip file
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
