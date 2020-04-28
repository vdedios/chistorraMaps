var platform = new H.service.Platform({
    apikey: "eD_IzP_4psnri8dg2gg3-AdnamvR5vriLzfDccLfW1A"
});

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
        var icon = new H.map.Icon('img/home_logo.png');
        posMarker = new H.map.Marker(markerPosition,{icon: icon});
        posMarker.setData("I'm HERE");
        //  Add marker to map.
        map.addObject(posMarker);
        map.setCenter(markerPosition);
        map.getViewModel().setLookAtData({
            position: markerPosition,
            zoom: 19,
            heading: 0,
            tilt: 60});
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
    var myLoc = myPos.lat + ',' + myPos.lng;
    var routingParams = {
            'mode': 'fastest;car;',
            'start': myLoc,
            'range': '600', // 10 (10x60secs) minutes of driving
            'rangetype': 'time'
    };
    // Define a callback function to process the isoline response.
        var onResult = function(result) {
            var center = new H.geo.Point(
                result.response.center.latitude,
                result.response.center.longitude),
                isolineCoords = result.response.isoline[0].component[0].shape,
                linestring = new H.geo.LineString(),
                isolinePolygon,
                isolineCenter;

        // Add the returned isoline coordinates to a linestring:

            isolineCoords.forEach(function(coords) {
                linestring.pushLatLngAlt.apply(linestring, coords.split(','))
            })

// Create a polygon and a marker representing the isoline:

            isolinePolygon = new H.map.Polygon(linestring);

// Add the polygon and marker to the map:

            map.addObject(isolinePolygon);

// Center and zoom the map so that the whole isoline polygon is
// in the viewport:

            map.getViewModel().setLookAtData({bounds: isolinePolygon.getBoundingBox()});
        }

    // Get an instance of the routing service:

        var router = platform.getRoutingService();

    // Call the Routing API to calculate an isoline:

        router.calculateIsoline(
            routingParams,
            onResult,
            function(error) {
                alert(error.message)
            }
        );
    });
}
else {
    console.error("Geolocation is not supported by this browser!");
}
