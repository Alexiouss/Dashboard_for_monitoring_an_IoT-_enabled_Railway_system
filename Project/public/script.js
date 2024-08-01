// Function to fetch live people count data from the server
async function fetchLivePeopleCount() {
    try {
        const response = await fetch('/api/live'); // This assumes your server is running on the same domain
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        const totalSensedPeople = document.getElementById('totalSensedPeople');
        totalSensedPeople.textContent = data.totalSensedPeople;
        totalSensedPeople.classList.remove('loading'); // Remove the loading class

        // document.getElementById('totalSensedPeople').textContent = data.totalSensedPeople;
    } catch (error) {
        console.error(error);
        document.getElementById('totalSensedPeople').textContent = 'Error fetching data';
    }
}

// Function to refresh data when the button is clicked

// Attach the click event handler to the button
document.getElementById('refreshButton').addEventListener('click', fetchLivePeopleCount);

// Fetch the data initially and set up periodic updates
fetchLivePeopleCount()
setInterval(fetchLivePeopleCount, 5000); // Fetch data every 5 seconds
