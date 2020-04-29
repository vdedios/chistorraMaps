var platform = new H.service.Platform({
    apikey: "eD_IzP_4psnri8dg2gg3-AdnamvR5vriLzfDccLfW1A"
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

//--------NOTA-------------------
//Si no carga la geolocalización, hay posición por default
//Ahora solo queda organizar el código para que haya datos en ambos, localizado y no
//--------------------------------

if(navigator.geolocation) {
    /*------------------------GEO LOCALIZATION-------------------------------------*/
    navigator.geolocation.getCurrentPosition(position => {

        // console.log(position);
        // set maker position using the latitude and longitude in the received position
        markerPosition = {lat:position.coords.latitude,lng:position.coords.longitude};
        //  create pos makrker element using the received position
        var icon = new H.map.Icon('img/home.png');
        posMarker = new H.map.Marker(markerPosition,{icon: icon});
        posMarker.id = "myPos";
        map.addObject(posMarker);
        map.setCenter(markerPosition);
        /*------------------------CIRCLE-----------------------------------------------------*/
        //--------NOTA--------------------
        //Queda modificar el radio y la vista en función del vehículo. Para ello añadir una query adicional
        //Como default está para ir andando y a 100m.
        //--------------------------------
        var circle = newCircle(markerPosition, map);
        /*------------------------RESTAURANT DATA-------------------------------------*/
        // Displaying data
        var group = new H.map.Group();

        map.addObject(group);
        displayDATA(1, map, circle, group);
        addInfoBubble(map);

        /*-------------------MODIFYING DATA FROM DOM----------------------------*/
        //Modifying range and display data  with slider data
        $$('#range').forEach(c => c.onchange = () => {
            removeObjectById("marker", map);
            circle.setRadius(document.getElementById('range').value); 
            map.getViewModel().setLookAtData({bounds: circle.getBoundingBox()});
            displayDATA(1, map, circle, group);
        });
        //Get new address from input
        document.getElementById('change-start').onclick = addStartingMarker;
        addStartingMarker();
        async function addStartingMarker() {
            const startAddress = document.getElementById('start').value;
            const coordsNEW = await geocode(startAddress);
            markerPosition = {lat: coordsNEW.Latitude, lng: coordsNEW.Longitude};
            await map.getViewModel().setLookAtData({position: markerPosition});
            removeObjectById("marker", map);
            posMarker = new H.map.Marker(markerPosition,{icon: icon});
            //removeObjectById("marker");
            circle.setCenter(markerPosition); 
            removeObjectById("marker", map);
            displayDATA(1, map, circle, group);
        }
    /*------------------------NO GEO LOCALIZATION-------------------------------------*/
    }, function(){
        map.setCenter(initPos);
        var circle = 0;
        displayDATA(0, map, "");
        //Modifying range and display data  with slider data
        $$('#range').forEach(c => c.onchange = () => {
            removeObjectById("marker", map);
            if (circle){
                 circle.setRadius(document.getElementById('range').value); 
                map.getViewModel().setLookAtData({bounds: circle.getBoundingBox()});
                displayDATA(1, map, circle, group);
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
            removeObjectById("marker", map);
            if (!circle)
                circle = newCircle(markerPosition, map);
            posMarker = new H.map.Marker(markerPosition,{icon: icon});
            //removeObjectById("marker");
            circle.setCenter(markerPosition); 
            removeObjectById("marker", map);
            displayDATA(1, map, circle, group);
        }
    }
    );
}
//Calculate distance betwenn two coordinates
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

function addMarkerToGroup(coordinate, html, group) {
    console.log(html.properties)
    var evIcon = new H.map.Icon('img/bar.png');
    var marker = new H.map.Marker(coordinate, { icon: evIcon });
    // add custom data to the marker
    if (html.properties.imagen)
        imagen = html.properties.imagen;
    else
        imagen = "assets/images/default.png"
    if (html.properties.cocina)
        cocina = html.properties.cocina
    else
        cocina = "Vegetariana"
    telefono = "91 580 42 60";
    marker.setData(`<h5 style="width: 10em;">${html.properties.NombreComercial}</h5> <p>${html.properties.Dirección}</p> <i>${telefono}</i> <i>${cocina}</i>`);
    marker.id = "marker";
    group.addObject(marker);
  }

function addMarker(newPos,respData, map){
    var evIcon = new H.map.Icon('img/bar.png');
    evMarker = new H.map.Marker(newPos,{ icon: evIcon });
    evMarker.setData(respData);
    evMarker.id = "marker";
    map.addObject(evMarker);
}
function addInfoBubble(map){
    map.addEventListener('tap', function (evt) {
        var bubble =  new H.ui.InfoBubble(evt.target.getGeometry(), {
            // read custom data
            content: evt.target.getData()
        });
        // show info bubble
        ui.addBubble(bubble);
    }, false);
}
function displayDATA(id, map, circle, group){
    let url = 'https://xyz.api.here.com/hub/spaces/E6c8u3US/search?limit=5000&clientId=cli&access_token=AOzek1XSRkWM9CxFWw47egA';
    fetch(url, {
        "method": "GET"
    }).then(response => response.json()
    ).then(response => {
        //console.log(response);
        // If distance between item and circle center is less than circle radious, create it and display it
        for (i=0; i < response.features.length; i++){
            //console.log(response.features[i])
            if (id){
                if (circle.getRadius() > distanceCoords(response.features[i].geometry.coordinates[1],
                    response.features[i].geometry.coordinates[0],
                    markerPosition.lat, markerPosition.lng)){
                    newPos= ({lat: response.features[i].geometry.coordinates[1], lng: response.features[i].geometry.coordinates[0]});
                    respData= response.features[i];
                    addMarkerToGroup(newPos, respData, group);
                    //--------NOTA--------------------
                    // Aqui es donde se tienen que ir creando las tarjetas
                    //--------------------------------
                }
            }
            //Default when no device position
            else{
                newPos= ({lat: response.features[i].geometry.coordinates[1], lng: response.features[i].geometry.coordinates[0]});
                respData= response.features[i].id;
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
