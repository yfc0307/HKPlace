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
    { name: "Tsim Sha Tsui", coords: [22.2960, 114.1719] },
    { name: "Stanley", coords: [22.2191, 114.2118] },
    { name: "Causeway Bay", coords: [22.2801, 114.1884] },
    { name: "Sai Kung", coords: [22.3830, 114.2722] },
    { name: "Tuen Mun", coords: [22.3900, 113.9721] },
    { name: "Hong Kong Disneyland", coords: [22.3125, 114.0419] }
];

var currentLocation = null;
var guessMarker = null;
var actualMarker = null;
var hasGuessed = false;
var gameLocations = [];
var currentRound = 0;
var gameResults = [];
var gameLevel = 1;

// Level 2 locations
var level2Locations = [
    { name: "Time Square", district_coords: [22.2801, 114.1884], coords: [22.2794, 114.1822] },
    { name: "Kai Tak Stadium", district_coords: [22.3281, 114.2021], coords: [22.3223, 114.1973] },
    { name: "Hong Kong Observation Wheel", district_coords: [22.2819, 114.1582], coords: [22.2853, 114.1617] },
    { name: "Happy Valley Racecourse", district_coords: [22.2683, 114.1865], coords: [22.2728, 114.1820] }
];

// Start new game
function startNewGame() {
    gameLevel = 1;
    // Initialize game with 5 rounds (no duplicates)
    gameLocations = [...locations].sort(() => Math.random() - 0.5).slice(0, 5);
    currentRound = 0;
    gameResults = [];
    
    nextRound();
}

// Start level 2
function startLevel2() {
    gameLevel = 2;
    gameLocations = [...level2Locations];
    currentRound = 0;
    gameResults = [];
    
    nextRound();
}

// Next round
function nextRound() {
    // Clear markers
    if (guessMarker) map.removeLayer(guessMarker);
    if (actualMarker) map.removeLayer(actualMarker);
    
    var maxRounds = gameLevel === 1 ? 5 : level2Locations.length;
    if (currentRound >= maxRounds) {
        endGame();
        return;
    }
    
    currentLocation = gameLocations[currentRound];
    
    // Reset map view based on level
    if (gameLevel === 1) {
        map.setView([22.3640, 114.1150], 11);
    } else {
        map.setView(currentLocation.district_coords, 15);
    }
    
    // Update UI
    var maxRounds = gameLevel === 1 ? 5 : level2Locations.length;
    var levelText = gameLevel === 1 ? 'Level 1' : 'Level 2';
    document.getElementById('location-details').innerHTML = `${levelText} - Round ${currentRound + 1}/${maxRounds}: Click on the map where you think <b>${currentLocation.name}</b> is located.`;
    displaySelection('');
    document.getElementById('clicked-coordinates').textContent = '';
    
    // Update button
    var btn = document.getElementById('refresh-btn');
    btn.textContent = 'Next';
    btn.disabled = true;
    
    hasGuessed = false;
}

// End game
function endGame() {
    var maxRounds = gameLevel === 1 ? 5 : level2Locations.length;
    var levelText = gameLevel === 1 ? 'Level 1' : 'Level 2';
    var resultsHtml = `<h6>${levelText} Results:</h6>`;
    gameResults.forEach((result, i) => {
        var status = result.success ? '✓' : '✗';
        resultsHtml += `<div>${i+1}. ${result.location}: ${result.distance}km ${status}</div>`;
    });
    var successCount = gameResults.filter(r => r.success).length;
    var percentage = Math.round((successCount / maxRounds) * 100);
    resultsHtml += `<div class="mt-2"><strong>Score: ${successCount}/${maxRounds} (${percentage}%)</strong></div>`;
    
    if (gameLevel === 1 && percentage >= 60) {
        resultsHtml += '<div class="mt-2">🎉 Level 2 Unlocked!</div>';
        document.getElementById('location-details').innerHTML = resultsHtml;
        document.getElementById('refresh-btn').textContent = 'Level 2';
        document.getElementById('refresh-btn').onclick = startLevel2;
    } else {
        document.getElementById('location-details').innerHTML = resultsHtml;
        document.getElementById('refresh-btn').textContent = 'New Game';
        document.getElementById('refresh-btn').onclick = startNewGame;
    }
    
    document.getElementById('refresh-btn').disabled = false;
}

// Initialize game
startNewGame();

// Game logic - handle map clicks
map.on('click', function(e) {
    if (hasGuessed) return;
    
    var clickedLocation = [e.latlng.lat, e.latlng.lng];
    hasGuessed = true;
    
    // Remove previous guess marker
    if (guessMarker) {
        map.removeLayer(guessMarker);
    }
    
    // Add guess marker (red)
    var redIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background-color: red; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
    guessMarker = L.marker(clickedLocation, {icon: redIcon}).addTo(map);
    guessMarker.bindPopup("Your guess");
    
    // Calculate distance
    var distance = map.distance(clickedLocation, currentLocation.coords);
    
    // Show actual location (green)
    if (actualMarker) {
        map.removeLayer(actualMarker);
    }
    var greenIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background-color: green; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
    actualMarker = L.marker(currentLocation.coords, {icon: greenIcon}).addTo(map);
    actualMarker.bindPopup(`<b>${currentLocation.name}</b><br>Actual location`);
    
    // Update panel and selection
    var distanceKm = (distance / 1000).toFixed(2);
    
    var successThreshold = gameLevel === 1 ? 0.6 : 0.2;
    if (distanceKm < successThreshold) {
        document.getElementById('location-details').innerHTML = 'You guessed it right!';
    } else {
        document.getElementById('location-details').innerHTML = `Distance: ${distanceKm} km from ${currentLocation.name}`;
    }

    displaySelection(`You guessed ${distanceKm} km away from ${currentLocation.name}!`);
    
    // Display clicked coordinates
    var coords = `Clicked: Lat ${e.latlng.lat.toFixed(5)}, Lng ${e.latlng.lng.toFixed(5)}`;
    document.getElementById('clicked-coordinates').textContent = coords;
    
    // Record result
    var successThreshold = gameLevel === 1 ? 0.6 : 0.2;
    var success = distanceKm < successThreshold;
    gameResults.push({
        location: currentLocation.name,
        distance: distanceKm,
        success: success
    });
    
    currentRound++;
    
    // Enable Next button
    document.getElementById('refresh-btn').disabled = false;
    document.getElementById('refresh-btn').onclick = nextRound;
    
    // Smooth zoom animation to show both points
    var bounds = L.latLngBounds([clickedLocation, currentLocation.coords]);
    map.fitBounds(bounds, {padding: [50, 50], animate: true, duration: 1.5, maxZoom: 14});
});
