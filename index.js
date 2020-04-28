var platform = new H.service.Platform({
    apikey: "eD_IzP_4psnri8dg2gg3-AdnamvR5vriLzfDccLfW1A"
});
const $$ = qq => document.querySelectorAll(qq);
// Obtain the default map types from the platform object:
var defaultLayers = platform.createDefaultLayers();
var initPos = {lat: 40.4165000, lng: -3.7025600};

// Instantiate (and display) a map object:
var map = new H.Map(
    document.getElementById('map'),
    defaultLayers.vector.normal.map,
    {
        zoom: 17,
        center: initPos
    });
var ui = H.ui.UI.createDefault(map, defaultLayers);
var mapEvents = new H.mapevents.MapEvents(map);
var behavior = new H.mapevents.Behavior(mapEvents);

/*------------------------GEO LOCALIZATION-------------------------------------*/
if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
        // console.log(position);
        // set maker position using the latitude and longitude in the received position
        markerPosition = {lat:position.coords.latitude,lng:position.coords.longitude};
        //  create makrker element using the received position
        var icon = new H.map.Icon('img/home.png');
        posMarker = new H.map.Marker(markerPosition,{icon: icon});
        posMarker.setData("I'm HERE");
        //  Add marker to map.
        map.addObject(posMarker);
        map.setCenter(markerPosition);
        map.getViewModel().setLookAtData({
            position: markerPosition,
            zoom: 19,
            heading: 0,
            tilt: 0});
        // user marker
        /*
        var icon = new H.map.Icon('img/home_logo.png');
        var posMarker = new H.map.Marker(myPos,{ icon: icon});
        map.addObject(posMarker);
        */

        /*------------------------RESTAURANT DATA-------------------------------------*/
        // Displaying data
        function displayDATA(){
            let url = 'https://xyz.api.here.com/hub/spaces/aNWlspJr/search?limit=500&clientId=cli&access_token=AArSIpgPS0SB6ATsrgYQywA';
            fetch(url, {
                "method": "GET"
            }).then(response => response.json()
            ).then(response => {
                console.log(response);
                // create a marker object
                for (i=0; i < response.features.length; i++){
                    newPos= ({lat: response.features[i].geometry.coordinates[1], lng: response.features[i].geometry.coordinates[0]});
                    respData= response.features[i].id;
                    addMarker(newPos, respData);
                }
            })
        }

        function addMarker(newPos,respData){
            var evIcon = new H.map.Icon('img/bar.png');
            evMarker = new H.map.Marker(newPos,{ icon: evIcon });
            evMarker.setData(respData);
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
        displayDATA();
        addInfoBubble(map);

        /*------------------------CIRCLE-----------------------------------------------------*/
        /*
        var customStyle = {
                    strokeColor: 'dark green',
                    fillColor: 'rgba(0, 255, 100, 0.2)',
                    lineWidth: 1,
                };
        function drawCircle(){
        var circle = new H.map.Circle(myPos,5000);
        map.addObject(circle);
        }

        drawCircle();
        */
        /*------------------------ISOLINES-----------------------------------------------------*/
        var myLoc = markerPosition.lat + ',' + markerPosition.lng;
        var routingParams = {
            'mode': 'fastest;car;',
            'start': myLoc,
            'range': 200, 
            'rangetype': 'distance'
        };
        var onResult = function(result) {
            var center = new H.geo.Point(
                result.response.center.latitude,
                result.response.center.longitude),
                isolineCoords = result.response.isoline[0].component[0].shape,
                linestring = new H.geo.LineString(),
                isolinePolygon,
                isolineCenter;
                isolineCoords.forEach(function(coords) {
                    linestring.pushLatLngAlt.apply(linestring, coords.split(','))
            })
            isolinePolygon = new H.map.Polygon(linestring);
            map.addObject(isolinePolygon);
            map.getViewModel().setLookAtData({bounds: isolinePolygon.getBoundingBox()});
        }
        var router = platform.getRoutingService();
        router.calculateIsoline(
            routingParams,
            onResult,
            function(error) {
                alert(error.message)
            }
        );
        
        $$('#range').forEach(c => c.onchange = () => {routingParams.range = document.getElementById('range').value; displayDATA()});
    });

}
else {
    console.error("Geolocation is not supported by this browser!");
    
}
console.log("hola")
$$('#range').on('slide', function (ev) {
    console.log("hola")
});
