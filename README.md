# HKPlace - Hong Kong Location Guessing Game

An interactive web application that tests your knowledge of Hong Kong's iconic locations through a fun guessing game.

## Features

### Game Mode
- **Level 1**: Guess locations across Hong Kong (5 rounds)
- **Level 2**: Precision guessing within specific districts (unlocked at 60% accuracy)
- Real-time distance calculation and scoring
- Interactive map with custom markers

### Study Mode
- Explore all Hong Kong locations on an interactive map
- View location images and detailed descriptions
- Click markers to learn about each place

### Home Page
- Browse gallery of all locations
- Click images to jump directly to study mode
- Prominent game start button

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6)
- **Mapping**: Leaflet.js with CartoDB tiles
- **Data**: CSV files for location coordinates and descriptions
- **Styling**: Custom CSS (no frameworks)

## File Structure

```
HKPlace/
├── index.html          # Game page
├── study.html          # Study mode
├── home.html           # Landing page
├── script.js           # Game logic
├── study.js            # Study mode logic
├── styles.css          # Global styles
├── data/
│   ├── level1_locations.csv
│   └── level2_locations.csv
└── img/                # Location images
```

## Getting Started

1. Clone the repository
2. Open `home.html` in a web browser
3. Start exploring Hong Kong locations!

## Game Rules

- **Level 1**: Success = within 0.8km of actual location
- **Level 2**: Success = within 0.3km of actual location
- Score 60%+ in Level 1 to unlock Level 2
- Each game consists of 5 randomly selected locations

image source: www.discoverhongkong.com
