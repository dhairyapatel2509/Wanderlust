mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    //center: [72.6231, 22.9831], starting position [lng, lat]. Note that lat must be set between -90 and 90
    style: 'mapbox://styles/mapbox/streets-v12', 
    center: listing.geometry.coordinates,
    zoom: 9, // starting zoom
});

const size = 300;

// This implements `StyleImageInterface` to draw a pulsing dot icon on the map.
const pulsingDot = {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),

    onAdd: function () {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext('2d');
    },

    render: function () {
        const duration = 1000;
        const t = (performance.now() % duration) / duration;

        const radius = (size / 2) * 0.3;
        const outerRadius = (size / 2) * 0.7 * t + radius;
        const context = this.context;

        // Draw the outer circle.
        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
        context.fillStyle = `rgba(255, 100, 100, ${1 - t})`;
        context.fill();

        // Draw the inner circle.
        context.beginPath();
        context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
        context.fillStyle = 'rgba(255, 255, 255, 1)';
        context.strokeStyle = 'white';
        context.lineWidth = 2 + 4 * (1 - t);
        context.fill();
        context.stroke();

        this.data = context.getImageData(0, 0, this.width, this.height).data;
        map.triggerRepaint();

        return true;
    }
};

map.on('load', () => {
    map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });

    // Add pulsing dot source and layer
    map.addSource('dot-point', {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': [{
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': listing.geometry.coordinates // icon position [lng, lat]
                }
            }]
        }
    });
    map.addLayer({
        'id': 'layer-with-pulsing-dot',
        'type': 'symbol',
        'source': 'dot-point',
        'layout': {
            'icon-image': 'pulsing-dot'
        }
    });

    });

// Optional: If you want to add a marker with a popup
// const marker = new mapboxgl.Marker({ color: 'red', rotation: 0 })
//     .setLngLat(listing.geometry.coordinates)
//     .setPopup(new mapboxgl.Popup({ offset: 25 })
//     .setHTML(`<h4>${listing.title}</h4><p>Exact location will be provided after booking</p>`))
//     .addTo(map);


const imageElement = document.createElement('div');
imageElement.style.backgroundImage = 'url(https://img.icons8.com/ios/50/000000/home.png)'; // Image URL
imageElement.style.backgroundSize = 'cover';
imageElement.style.width = '20px'; // Set desired width
imageElement.style.height = '20px'; // Set desired height

// Create the marker using the custom image element
const customMarker = new mapboxgl.Marker(imageElement)
    .setLngLat(listing.geometry.coordinates)
    .setPopup(new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<h4>${listing.title}</h4><p>Exact location will be provided after booking</p>`))
    .addTo(map);