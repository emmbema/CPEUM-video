$(document).ready(function () {


/*** CPEUM VIDEO-CARTE ***/

// Création de la carte du "viewer"
carte = L.map("cpeum-carte", {attributionControl: false, zoomControl: false, preferCanvas: true});
carte.setView([45.508, -73.587], 8);
// L.tileLayer("http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
// 	attribution: "",//'&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
// 	maxZoom: 20,
// }).addTo(carte);
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
	maxZoom: 19
}).addTo(carte);

// Création d'une carte pour les captures
carteCapture = L.map("cpeum-carte-capture", {attributionControl: false, zoomControl: false, preferCanvas: true});
carteCapture.setView([45.508, -73.587], 8);
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19
}).addTo(carteCapture);

videoTime = 0;
punaiseInited = false;

// Suite à la lecture des fichiers importés (et suite à la conversion vers GeoJSON si fichier .gpx) : création du tracé gps et de la punaise
cpeumGPS = function () {
	if ( punaiseInited ) { carte.removeLayer(punaise); carteCapture.removeLayer(punaiseCapture) };
	gpsLayer = L.geoJSON(gpsData, {color: "rgba(255,255,255,0.75)", weight: 4}).addTo(carte);
	gpsLayerCapture = L.geoJSON(gpsData, {color: "rgba(0,0,0,0.75)", weight: 4}).addTo(carteCapture);
	carte.flyToBounds(gpsLayer.getBounds(), {animate: true, duration: 1.5});
	carteCapture.flyToBounds(gpsLayer.getBounds(), {animate: false});
	punaiseLatLng = L.GeoJSON.coordsToLatLng(gpsData.geometry.coordinates[0]);
	punaise = L.circleMarker(punaiseLatLng, {radius: 8, color: "rgb(250,252,255)", fillColor: "rgb(35,45,245)", fillOpacity: 1}).addTo(carte);
	punaiseCapture = L.circleMarker(punaiseLatLng, {radius: 8, color: "rgb(250,252,255)", fillColor: "rgb(35,45,245)", fillOpacity: 1}).addTo(carteCapture);
	punaiseInited = true;
}

// Rester attentif au timestamp du vidéo et positionner la punaise en conséquence
$("#cpeum-video").on("timeupdate", function(e) {
	videoTime = e.target.currentTime;
	gpsIndex = gpsData.properties.RelativeMicroSec.findIndex( function (n) {
		return n >= videoTime*1000000;
	});
	punaiseLatLng = L.GeoJSON.coordsToLatLng(gpsData.geometry.coordinates[gpsIndex]);
	punaise.setLatLng(punaiseLatLng);
	punaiseCapture.setLatLng(punaiseLatLng);
});


// Importation de média
gpxFlag = false;

$("#importer").on("input", function (event) {

	var lecteurGPS = new FileReader();
	lecteurGPS.onloadend = function(e) {
		if ( gpxFlag ) {

			// gpsData = Fonction de conversion vers geoJSON (lecteurGPS.result);
			var gpx = e.target.result
			gpsData = toGeoJSON.gpx(jQuery.parseXML(gpx)).features[0];

			// Correction du formattage des timestamps
			var absTime = [];
			var relTime = [];
			gpsData.properties.coordTimes.forEach( function (rawTime) {
				absTime.push(Date.parse(rawTime)*1000);
				relTime.push(Date.parse(rawTime)*1000-absTime[0]);
			});
			gpsData.properties.AbsoluteUtcMicroSec = absTime;
			gpsData.properties.RelativeMicroSec = relTime;
			
			gpxFlag = false;
		} else {
			gpsData = JSON.parse(e.target.result);
		};			
		cpeumGPS();
	};

	var vidData;
	var lecteurVideo = new FileReader();
	lecteurVideo.onloadend = function(e) {
		vidData = new Uint8Array(e.target.result);
		console.log(vidData);
	}

	for ( var i = 0; i < event.target.files.length; i++ ) {

		currentFile = event.target.files[i];
		extension = currentFile.name.split(".").pop();

		// Si le fichier est un vidéo (.mp4 ou .mov)...
		if ( currentFile.type=="video/mp4" || extension=="mov" ) {
			$("#cpeum-video").attr("src", URL.createObjectURL(currentFile));
			document.title = "CPEUM : " + currentFile.name.substr(0,currentFile.name.lastIndexOf("."));
		}
		// S'il s'agit de données gps...
		else if ( extension=="gpx" ) {
			gpxFlag = true;
			lecteurGPS.readAsText(currentFile);
		}
		else if ( extension=="geojson" ) {
			lecteurGPS.readAsText(currentFile);
		}
		// S'il ne correspond à aucun de ces formats...
		else { 
			alert("Les fichiers ne semblent pas être de formats compatibles. S.V.P. s'assurer d'utiliser une vidéo (.mp4) et un tracé gps (.gpx ou .geojson)");
		};
	};		
});

// Importation par drag and drop
//$("#viewer-pane").wrap("<form></form>")


/*** FIN CPEUM VIDEO-CARTE ***/

});
