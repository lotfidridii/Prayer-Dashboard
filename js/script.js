let prayerTimes = {};
let nextPrayerName = '';
let nextPrayerTime = '';
let adhanPlayed = false;
let userLocation = null;

// Default location (Tunis, Tunisia)
const defaultLocation = { lat: 36.8065, lon: 10.1815, name: 'Tunis' };

function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('clock').textContent = `${h}:${m}:${s}`;

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const gregDate = now.toLocaleDateString('en-GB', options);
  document.getElementById('date').textContent = gregDate;
}

function updateHijri() {
  const today = new Date();
  const hijriDate = new Intl.DateTimeFormat('ar-TN-u-ca-islamic', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long'
  }).format(today);
  document.getElementById('hijri').textContent = hijriDate;
}

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

// Handle fullscreen changes to hide/show location button
function handleFullscreenChange() {
  const locationButton = document.getElementById('location-settings');
  if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) {
    // In fullscreen - hide location button
    locationButton.style.display = 'none';
  } else {
    // Not in fullscreen - show location button
    locationButton.style.display = 'block';
  }
}

// Add fullscreen event listeners
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);

async function loadWeather(lat, lon) {
  const weatherElement = document.getElementById('weather');
  setLoadingState('weather', true, '🌍 Loading weather...');
  
  const apiKey = 'b30b9782fa421ed4bf7791ffc3afb9ac'; // replace with your real key
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=en`;

  try {
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`Weather API error: ${res.status}`);
    }
    
    const data = await res.json();

    const temp = Math.round(data.main.temp);
    const desc = data.weather[0].description;
    const icon = data.weather[0].icon;
    const cityName = data.name || userLocation?.name || 'Your Location';

    weatherElement.innerHTML = `
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="icon">
      ${cityName}: ${temp}°C, ${desc}
    `;
    setLoadingState('weather', false);
    
  } catch (err) {
    console.error('Weather error:', err);
    weatherElement.innerHTML = '⚠️ <span class="error">Weather unavailable</span>';
    setLoadingState('weather', false);
  }
}

async function loadPrayerTimes(lat, lon) {
  const prayersElement = document.getElementById('prayers');
  const countdownElement = document.getElementById('countdown');
  
  setLoadingState('prayers', true, '🕋 Loading prayer times...');
  setLoadingState('countdown', true, 'Loading next prayer...');

  // Use Islamic Society of North America method for more accurate times
  const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2&tune=0,0,0,0,0,0,0,0,0`;

  try {
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`Prayer API error: ${res.status}`);
    }
    
    const data = await res.json();
    
    if (!data.data || !data.data.timings) {
      throw new Error('Invalid prayer data received');
    }
    
    const t = data.data.timings;

    prayerTimes = {
      Fajr: t.Fajr,
      Dhuhr: t.Dhuhr,
      Asr: t.Asr,
      Maghrib: t.Maghrib,
      Isha: t.Isha,
    };

    findNextPrayer();
    displayPrayerTimes();
    setLoadingState('prayers', false);
    setLoadingState('countdown', false);
    
    console.log('Prayer times loaded successfully:', prayerTimes);
  } catch (err) {
    console.error('Prayer times error:', err);
    prayersElement.innerHTML = '⚠️ <span class="error">Error loading prayer times</span>';
    countdownElement.innerHTML = '<span class="error">Prayer countdown unavailable</span>';
    setLoadingState('prayers', false);
    setLoadingState('countdown', false);
  }
}

function displayPrayerTimes() {
  const prayerNames = {
    Fajr: { en: "Fajr", ar: "الفجر" },
    Dhuhr: { en: "Dhuhr", ar: "الظهر" },
    Asr: { en: "Asr", ar: "العصر" },
    Maghrib: { en: "Maghrib", ar: "المغرب" },
    Isha: { en: "Isha", ar: "العشاء" }
  };

  const html = Object.entries(prayerTimes).map(([name, time]) => {
    const isNext = name === nextPrayerName;
    const style = isNext ? 'font-weight: bold; color: #00d4aa;' : '';
    const prayerName = prayerNames[name];
    
    return `
      <div class="prayer-line" style="${style}">
        <div class="prayer-name-en">${prayerName.en}</div>
        <div class="prayer-name-ar">${prayerName.ar}</div>
        <div class="prayer-time">${time}</div>
      </div>
    `;
  }).join('');

  document.getElementById('prayers').innerHTML = html;
}

function findNextPrayer() {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  let minDiff = Infinity;
  let foundNext = false;

  // First, check today's prayers
  Object.entries(prayerTimes).forEach(([name, time]) => {
    const prayerDate = new Date(`${todayStr}T${time}:00`);
    const diff = prayerDate - now;

    if (diff > 0 && diff < minDiff) {
      minDiff = diff;
      nextPrayerName = name;
      nextPrayerTime = prayerDate;
      foundNext = true;
      adhanPlayed = false;
    }
  });

  // If no prayer found today, get tomorrow's Fajr
  if (!foundNext) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    nextPrayerName = 'Fajr';
    nextPrayerTime = new Date(`${tomorrowStr}T${prayerTimes.Fajr}:00`);
    adhanPlayed = false;
  }
}

function updateCountdown() {
  if (!nextPrayerTime) return;

  const now = new Date();
  const diff = nextPrayerTime - now;
  const countdownElement = document.getElementById('countdown');

  if (diff <= 0) {
    if (!adhanPlayed) {
      playAdhan();
      adhanPlayed = true;
    }
    countdownElement.innerHTML = `🕌 <span class="success">Time for ${nextPrayerName}</span>`;
    
    // Find next prayer after a short delay
    setTimeout(() => {
      findNextPrayer();
      displayPrayerTimes();
    }, 5000);
    return;
  }

  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  
  let timeStr = '';
  let urgencyClass = '';
  
  if (hours > 0) {
    timeStr = `${hours}h ${mins}m ${secs}s`;
  } else {
    timeStr = `${mins}m ${secs}s`;
    // Add urgency styling for last 5 minutes
    if (mins < 5) {
      urgencyClass = 'urgent-countdown';
    }
  }
  
  countdownElement.className = urgencyClass;
  countdownElement.textContent = `⏳ ${nextPrayerName} in ${timeStr}`;
}

function playAdhan() {
  const audio = new Audio('assets/adhan.mp3');
  audio.play().catch(() => {
    console.log("Autoplay blocked. Adhan won't play until user interacts.");
  });
}

function manualLocationSetup() {
  const city = prompt("Enter your city name (e.g., Tunis, London, Cairo):");
  if (city) {
    searchLocationAndLoad(city);
  }
}

async function searchLocationAndLoad(cityName) {
  const weatherElement = document.getElementById('weather');
  const prayersElement = document.getElementById('prayers');
  
  weatherElement.innerHTML = '🌍 <span class="loading">Searching location...</span>';
  prayersElement.innerHTML = '🕋 <span class="loading">Loading prayer times...</span>';

  try {
    // Using OpenWeatherMap geocoding API
    const apiKey = 'b30b9782fa421ed4bf7791ffc3afb9ac';
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${apiKey}`;
    
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();
    
    if (geoData.length === 0) {
      throw new Error('City not found');
    }
    
    const location = geoData[0];
    userLocation = {
      lat: location.lat,
      lon: location.lon,
      name: `${location.name}${location.country ? ', ' + location.country : ''}`
    };
    
    await loadWeather(userLocation.lat, userLocation.lon);
    await loadPrayerTimes(userLocation.lat, userLocation.lon);
    
  } catch (err) {
    console.error('Location search error:', err);
    weatherElement.innerHTML = '⚠️ <span class="error">Location not found</span>';
    prayersElement.innerHTML = '⚠️ <span class="error">Unable to load prayer times</span>';
  }
}

function detectLocationAndLoadAll() {
  if (!navigator.geolocation) {
    console.log('Geolocation not supported, using default location');
    loadDefaultLocation();
    return;
  }

  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000 // 5 minutes
  };

  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      console.log('Geolocation successful:', latitude, longitude);
      
      userLocation = { lat: latitude, lon: longitude };
      loadWeather(latitude, longitude);
      loadPrayerTimes(latitude, longitude);
    },
    error => {
      console.log('Geolocation error:', error.message);
      loadDefaultLocation();
    },
    options
  );
}

function loadDefaultLocation() {
  console.log('Loading default location (Tunis)');
  userLocation = defaultLocation;
  loadWeather(defaultLocation.lat, defaultLocation.lon);
  loadPrayerTimes(defaultLocation.lat, defaultLocation.lon);
}

// Simple loading state function
function setLoadingState(elementId, isLoading, loadingText = 'Loading...') {
  const element = document.getElementById(elementId);
  if (isLoading) {
    element.classList.add('loading');
    element.innerHTML = `<span class="loading">${loadingText}</span>`;
  } else {
    element.classList.remove('loading');
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  updateClock();
  updateHijri();
  detectLocationAndLoadAll();

  // Update every second
  setInterval(() => {
    updateClock();
    updateCountdown();
  }, 1000);

  // Update prayer times every hour
  setInterval(() => {
    if (userLocation) {
      loadPrayerTimes(userLocation.lat, userLocation.lon);
    }
  }, 3600000);
});
