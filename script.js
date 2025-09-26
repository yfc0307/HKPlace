// Initialize map centered on Hong Kong
var map = L.map('map').setView([22.3193, 114.1694], 12);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Function to update selection text
function displaySelection(text) {
    document.getElementById('selection').textContent = text;
}

// Add marker for Tsim Sha Tsui
var tsimShaTsuiMarker = L.marker([22.2783, 114.1747]).addTo(map);
tsimShaTsuiMarker.bindPopup("<b>Tsim Sha Tsui</b><br>Click to select!");

// Listen for marker click
tsimShaTsuiMarker.on('click', function() {
    displaySelection("You selected Tsim Sha Tsui!");
});

// Clicking elsewhere clears selection
map.on('click', function(e) {
    displaySelection("");
});