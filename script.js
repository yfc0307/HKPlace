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

// Location data arrays (loaded from CSV)
var locations = [];
var level2Locations = [];

var currentLocation = null;
var guessMarker = null;
var actualMarker = null;
var hasGuessed = false;
var gameLocations = [];
var currentRound = 0;
var gameResults = [];
var gameLevel = 1;

// Load locations from separate CSV files
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
                    coords: [parseFloat(lat), parseFloat(lng)], 
                    district_coords: [parseFloat(district_lat), parseFloat(district_lng)] 
                });
            }
        });
    
    return Promise.all([loadLevel1, loadLevel2]);
}

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
    gameLocations = [...level2Locations].sort(() => Math.random() - 0.5).slice(0, 5);
    currentRound = 0;
    gameResults = [];
    
    nextRound();
}

// Next round
function nextRound() {
    // Clear markers
    if (guessMarker) map.removeLayer(guessMarker);
    if (actualMarker) map.removeLayer(actualMarker);
    
    var maxRounds = 5;
    if (currentRound >= maxRounds) {
        endGame();
        return;
    }
    
    currentLocation = gameLocations[currentRound];
    
    // Reset map view based on level
    if (gameLevel === 1) {
        map.setView([22.3640, 114.1150], 11);
    } else {
        map.setView(currentLocation.district_coords, 14);
    }
    
    // Update UI
    var maxRounds = 5;
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
    var maxRounds = 5;
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
        document.getElementById('refresh-btn').textContent = 'Next Level';
        document.getElementById('refresh-btn').onclick = startLevel2;
    } else {
        document.getElementById('location-details').innerHTML = resultsHtml;
        document.getElementById('refresh-btn').textContent = 'New Game';
        document.getElementById('refresh-btn').onclick = startNewGame;
    }
    
    document.getElementById('refresh-btn').disabled = false;
}

// Initialize game after loading locations
loadLocations().then(() => {
    startNewGame();
});

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
    
    var successThreshold = gameLevel === 1 ? 0.8 : 0.3;
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
