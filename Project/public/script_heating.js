async function fetchLiveHeatingStatus() {
    try {
        const response = await fetch('/api/live_temp'); // This assumes your server is running on the same domain
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        document.getElementById('heating_on').textContent = data.heating_values.first_heating_value;
        console.log(data.heating_values.first_heating_value);
    } catch (error) {
        console.error(error);
        document.getElementById('heating_on').textContent = 'Error fetching data' + error.message;
    }
}

// Function to refresh data when the button is clicked
function refreshData() {
    fetchLiveHeatingStatus();
}


// Attach the click event handler to the button
document.getElementById('refreshButton_heating').addEventListener('click', refreshData);

// Fetch the data initially and set up periodic updates
fetchLiveHeatingStatus()
setInterval(fetchLiveHeatingStatus, 1000); // Fetch data every 5 seconds