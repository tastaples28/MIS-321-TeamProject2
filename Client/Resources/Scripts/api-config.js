// Shared API Configuration for all scripts
// API Configuration - Use Heroku URL for production
window.API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:5001/api' 
    : 'https://reefrates-555b282e7634.herokuapp.com/api';

