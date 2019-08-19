$(document).ready(function(){

	setTimeout(function() {
		$("#opener").fadeOut(1200);
	}, 400);

//________________Interface dessin________________


	var calquebg = "rgba(235,235,235,0.15)";
	var calque = new fabric.Canvas("cpeum-dessin", { allowTouchScrolling: false, backgroundColor: calquebg, enableRetinaScaling: true});
	calque.selection = false;

	// Dessin main levé, configuration initiale

	var unSelected = false;
	var dessinage = true;	

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

	var inkColor = {r: 36, g: 46, b: 56}, inkOpacity, brushSize, textSize;

	var cfgFabric = function () {
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
		if ( dessinage ) {
			currentMode = $("#dessiner-mode");
		}
		else if ( !dessinage ) {
			currentMode = $("#ecrire-mode");
		};
		currentMode.css({ backgroundColor : "rgb("+inkColor.r+","+inkColor.g+","+inkColor.b+")" });

		// Éviter que le click de choix de couleur referme la palette automatiquement
		e.stopPropagation();
	});

	// Mise à jour du texte...

	var updateFabricText = function () {
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
		var brushTimer;
		$(window).mousemove(function (e) {
			if (dessinage) {
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
		if (!dessinage) {
			activeDessiner();
		};
		unSelected = false;
		dessinage = true;
		calque.isDrawingMode = true;
	});

	// Bouton-ecrire	

		// Fonction pour permettre la selection uniquement avec les éléments textes interactifs

		var selecText = function (object) {
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
		dessinage = false;
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
		if (!dessinage && unSelected && !textHover) {
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
		else if (!dessinage && unSelected && textHover) {
			unSelected = false;
		}
		else if (!dessinage && !unSelected && !textHover) {
			unSelected = true;
		};
		console.log("Click!");
	});

	// Boutons effacer-undo-redo

	var isRedoing = false;
	var h = [];

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
		calque.backgroundColor = calquebg;
		calque.enableRetinaScaling = true;
	});


	// Rester attentif au redimensionnement du fureteur

	var viewerWidth;
	var viewerHeight;
	var initWidth = $("#viewer-pane").width();
	var initHeight = $("#viewer-pane").height();
	var scaleZoom = 1;
	var scalePanOffset = 0;
	var scaleZoomOffset = 0;

	var viewerTransformed = 0;

	var calqueResize = function () {
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





//____________________BabylonJS____________________



	var canvas = document.getElementById("cpeum-viewer");
	var engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

	// Loading UI sur mesure

	BABYLON.DefaultLoadingScreen.prototype.displayLoadingUI = function () {
	    if (this._loadingDiv) {
	        // Do not add a loading screen if there is already one
	        return;
	    }
	    this._loadingDiv = document.createElement("div");
	    this._loadingDiv.id = "babylonjsLoadingDiv";
	    this._loadingDiv.style.opacity = "0";
	    this._loadingDiv.style.transition = "opacity 1.6s ease-in-out";
	    this._loadingDiv.style.pointerEvents = "none";
	    this._loadingDiv.style.zIndex = "2222";

	    var spinner = document.createElement("div");
	    spinner.id = "spinner";
	    var spinnerCirc1 = document.createElement("div");
	    var spinnerCirc2 = document.createElement("div");
	    var spinnerCirc3 = document.createElement("div");
	    var spinnerCirc4 = document.createElement("div");
	    spinner.appendChild(spinnerCirc1);
	    spinner.appendChild(spinnerCirc2);
	    spinner.appendChild(spinnerCirc3);
	    spinner.appendChild(spinnerCirc4);
	    //<div id="spinner"><div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div></div>

	    this._loadingDiv.appendChild(spinner);
	    this._resizeLoadingUI();
	    window.addEventListener("resize", this._resizeLoadingUI);
	    this._loadingDiv.style.backgroundColor = this._loadingDivBackgroundColor;
	    document.body.appendChild(this._loadingDiv);
	    this._loadingDiv.style.opacity = "1";

	    // Loading text
	    this._loadingTextDiv = document.createElement("div");
	    this._loadingTextDiv.style.position = "absolute";
	    this._loadingTextDiv.style.left = "0";
	    this._loadingTextDiv.style.top = "50%";
	    this._loadingTextDiv.style.marginTop = "-10px";
	    this._loadingTextDiv.style.width = "100%";
	    this._loadingTextDiv.style.height = "14px";
	    this._loadingTextDiv.style.fontFamily = "Overpass, sans-serif";
	    this._loadingTextDiv.style.fontWeight = "600";
	    this._loadingTextDiv.style.letterSpacing = "0px";
	    this._loadingTextDiv.style.fontSize = "13px";
	    this._loadingTextDiv.style.color = "rgb(110,110,110)";
	    this._loadingTextDiv.style.textAlign = "center";
	    this._loadingDiv.appendChild(this._loadingTextDiv);
	    //set the predefined text
	    this._loadingTextDiv.innerHTML = "chaire en paysage et environnement";
	};

	engine.loadingUIBackgroundColor = new BABYLON.Color3(234/255, 236/255, 238/255).toHexString();

	// Création de l'espace de la scène

	var scene = new BABYLON.Scene(engine);
	
	// Caméras

		// cameraCarte

		var camera2;
		var meshMiddle;
		var carteMiddle;
		var planRadius;
		var meshW;
		var meshH;
		var cpeumMesh;

		var cameraCarte = function () {
			camera2 = new BABYLON.ArcRotateCamera("Cam2", 0.1, 0.1, 1000, new BABYLON.Vector3.Zero(), scene);
			camera2.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
			if (scene.meshes.length > 0) {
				cpeumMesh = scene.meshes[scene.meshes.length-1];
				meshMiddle = cpeumMesh.getBoundingInfo().boundingBox.center;
				camera2.setTarget(meshMiddle);

				meshW = cpeumMesh.getBoundingInfo().boundingBox.maximumWorld.x - cpeumMesh.getBoundingInfo().boundingBox.minimumWorld.x;
				meshH = cpeumMesh.getBoundingInfo().boundingBox.maximumWorld.z - cpeumMesh.getBoundingInfo().boundingBox.minimumWorld.z;
				planRadius = (Math.max(meshW, meshH) + 12);
				carteMiddle = new BABYLON.Vector3(meshMiddle.x, cpeumMesh.getBoundingInfo().boundingBox.maximumWorld.y+1000, meshMiddle.z);

				camera2.setPosition(carteMiddle);
				camera2.orthoTop = planRadius/2;
				camera2.orthoBottom = -(planRadius/2);
				camera2.orthoLeft = -(planRadius)/2;
				camera2.orthoRight = planRadius/2;
				console.log("Coord. du milieu = :"+meshMiddle+"; Rayon du plan = "+planRadius);
			};
			// Surmonter le bug du premier screenshot dans chrome...
			BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, camera2, 200, function () {
				console.log("dump screenshot pour initialiser pleinement la caméra2");
				BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, camera2, 200, function () {
					console.log("2e dump screenshot pour initialiser pleinement la punaise")
				}, undefined, 2, false);
			}, undefined, 2, false);
		};

		// camera (principale)

		var camera;
		var rotateSpeed = 850;
		var camTargetInit = new BABYLON.Vector3(0,0,0);
		var camPosInit = new BABYLON.Vector3(0.1,10,25);
		var maxCloseUp = 2.5;
		var inertiAll = 0.8;

		var cameraCPEUM = function () {
			camera = new BABYLON.ArcRotateCamera("Cam1", 0, 0, 15, camTargetInit, scene);
			camera.setPosition(camPosInit);
			// Panning
			camera.panningSensibility = 215;
			camera.pinchToPanPrecision = 400;
			camera.multiTouchPanAndZoom = false;
			// Rotating
			camera.angularSensibilityX = rotateSpeed;
			camera.angularSensibilityY = rotateSpeed;
			camera.inertia = inertiAll;
			// Zooming
			camera.lowerRadiusLimit = maxCloseUp;
			camera.pinchDeltaPercentage = 0.01;
			camera.panningInertia = inertiAll;
			camera.minZ = 0.1;
			// pour lier la caméra au canevas
			camera.attachControl(canvas, true);		
		};

	// enviroCPEUM

	var ciel = new BABYLON.Color3(225/255, 230/255, 255/255);

	var enviroCPEUM = function () {
		scene.clearColor = ciel;
		scene.ambientColor = new BABYLON.Color3(255/255, 255/255, 255/255);		
	};

	// curseurCPEUM (pour navigation focale avec click des mesh)

	var curseurCPEUM = function () { scene.onPointerObservable.add((pointerInfo) => {
		switch (pointerInfo.type) {
			// case BABYLON.PointerEventTypes.POINTERDOWN:
			//	console.log();
			//  break;
			// case BABYLON.PointerEventTypes.POINTERUP:
			// 	console.log();
			// 	break;
			//case BABYLON.PointerEventTypes.POINTERMOVE:
			//	if (scene.pick(scene.pointerX, scene.pointerY).hit) {
			//		canvas.style.cursor = "pointer";
			//	}
			//	break;
			// case BABYLON.PointerEventTypes.POINTERWHEEL:
			// 	console.log();
			// 	break;
			case BABYLON.PointerEventTypes.POINTERPICK:
				console.log("Pickety");
				break;
			case BABYLON.PointerEventTypes.POINTERTAP:
				console.log("Tappety");

				// Permettre temporairement le "picking" du modèle
				var iMesh;
				for (iMesh = 0; iMesh < scene.meshes.length; iMesh++) {
					scene.meshes[iMesh].isPickable = true;
				};
				// paramétrage
				var ease = new BABYLON.CubicEase();
				ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
				var speed = 45;
				var duration = 30;
				var zoomRatio = 1/6;
				
				var newPos;					
				var dX;
				var dY;
				var dZ;
				var focalClick = scene.pick(scene.pointerX, scene.pointerY);

				if (focalClick.hit) {
					var newTarget = focalClick.pickedPoint;
					//console.log(focalClick.pickedMesh);

					//Création de l'animation

					if (focalClick.distance > maxCloseUp) {
						dX = newTarget.x - camera.position.x;
						dY = newTarget.y - camera.position.y;
						dZ = newTarget.z - camera.position.z;
						newPos = new BABYLON.Vector3(camera.position.x+zoomRatio*dX, camera.position.y+zoomRatio*dY, camera.position.z+zoomRatio*dZ);
						BABYLON.Animation.CreateAndStartAnimation("positionAnim", camera, "position", speed, duration*2, camera.position, newPos, 0, ease);
					} else {
						newPos = camera.position;
					};
					BABYLON.Animation.CreateAndStartAnimation("targetAnim", camera, "target", speed, duration, camera.target, newTarget, 0, ease);
				};

				// Enlever à nouveau le "picking" du modèle pour réduire les calculs de collision et donner une meilleure performance lors de la navigation
				for (iMesh = 0; iMesh < scene.meshes.length; iMesh++) {
					scene.meshes[iMesh].isPickable = false;
				};

				break;
			// case BABYLON.PointerEventTypes.POINTERDOUBLETAP:
			// 	console.log();
			// 	break;
		}
	})};

	// Problèmes de texture-mapping avec OBJ

	BABYLON.OBJFileLoader.OPTIMIZE_WITH_UV = true;
	scene.useRightHandedSystem = true;

	// ...Pour modèles GLTF (première partie)

	var onMeshLoaded = function(mesh, scene) {
	};
	var onMaterialLoaded = function(material, scene) {	    
	};
	var onTextureLoaded = function(texture, scene) {
	};



	// F O N C T I O N   D E   C R É A T I O N   D E   L A   S C È N E

	var createScene = function () {
		
		// test meshes et lumière
		var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(-2, 1, 1), scene);
		light.diffuse = new BABYLON.Color3(1, 0, 0);
		light.specular = new BABYLON.Color3(0, 1, 0);
		light.groundColor = new BABYLON.Color3(0, 1, 0);
		var boule1 = BABYLON.MeshBuilder.CreateSphere("sphere", {}, scene);
		boule1.position = new BABYLON.Vector3(-5, 0, 0);
		var boite1 = BABYLON.MeshBuilder.CreateBox("myBox", {height: 5, width: 2, depth: 0.5}, scene);
		boite1.position = new BABYLON.Vector3(5, 0, 0);

		enviroCPEUM();

		scene.executeWhenReady(cameraCarte);

		cameraCPEUM();

		// Sélection de la vue active pour le visualiseur	

		scene.activeCamera = camera;

		// Focaliser la navigation en cliquant le modèle

		curseurCPEUM();

		// Inclure l'écran de chargement

		engine.displayLoadingUI();		
		setTimeout(function(){
			engine.hideLoadingUI();
		}, 1600);

		// Importation de modèle * * *

		var modelImport;

			// Setting up some GLTF values (deuxième partie)

			BABYLON.GLTFFileLoader.IncrementalLoading = false;
			BABYLON.SceneLoader.OnPluginActivatedObservable.add(function (plugin) {
				currentPluginName = plugin.name;

				if (currentPluginName == "gltf") {
					plugin.onMaterialLoaded = function(material) {
						onMaterialLoaded(material, scene);
					}
					plugin.onMeshLoaded = function(mesh) {
						onMeshLoaded(mesh, scene);
					}
					plugin.onTextureLoaded = function(texture) {
						onTextureLoaded(texture, scene);
					}
				}    
			});

		// Lorsque l'importation fonctionne

		var sceneLoaded = function (sceneFile, babylonScene) {
			scene = babylonScene;
			scene.useRightHandedSystem = true;
			document.title = "CPEUM : " + sceneFile.name;
			ciel = new BABYLON.Color3(225/255, 230/255, 255/255);
			enviroCPEUM();
			scene.executeWhenReady(cameraCarte);
			cameraCPEUM();
			scene.activeCamera = camera;

			// enforcer le double-face
			var dFace;
			for (dFace = 0; dFace < scene.materials.length; dFace++) {
				scene.materials[dFace].backFaceCulling = false;
				scene.materials[dFace].checkOnlyOnce = true;
				// optimization
				scene.materials[dFace].freeze();
			};

			// rendre sensible aux interactions curseur
			var iMesh;
			for (iMesh = 0; iMesh < scene.meshes.length; iMesh++) {
				// Enlever l'option de "picking" jusqu'à l'occurrence d'un "PointerTap" pour réduire les calculs de collision pendant la navigation
				scene.meshes[iMesh].isPickable = false;
				//scene.meshes[iMesh].enablePointerMoveEvents = true;
				// optimization
				scene.meshes[iMesh].freezeWorldMatrix();
			};
			curseurCPEUM();


			// GLTF exception
			if (currentPluginName === "gltf") {
				// glTF assets use a +Z forward convention while the default camera faces +Z. Rotate the camera to look at the front of the asset.
				scene.activeCamera.alpha += Math.PI;
			}
		};

		// Lors d'une erreur d'importation
		var sceneError = function (sceneFile, babylonScene, Oops) {
			document.title = "CPEUM - Erreur d'importation !";
			scene = babylonScene;
			ciel = new BABYLON.Color3(250/255, 35/255, 35/255);
			enviroCPEUM();
			cameraCPEUM();
			scene.activeCamera = camera;
			console.log("Erreur d'importation!")
		};

		modelImport = new BABYLON.FilesInput(engine, scene, sceneLoaded, null, null, null, function () { BABYLON.Tools.ClearLogCache() }, null, sceneError);﻿
		
		modelImport.onProcessFileCallback = (function (file, name, extension) {
		 	if (modelImport._filesToLoad && modelImport._filesToLoad.length === 1 && extension && extension.toLowerCase() === "dds") {
		 		BABYLON.FilesInput.FilesToLoad[name] = file;
		 		skyboxPath = "file:" + file.correctName;
		 		return false;
		 	};
	 		return true;
		}).bind(this);

		modelImport.monitorElementForDragNDrop(canvas);

		$("#importer").val("");
		$("#importer").on("input", function (event) {
			if (event && event.target && event.target.files) {
                filesToLoad = event.target.files;
            }
            modelImport.loadFiles(event);
		});

		// Fin de configuration de la scene

		return scene;
	};

	// Appel de la fonction

	scene = createScene();

	// Boucle de rendu pour révision constante de la scène

	engine.runRenderLoop(function () {
		scene.render();
	});

	// rester attentif au redimensionnement du fureteur

	 $(window).resize(function () {
		engine.resize();
	});

	//___________CAPTURE_D'ÉCRAN____________

	var captureBabylon;
	var captureCarte;
	var captureFabric;
	var captureViewer;
	var capCameraPosition;
	var capCameraTarget;	

	$("#capture").click(function() {

		capCameraPosition = camera.position;
		capCameraTarget = camera.getTarget();

		// Ajout de la balise de capture

		var punaise = BABYLON.MeshBuilder.CreateSphere("punaise", {diameter: planRadius/100}, scene);
		var punaiseMat = new BABYLON.StandardMaterial("punaiseMat", scene);
		punaiseMat.emissiveColor = new BABYLON.Color3(1, 0, 0);
		punaiseMat.diffuseColor = new BABYLON.Color3(1, 0, 0);
		punaiseMat.specularColor = new BABYLON.Color3(1, 0, 0);
		punaise.material = punaiseMat;
		punaise.position = new BABYLON.Vector3(capCameraPosition.x, cpeumMesh.getBoundingInfo().boundingBox.maximumWorld.y, capCameraPosition.z);
			
		// Ajout de la ligne de vision

		var isoColor = new BABYLON.Color4(1,0,0,1);
		var isovist = BABYLON.MeshBuilder.CreateLines("isovist", {
			points: [punaise.position, new BABYLON.Vector3(capCameraTarget.x, cpeumMesh.getBoundingInfo().boundingBox.maximumWorld.y, capCameraTarget.z)],
			colors: [isoColor, new BABYLON.Color4(0,0,0,1)],
			useVertexAlpha: false,
		}, scene);
		punaise.alwaysSelectAsActiveMesh = true;
		isovist.alwaysSelectAsActiveMesh = true;

		// Fonction pour révéler les images dans l'interface

		var revealCaptures = function () {
			$("#gallery").append(
								'<div class="capture">'+
									'<img class="captureImage captureViewer" src="'+captureViewer+'"/>'+
									'<div class="vue">'+
										'<div class="vue-capture" title="Retourner au point de vue" campositionX="'+capCameraPosition.x+'" campositionY="'+capCameraPosition.y+'" campositionZ="'+capCameraPosition.z+'" camtargetX="'+capCameraTarget.x+'" camtargetY="'+capCameraTarget.y+'" camtargetZ="'+capCameraTarget.z+'">'+									
											'<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="50px" height="50px" viewBox="0 0 50 50" enable-background="new 0 0 50 50" xml:space="preserve"><g><path d="M24.954,0.563c-8.965,0-16.232,7.269-16.232,16.232c0,8.608,16.232,27.729,16.232,27.729s16.233-19.122,16.233-27.729C41.188,7.831,33.918,0.563,24.954,0.563z M30.298,10.446l2.582-1.413c0.446-0.245,1.336,1.376,0.889,1.622l-2.582,1.413c-0.142,0.077-0.294,0.114-0.443,0.114C30.416,12.182,29.851,10.691,30.298,10.446z M26.446,23.913c-0.44-0.461-1.792-1.762-2.728-2.231l-10.16-5.093c-0.313-0.157-0.313-1.497,0-1.653l10.162-5.094c1.446-0.725,2.674-2.172,2.687-2.186c0.331-0.393,1.744,0.797,1.416,1.188c-0.056,0.068-1.337,1.57-2.995,2.494c0.057,0.063,0.117,0.122,0.157,0.201c0.663,1.321,1,2.743,1,4.224c0,1.482-0.336,2.904-1,4.225c-0.04,0.079-0.089,0.148-0.146,0.209c1.353,0.789,2.875,2.367,2.945,2.439C28.136,23.004,26.628,24.103,26.446,23.913zM32.88,22.037l-2.582-1.413c-0.447-0.245,0.439-1.868,0.889-1.622l2.582,1.414C34.216,20.66,33.021,22.114,32.88,22.037zM34.243,17h-2.774C30.958,17,31,16.511,31,16s-0.042-1,0.469-1h2.774c0.511,0,0.549,0.489,0.549,1S34.754,17,34.243,17z"/><path d="M23.854,13.724c-0.129-0.465-0.302-0.918-0.522-1.357c-0.037-0.074-0.046-0.153-0.063-0.23l-7.233,3.625l7.233,3.625c0.016-0.078,0.025-0.156,0.063-0.231c0.237-0.472,0.418-0.959,0.55-1.461c0.024-0.09-1.341-1.097-1.341-1.934S23.889,13.849,23.854,13.724z"/></g><path d="M24.954,49.25c-3.101,0-6.039-0.579-8.273-1.631c-2.594-1.222-4.023-2.98-4.023-4.952s1.429-3.73,4.023-4.952c0.75-0.352,2.028,2.361,1.278,2.715c-1.419,0.668-2.301,1.525-2.301,2.237s0.882,1.569,2.301,2.237c1.815,0.855,4.365,1.346,6.995,1.346c2.63,0,5.18-0.49,6.995-1.346c1.419-0.668,2.301-1.525,2.301-2.237s-0.882-1.569-2.301-2.237c-0.75-0.354,0.529-3.066,1.277-2.715c2.595,1.222,4.023,2.98,4.023,4.952s-1.429,3.73-4.023,4.952C30.993,48.671,28.056,49.25,24.954,49.25z"/></svg>'+
										'</div>'+
										'<img class="captureImage captureCarte" src="'+captureCarte+'"/>'+
									'</div>'+									
								'</div>'
							);
			$("#gallery").children().last().delay(600).animate({ opacity : "1"}, 800);
			$("#gallery").delay(500).animate({scrollTop: $("#gallery").prop("scrollHeight")}, 600);
		}

		var appendCaptures = function () {

			// Si en train de dessiner...

			if (calqueState) {
				captureFabric = calque.toDataURL("image/png", 1.0);
				mergeImages([captureBabylon, captureFabric]).then(b64 => {
					captureViewer = b64;
					revealCaptures();
				});
			}

			// Sinon, si pas en train de dessiner...

			else {
				captureViewer = captureBabylon;
				revealCaptures();
			};
			
		};

		// Fonction de capture de la carte

		var cartePromise = function () {

			//scene.clearColor = new BABYLON.Color4(1,1,1,0.0000000001)
			scene.render();				
			BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, camera2, 1600, function (data) {
				captureCarte = data;

				// Retrait de la balise de capture (essentiel sinon elle intercepte les "pick" ultérieurs)
				punaise.alwaysSelectAsActiveMesh = false;
				isovist.alwaysSelectAsActiveMesh = false;
				punaise.dispose();
				isovist.dispose();

				appendCaptures();
			}, undefined, 16, true);
		};

		// Fonction de capture du panneau principal

		var viewerPromise = function () {

			BABYLON.Tools.CreateScreenshot(engine, camera, {
				width: canvas.width,
				height: canvas.height,
				precision: 1,
				},
				function (data) {
					captureBabylon = data					
					cartePromise();
				}				
			);						
		};

		viewerPromise();

	});

	// Restituer la vue de la capture

	$("#gallery").on("click", ".vue-capture", function () {
		var ease = new BABYLON.CubicEase();
		ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
		var speed = 45;
		var duration = 100;
		var framing;

		var restoredTarget = new BABYLON.Vector3($(this).attr("camtargetX"), $(this).attr("camtargetY"), $(this).attr("camtargetZ"));
		var restoredPosition = new BABYLON.Vector3($(this).attr("campositionX"), $(this).attr("campositionY"), $(this).attr("campositionZ"));

		BABYLON.Animation.CreateAndStartAnimation("targetRestore", camera, "target", speed, duration, camera.target, restoredTarget, 0, ease);
		BABYLON.Animation.CreateAndStartAnimation("positionRestore", camera, "position", speed, duration, camera.position, restoredPosition, 0, ease);
	});


//____________________UX global____________________


	// Ouverture-fermeture du calque de dessin et suivi de l'état

	var calqueState = false;

	$("#dessiner").on("click", function () {
		calqueState = !calqueState;
		$("#dessin-pane").slideToggle(350);
		$(this).children(".arret-dessiner").fadeToggle(200);
		console.log("calque state ="+calqueState);
	});

	// Surlignage du mode Dessiner

	var activeDessiner = function () {
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

	var activeEcrire = function () {
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

	// Lightbox de la galerie

	var boiteOpen = false
	
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
			console.log(captureURLs);
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

	// Importation de média

	//$("#importer")

});
