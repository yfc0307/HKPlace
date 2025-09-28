// Initialize map centered on Hong Kong
var map = L.map('map', { dragging: false,
    boxZoom: false, 
    doubleClickZoom: false,
    scrollWheelZoom: false,
    zoomControl: false }).setView([22.3640, 114.1150], 11);

// Add OpenStreetMap tiles without place names
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.carto.com/">CARTO</a>'
}).addTo(map);

// Function to update selection text
function displaySelection(text) {
    document.getElementById('selection').textContent = text;
}

// All locations
var locations = [
    { name: "Tsim Sha Tsui", coords: [22.2983, 114.1747] },
    { name: "Stanley", coords: [22.2191, 114.2090] },
    { name: "Causeway Bay", coords: [22.2801, 114.1884] },
    { name: "Sai Kung", coords: [22.3830, 114.2722] }
];

var currentLocation = null;
var guessMarker = null;
var actualMarker = null;

// Start new game
function startNewGame() {
    // Clear markers
    if (guessMarker) map.removeLayer(guessMarker);
    if (actualMarker) map.removeLayer(actualMarker);
    
    // Pick random location (avoid same as current)
    var newLocation;
    do {
        newLocation = locations[Math.floor(Math.random() * locations.length)];
    } while (currentLocation && newLocation.name === currentLocation.name);
    currentLocation = newLocation;
    
    // Reset map view
    map.setView([22.3640, 114.1150], 11);
    
    // Update UI
    document.getElementById('location-details').innerHTML = `Click on the map where you think <b>${currentLocation.name}</b> is located.`;
    document.getElementById('selection').textContent = '';
    document.getElementById('clicked-coordinates').textContent = '';
    
    // Disable New Game button
    document.getElementById('refresh-btn').disabled = true;
}

// Initialize game
startNewGame();

// Game logic - handle map clicks
map.on('click', function(e) {
    var clickedLocation = [e.latlng.lat, e.latlng.lng];
    
    // Remove previous guess marker
    if (guessMarker) {
        map.removeLayer(guessMarker);
    }
    
    // Add guess marker
    guessMarker = L.marker(clickedLocation, {color: 'red'}).addTo(map);
    guessMarker.bindPopup("Your guess");
    
    // Calculate distance
    var distance = map.distance(clickedLocation, currentLocation.coords);
    
    // Show actual location
    if (actualMarker) {
        map.removeLayer(actualMarker);
    }
    actualMarker = L.marker(currentLocation.coords, {color: 'green'}).addTo(map);
    actualMarker.bindPopup(`<b>${currentLocation.name}</b><br>Actual location`);
    
    // Update panel and selection
    var distanceKm = (distance / 1000).toFixed(2);
    document.getElementById('location-details').innerHTML = `Distance: ${distanceKm} km from ${currentLocation.name}`;
    displaySelection(`You guessed ${distanceKm} km away from ${currentLocation.name}!`);
    
    // Display clicked coordinates
    var coords = `Clicked: Lat ${e.latlng.lat.toFixed(5)}, Lng ${e.latlng.lng.toFixed(5)}`;
    document.getElementById('clicked-coordinates').textContent = coords;
    
    // Enable New Game button
    document.getElementById('refresh-btn').disabled = false;
    
    // Smooth zoom animation to show both points
    var bounds = L.latLngBounds([clickedLocation, currentLocation.coords]);
    map.fitBounds(bounds, {padding: [50, 50], animate: true, duration: 1.5, maxZoom: 14});
});
