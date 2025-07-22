# Prayer Dashboard

A modern, minimalist Islamic Prayer Dashboard with clean UI design, featuring real-time prayer times, weather information, Hijri calendar dates, and smooth animations optimized for screen display.

## 📁 Project Structure

```
clock/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All CSS styles
├── js/
│   └── script.js       # All JavaScript functionality
├── assets/
│   ├── adhan.mp3       # Prayer call audio
│   └── background.jpg  # Background image
│   └── favicon.ico  # favicon image
└── README.md
```

## 🚀 Features

- **Real-time Clock**: Digital clock with seconds display
- **Prayer Times**: Horizontal card layout with English & Arabic names
- **Next Prayer Animation**: Smooth zoom animation highlighting upcoming prayer
- **Countdown Timer**: Shows time remaining until next prayer
- **Weather Display**: Current weather with temperature and icons
- **Hijri Calendar**: Islamic calendar date display in Arabic
- **Location Services**: Auto-detection with manual city search override
- **Adhan Audio**: Automatic prayer call playback at prayer times
- **Fullscreen Mode**: Click anywhere to toggle fullscreen (hides UI elements)
- **Modern UI**: Dark theme with glass-morphism effects and teal accents
- **Compact Design**: Centered layout optimized for screen display
- **Custom Favicon**: Islamic-themed icon with mosque and clock design

## 🛠 Technical Details

### Dependencies
- No external frameworks required
- Uses vanilla HTML5, CSS3, and JavaScript
- External APIs:
  - OpenWeatherMap (weather data)
  - Aladhan API (prayer times)

### Browser Support
- Modern browsers with ES6+ support
- Geolocation API support recommended
- Audio autoplay may require user interaction

## 📱 Usage

1. Open `index.html` in a web browser
2. Allow location access when prompted (optional)
3. Click the location icon (📍) to manually set your city
4. Click anywhere to toggle fullscreen mode
5. Prayer times will update automatically

## 🔧 Configuration

### API Keys
Update the OpenWeatherMap API key in `js/script.js`:
```javascript
const apiKey = 'your-api-key-here';
```

### Default Location
Change the default location in `js/script.js`:
```javascript
const defaultLocation = { lat: 36.8065, lon: 10.1815, name: 'Tunis' };
```

### Prayer Time Display
Prayer times are displayed in horizontal cards with:
- English prayer names (Fajr, Dhuhr, Asr, Maghrib, Isha)
- Arabic prayer names (الفجر، الظهر، العصر، المغرب، العشاء)
- Large, readable time format
- Next prayer highlighted with teal accent and zoom animation

## 🎨 Customization

### Styling
All visual styles are in `css/styles.css`. Key customizable elements:
- **Color Scheme**: Dark theme with teal accents (`#05eebf`)
- **Typography**: Inter and Poppins fonts with fixed sizes for consistency
- **Background**: Gradient overlay on background image for readability
- **Prayer Cards**: Glass-morphism effect with subtle borders
- **Animations**: Smooth zoom effect for next prayer (2s infinite loop)
- **Layout**: Centered flexbox design for compact screen display

### Functionality
Core functions in `js/script.js`:
- `updateClock()` - Clock display logic
- `loadPrayerTimes()` - Prayer time calculation
- `loadWeather()` - Weather data fetching
- `playAdhan()` - Audio playback

## 📋 File Descriptions

- **`index.html`**: Clean HTML structure with external resource links and favicon
- **`css/styles.css`**: Complete styling with modern dark theme and animations
- **`js/script.js`**: All application logic, API interactions, and fullscreen handling
- **`assets/adhan.mp3`**: Audio file for prayer call playback
- **`assets/background.jpg`**: Background image with gradient overlay
- **`assets/favicon.svg`**: Custom Islamic-themed favicon with mosque design
