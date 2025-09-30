// Initialize map centered on Hong Kong
var map = L.map('map', { 
    dragging: false,
    boxZoom: false, 
    doubleClickZoom: false,
    scrollWheelZoom: false,
    zoomControl: false 
}).setView([22.3640, 114.1150], 11);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.carto.com/">CARTO</a>'
}).addTo(map);

// Location data arrays
var locations = [];
var level2Locations = [];
var allMarkers = [];

// Load locations from CSV files
function loadLocations() {
    const loadLevel1 = fetch('data/level1_locations.csv')
        .then(response => response.text())
        .then(data => {
            const lines = data.trim().split('\n');
            for (let i = 1; i < lines.length; i++) {
                const [name, lat, lng] = lines[i].split(',');
                locations.push({ name, coords: [parseFloat(lat), parseFloat(lng)] });
            }
        });
    
    const loadLevel2 = fetch('data/level2_locations.csv')
        .then(response => response.text())
        .then(data => {
            const lines = data.trim().split('\n');
            for (let i = 1; i < lines.length; i++) {
                const [name, lat, lng, district_lat, district_lng] = lines[i].split(',');
                level2Locations.push({ 
                    name, 
                    coords: [parseFloat(lat), parseFloat(lng)] 
                });
            }
        });
    
    return Promise.all([loadLevel1, loadLevel2]);
}

// Display all locations on map
function displayAllLocations() {
    // Combine all locations
    const allLocations = [...locations, ...level2Locations];
    
    allLocations.forEach(location => {
        // Create blue marker for all locations
        var blueIcon = L.divIcon({
            className: 'custom-marker',
            html: '<div style="background-color: #007cba; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white;"></div>',
            iconSize: [15, 15],
            iconAnchor: [7, 7]
        });
        
        var marker = L.marker(location.coords, {icon: blueIcon}).addTo(map);
        marker.bindPopup(`<b>${location.name}</b>`);
        
        // Add click event to show info in right panel and zoom to location
        marker.on('click', function() {
            const imagePath = `img/${location.name}.jpg`;
            document.getElementById('location-info').innerHTML = `
                <h6>${location.name}</h6>
                <img src="${imagePath}" alt="${location.name}" style="width: 100%; max-width: 300px; height: auto; margin: 10px 0; border-radius: 5px;" onerror="this.style.display='none'">
                <p>Information about ${location.name} will be displayed here.</p>
            `;
            map.setView(location.coords, 15);
        });
        
        allMarkers.push(marker);
    });
}

// Add map click event to zoom out to original view
map.on('click', function(e) {
    // Check if click was not on a marker
    if (!e.originalEvent.target.closest('.leaflet-marker-icon')) {
        map.setView([22.3640, 114.1150], 11);
        document.getElementById('location-info').innerHTML = 'Click on any marker to learn about the location.';
    }
});

// Initialize study mode
loadLocations().then(() => {
    displayAllLocations();
});