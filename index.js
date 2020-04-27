const here = {
    apiKey : 'VJoA7tGmC3RqiMzEPFBaLmfsHdU2GnJBRgD88cBBuwA'
};

const map = L.map('map', {
   center: [40.4165000, -3.7025600],
   zoom: 13,
   layers: [
      Tangram.leafletLayer({
         scene: 'scene.yaml',
         events: {
            click: onMapClick
         }
      })
   ],
   zoomControl: false
});

async function onMapClick() {
   //We will write code in here later...
}

async function geocode(query) {
   const url = `https://geocoder.ls.hereapi.com/6.2/geocode.json
?apiKey=${here.apiKey}&searchtext=${query}`
   const response = await fetch(url);
   const data = await response.json();
   return await data.Response.View[0].Result[0].Location.NavigationPosition[0];
}

