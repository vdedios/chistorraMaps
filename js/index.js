var platform = new H.service.Platform({
    apikey: "VJoA7tGmC3RqiMzEPFBaLmfsHdU2GnJBRgD88cBBuwA"
});
const $$ = qq => document.querySelectorAll(qq);
// Obtain the default map types from the platform object:
var defaultLayers = platform.createDefaultLayers();
var initPos = {lat: 40.4165000, lng: -3.7025600};
var map = new H.Map(
    document.getElementById('map'),
    defaultLayers.vector.normal.map,
    {
        position: initPos,
        zoom: 12,
        heading: 180,
        tilt: 0
    });
var ui = H.ui.UI.createDefault(map, defaultLayers);
var mapEvents = new H.mapevents.MapEvents(map);
var behavior = new H.mapevents.Behavior(mapEvents);
var geoPosition;

//--------NOTA-------------------
//Si no carga la geolocalización, hay posición por default
//--------------------------------
if(navigator.geolocation) {
    /*------------------------GEO LOCALIZATION-------------------------------------*/
    navigator.geolocation.getCurrentPosition(position => {
        // console.log(position);
        geoPosition = position;
        // set maker position using the latitude and longitude in the received position
        markerPosition = {lat:position.coords.latitude,lng:position.coords.longitude};
        //  create pos makrker element using the received position
        var icon = new H.map.Icon('assets/markers/home.png');
        posMarker = new H.map.Marker(markerPosition,{icon: icon});
        posMarker.id = "myPos";
        map.addObject(posMarker);
        map.setCenter(markerPosition);
        /*------------------------CIRCLE-----------------------------------------------------*/
        var circle = newCircle(markerPosition, map);
        /*------------------------RESTAURANT DATA-------------------------------------*/
        // Displaying data
        var group = new H.map.Group();
        let option = 0;
        map.addObject(group);
        displayDATA(1, map, circle, group, document.getElementById('sel1').selectedIndex);
        addInfoBubble(map);
        /*-------------------MODIFYING DATA FROM DOM----------------------------*/
        //Modifying range and display data  with slider data
        $$('#range').forEach(c => c.onchange = () => {
            removeObjectById("marker", map);
            removeObjectById("marker", group);
            circle.setRadius(document.getElementById('range').value); 
            map.getViewModel().setLookAtData({bounds: circle.getBoundingBox()});
            displayDATA(1, map, circle, group, document.getElementById('sel1').selectedIndex);
        });
        //Get new address from input
        document.getElementById('change-start').onclick = addStartingMarker;
        addStartingMarker(option);
        async function addStartingMarker(option) {
            const startAddress = document.getElementById('start').value;
            const coordsNEW = await geocode(startAddress);
            markerPosition = {lat: coordsNEW.Latitude, lng: coordsNEW.Longitude};
            await map.getViewModel().setLookAtData({position: markerPosition});
            removeObjectById("marker", map);
            removeObjectById("marker", group);
            circle.setCenter(markerPosition); 
            posMarker = new H.map.Marker(markerPosition,{icon: icon});
            posMarker.id = "myPos";
            map.addObject(posMarker);
            displayDATA(1, map, circle, group, document.getElementById('sel1').selectedIndex);
        }
        //Food filtering
        document.getElementById('sel1').onchange = filterFoodSelection;
        option = filterFoodSelection();
        function filterFoodSelection(){
            removeObjectById("marker", map);
            removeObjectById("marker", group);
            posMarker = new H.map.Marker(markerPosition,{icon: icon});
            circle.setCenter(markerPosition); 
            displayDATA(1, map, circle, group, document.getElementById('sel1').selectedIndex);
            return document.getElementById('sel1').selectedIndex;
        }
        /*------------------------NO GEO LOCALIZATION-------------------------------------*/
    }, function(){
        var icon = new H.map.Icon('assets/logos/home.png');
        posMarker = new H.map.Marker(initPos,{icon: icon});
        posMarker.id = "myPos";
        map.addObject(posMarker);
        map.setCenter(initPos);
        var circle = 0;
        var group = new H.map.Group();
        let option = 0;
        map.addObject(group);
        displayDATA(0, map, "", group, option);
        //Modifying range and display data  with slider data
        $$('#range').forEach(c => c.onchange = () => {
            if (circle){
                removeObjectById("marker", map);
                removeObjectById("marker", group);
                circle.setRadius(document.getElementById('range').value); 
                map.getViewModel().setLookAtData({bounds: circle.getBoundingBox()});
                displayDATA(1, map, circle, group, document.getElementById('sel1').selectedIndex);
            }
        });
        //Get new address from input
        document.getElementById('change-start').onclick = addStartingMarker;
        addStartingMarker();
        async function addStartingMarker() {
            const startAddress = document.getElementById('start').value;
            const coordsNEW = await geocode(startAddress);
            markerPosition = {lat: coordsNEW.Latitude, lng: coordsNEW.Longitude};
            await map.getViewModel().setLookAtData({position: markerPosition});
            if (!circle)
                circle = newCircle(markerPosition, map);
            removeObjectById("marker", map);
            removeObjectById("marker", group);
            circle.setCenter(markerPosition); 
            posMarker = new H.map.Marker(markerPosition,{icon: icon});
            posMarker.id = "myPos";
            map.addObject(posMarker);
            displayDATA(1, map, circle, group, document.getElementById('sel1').selectedIndex);
        }
    }
    );
}
//Calculate distance betwenn two coordinates
function addMarkerToGroup(coordinate, html, group) {
    //console.log(html.properties)
    if (html.properties.ruta_tapa == "1"){
        var evIcon = new H.map.Icon('assets/markers/marker_rutaTapa.png');
    }
    else{
        if (html.properties.cocina == "TAPAS"){
            var evIcon = new H.map.Icon('assets/markers/marker_tapas.png');
        }
        else if (html.properties.cocina == "POSTRES"){
            var evIcon = new H.map.Icon('assets/markers/marker_postre.png');
        }
        else if (html.properties.cocina == "AMERICANA"){
            var evIcon = new H.map.Icon('assets/markers/marker_americana.png');
        }
        else if (html.properties.cocina == "INTERNACIONAL"){
            var evIcon = new H.map.Icon('assets/markers/marker_internacional.png');
        }
        else if (html.properties.cocina == "GALLEGA"){
            var evIcon = new H.map.Icon('assets/markers/marker_gallega.png');
        }
        else if (html.properties.cocina == "ASTURIANA"){
            var evIcon = new H.map.Icon('assets/markers/marker_asturiana.png');
        }
    }
    var marker = new H.map.Marker(coordinate, { icon: evIcon });
    if (html.properties.imagen)
        imagen = html.properties.imagen;
    else
        imagen = "assets/images/default.png"
    if (html.properties.cocina)
        cocina = html.properties.cocina
    else
        cocina = "AMERICANA"
    telefono = "91 580 42 60";
    url = `https://www.here.com/directions/${mode}/start:${geoPosition.coords.latitude},${geoPosition.coords.longitude}/end:${html.geometry.coordinates[1]},${html.geometry.coordinates[0]}`
    marker.setData(`<figure id="cardFigure"><img id="cardImage"src="${imagen}"/></figure>
            <div id="cardDecription">
                <div id="cardDescriptionInfo">
                <h5 id="cardDescriptionTitle">${html.properties.NombreComercial}</h5>
                <p id="cardDescriptionAddress">${html.properties.Dirección}</p>
                <p class="cardDescriptionInfo"><i>${telefono}</i></p>
                <p class="cardDescriptionInfo"><i>${cocina}</i></p>
                </div>
                <div id="cardPrice">
                    <a id="cardPriceAnchor" href=" ${url} ">
                        <img id="cardPriceImage" src="assets/logos/directions.png"/>
                    </a>
                    <p id="cardPricePrice">€€</p>
                </div>
            </div>`);
    marker.id = "marker";
    group.addObject(marker);
}
function addInfoBubble(map){
    map.addEventListener('tap', function (evt) {
        if (evt.target.Tg)
        {
            console.log(evt.target)
            if (evt.target.getData())
            {
                document.getElementById("cardInfo").innerHTML = evt.target.getData();
                document.getElementById("cardInfo").style.display = "flex";
            }
            else
                document.getElementById("cardInfo").style.display = "none";
        }
        else
            document.getElementById("cardInfo").style.display = "none";
    }, false);
}
function displayDATA(id, map, circle, group, option){
    let url = `https://xyz.api.here.com/hub/spaces/E6c8u3US/spatial?lat=${markerPosition.lat}&lon=${markerPosition.lng}&radius=${circle.getRadius()}`;
    if (option == 1)
        url = url + '&p.cocina=ASTURIANA'
    else if (option == 2)
        url = url + '&p.cocina=GALLEGA'
    else if (option == 3)
        url = url + '&p.cocina=INTERNACIONAL'
    else if (option == 4)
        url = url + '&p.cocina=AMERICANA'
    else if (option == 5)
        url = url + '&p.cocina=POSTRES'
    else if (option == 6)
        url = url + '&p.cocina=TAPAS'
    else if (option == 7)
        url = url + '&p.ruta_tapa=1'
    url = url + '&clientId=cli&access_token=AOzek1XSRkWM9CxFWw47egA'
    fetch(url, {
        "method": "GET"
    }).then(response => response.json()
    ).then(response => {
        for (i=0; i < response.features.length; i++){
            if (id){
                newPos= ({lat: response.features[i].geometry.coordinates[1], lng: response.features[i].geometry.coordinates[0]});
                respData= response.features[i];
                addMarkerToGroup(newPos, respData, group);
            }
            else{
                newPos= ({lat: response.features[i].geometry.coordinates[1], lng: response.features[i].geometry.coordinates[0]});
                respData= response.features[i];
                addMarkerToGroup(newPos, respData, group);
            }
        }
    })
}
function removeObjectById(id, map){
    for (object of map.getObjects()){
        if (object.id===id){
            map.removeObject(object);
        }
    }
}
async function geocode(query) {
    const url = `https://geocoder.ls.hereapi.com/6.2/geocode.json?apiKey=eD_IzP_4psnri8dg2gg3-AdnamvR5vriLzfDccLfW1A&searchtext=${query}`
    const response = await fetch(url);
    const data = await response.json();
    return await data.Response.View[0].Result[0].Location.NavigationPosition[0];
}
function newCircle (markerPosition, map){
    var myLoc = markerPosition.lat + ',' + markerPosition.lng;
    var customStyle = {
        strokeColor: 'black',
        fillColor: 'rgba(29, 25, 25, 0.2)',
        lineWidth: 1,
    };
    var circle = new H.map.Circle(markerPosition, 120,{ style: customStyle });
    circle.id = "circle";
    map.addObject(circle);  
    map.getViewModel().setLookAtData({bounds: circle.getBoundingBox()});
    return circle
}
window.addEventListener('resize', () => map.getViewPort().resize());

function distanceCoords(lat1,lon1,lat2,lon2) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1/180;
        var radlat2 = Math.PI * lat2/180;
        var theta = lon1-lon2;
        var radtheta = Math.PI * theta/180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        dist = dist * 1609.344;
        return dist;
    }
}
document.getElementById('sidebarCollapse').addEventListener("click", function(){
    console.log(map.getViewPort())
    map.getViewPort().resize();
});
var mode = "walk";
document.getElementById('car').addEventListener('click', function (){
    mode = 'drive';
})
document.getElementById('bike').addEventListener('click', function (){
    mode = 'bike';
})
document.getElementById('walk').addEventListener('click', function (){
    mode = 'walk';
})
