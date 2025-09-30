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
                const line = lines[i];
                const parts = [];
                let current = '';
                let inQuotes = false;
                
                for (let j = 0; j < line.length; j++) {
                    const char = line[j];
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        parts.push(current);
                        current = '';
                    } else {
                        current += char;
                    }
                }
                parts.push(current);
                
                const name = parts[0];
                const lat = parseFloat(parts[1]);
                const lng = parseFloat(parts[2]);
                const description = parts[3] || '';
                locations.push({ name, coords: [lat, lng], description });
            }
        });
    
    const loadLevel2 = fetch('data/level2_locations.csv')
        .then(response => response.text())
        .then(data => {
            const lines = data.trim().split('\n');
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i];
                const parts = [];
                let current = '';
                let inQuotes = false;
                
                for (let j = 0; j < line.length; j++) {
                    const char = line[j];
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        parts.push(current);
                        current = '';
                    } else {
                        current += char;
                    }
                }
                parts.push(current);
                
                const name = parts[0];
                const lat = parseFloat(parts[1]);
                const lng = parseFloat(parts[2]);
                const district_lat = parseFloat(parts[3]);
                const district_lng = parseFloat(parts[4]);
                const description = parts[5] || '';
                level2Locations.push({ 
                    name, 
                    coords: [lat, lng],
                    district_coords: [district_lat, district_lng],
                    description
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
                <h1>${location.name}</h1>
                <img src="${imagePath}" alt="${location.name}" style="width: 100%; height: auto; margin: 10px 0; border-radius: 5px;" onerror="this.style.display='none'">
                <p>${location.description || 'Information about ' + location.name + ' will be displayed here.'}</p>
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
        document.getElementById('location-info').innerHTML = '<h4>Click on any marker to learn about the location.</h4>';
    }
});

// Initialize study mode
loadLocations().then(() => {
    displayAllLocations();
    
    // Check for location parameter
    const urlParams = new URLSearchParams(window.location.search);
    const locationName = urlParams.get('location');
    if (locationName) {
        // Find and click the specified location
        const allLocations = [...locations, ...level2Locations];
        const targetLocation = allLocations.find(loc => loc.name === locationName);
        if (targetLocation) {
            setTimeout(() => {
                const imagePath = `img/${targetLocation.name}.jpg`;
                document.getElementById('location-info').innerHTML = `
                    <h1>${targetLocation.name}</h1>
                    <img src="${imagePath}" alt="${targetLocation.name}" style="width: 100%; height: auto; margin: 10px 0; border-radius: 5px;" onerror="this.style.display='none'">
                    <p>${targetLocation.description || 'Information about ' + targetLocation.name + ' will be displayed here.'}</p>
                `;
                map.setView(targetLocation.coords, 15);
            }, 500);
        }
    }
});