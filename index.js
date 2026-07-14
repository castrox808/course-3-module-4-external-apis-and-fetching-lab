 const weatherApi = "https://api.weather.gov/alerts/active?area=";

const stateInput = document.getElementById('state-input') || document.getElementById('city-input');
const fetchButton = document.getElementById('fetch-alerts');
const alertsDisplay = document.getElementById('alerts-display') || document.getElementById('weather-display');
const errorMessageDiv = document.getElementById('error-message');

if (fetchButton) {
    fetchButton.addEventListener('click', handleFormSubmit);
}

if (stateInput) {
    stateInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleFormSubmit();
        }
    });
}

function handleFormSubmit() {
    const inputVal = stateInput ? stateInput.value.trim() : '';
    clearError();

    if (!inputVal) {
        displayError('Input cannot be empty. Please enter a valid location.');
        return;
    }

    if (!/^[A-Za-z]{2}$/.test(inputVal)) {
        displayError('Please enter a valid 2-letter state abbreviation.');
        return;
    }

    fetchWeatherAlerts(inputVal);
}

function fetchWeatherAlerts(location) {
    showLoading(true);
    const targetLocation = location.toUpperCase();
    const url = `${weatherApi}${targetLocation}`;

    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            clearError(); 
            displayAlerts(data, targetLocation);
            if (stateInput) stateInput.value = '';
        })
        .catch(errorObject => {
            console.log(errorObject.message);
            displayError(errorObject.message);
        })
        .finally(() => {
            showLoading(false);
        });
}

function fetchWeatherData(city) {
    return fetchWeatherAlerts(city);
}

function displayAlerts(data, location) {
    if (!alertsDisplay) return;
    alertsDisplay.innerHTML = '';

    const features = data.features || [];
    const alertCount = features.length;

    const summaryHeader = document.createElement('h2');
    summaryHeader.textContent = `Weather Alerts: ${alertCount}`;
    alertsDisplay.appendChild(summaryHeader);

    if (alertCount === 0) {
        const noAlertsMsg = document.createElement('p');
        noAlertsMsg.textContent = 'No active alerts for this location.';
        alertsDisplay.appendChild(noAlertsMsg);
        return;
    }

    const listContainer = document.createElement('ul');

    features.forEach(feature => {
        const listItem = document.createElement('li');
        const headline = feature.properties?.headline || 'Alert details unavailable';
        listItem.textContent = headline;
        listContainer.appendChild(listItem);
    });

    alertsDisplay.appendChild(listContainer);
}

function displayWeather(data) {
    displayAlerts(data, 'Requested Location');
}

function displayError(message) {
    if (!errorMessageDiv) return;
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = 'block'; 
    errorMessageDiv.classList.remove('hidden');
    errorMessageDiv.classList.add('error-active');
    
    if (alertsDisplay) {
        alertsDisplay.innerHTML = '';
    }
}

function clearError() {
    if (!errorMessageDiv) return;
    errorMessageDiv.textContent = '';
    errorMessageDiv.style.display = 'none'; 
    errorMessageDiv.classList.add('hidden');
    errorMessageDiv.classList.remove('error-active');
}

function showLoading(isLoading) {
    const spinner = document.getElementById('loading-spinner');
    if (!spinner) return;
    spinner.style.display = isLoading ? 'block' : 'none';
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { fetchWeatherAlerts, fetchWeatherData, displayAlerts, displayWeather, displayError };
}
