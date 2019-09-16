$(document).ready(function () {


/*** CPEUM VIDEO-CARTE ***/

carte = L.map("cpeum-carte", {attributionControl: false, zoomControl: false, preferCanvas: true});
carte.setView([45.508, -73.587], 8);
L.tileLayer("http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
	attribution: "",//'&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
	maxZoom: 20,
}).addTo(carte);

videoTime = 0;
punaiseInited = false;

// Suite à la lecture des fichiers importés (et suite à la conversion vers GeoJSON si fichier .gpx) : création du tracé gps et de la punaise
cpeumGPS = function () {
	if ( punaiseInited ) { carte.removeLayer(punaise); };
	gpsLayer = L.geoJSON(gpsData, {color: "rgba(0,0,0,0.75)"}).addTo(carte);
	carte.flyToBounds(gpsLayer.getBounds(), {animate: true, duration: 2.5});
	punaiseLatLng = L.GeoJSON.coordsToLatLng(gpsData.geometry.coordinates[0]);
	punaise = L.circleMarker(punaiseLatLng, {radius: 8, color: "rgb(250,252,255)", fillColor: "rgb(245,40,35)", fillOpacity: 1}).addTo(carte);
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


/*** FIN CPEUM VIDEO-CARTE ***/

});