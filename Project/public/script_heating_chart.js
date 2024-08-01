document.addEventListener("DOMContentLoaded", () => {
    const ctx = document.getElementById("temperatureChart").getContext("2d");
    const showDataButton = document.getElementById("Predict_button_heating");
    const clearButton_heating = document.getElementById('Clear_button_heating');
    const historicButton = document.getElementById('Historic_button_heating');
    let chart;
    // Function to generate time slots
    function generateTimeSlots(startTime, endTime, interval) {
        const timeSlots = [];
        let currentTime = new Date(startTime);

        while (currentTime <= endTime) {
            const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            timeSlots.push(formattedTime);
            currentTime.setMinutes(currentTime.getMinutes() + interval);
        }

        return timeSlots;
    }

    // Generate time slots from 8:59 AM to 11:59 PM with a 15-minute interval
    const startTime = new Date(0, 0, 0, 8, 59);
    const endTime = new Date(0, 0, 0, 23, 59);
    const interval = 15;
    const timeSlots = generateTimeSlots(startTime, endTime, interval);

    // Function to fetch temperature data from your API/endpoint
    async function fetchTemperatureData() {
        try {
            const response = await fetch("/api/get_environmental_prediction_heating"); 
            const data = await response.json();
            return data.heating_values.environment_readings;
        } catch (error) {
            console.error("Error fetching temperature data:", error);
            return [];
        }
    }

    // Function to create the temperature chart and table
    async function createTemperatureChart() {
        const temperatureData = await fetchTemperatureData();

        if (temperatureData.length === 0) {
            console.log("No temperature data to display.");
            return;
        }

        // Extract temperatures from the data
        const temperatures = temperatureData.map(reading => reading.temperature);

        chart = new Chart(ctx, {
            type: 'line', // Change the chart type to 'line'
            data: {
                labels: timeSlots, // Use custom time labels
                datasets: [{
                    label: "Temperature",
                    data: temperatures, // Extract 'People' values
                    borderColor: 'blue', // Line color
                    borderWidth: 2, // Line width
                    pointBackgroundColor: 'blue', // Point color
                    fill: false, // Disable filling the area under the line
                }]
            },
            options: {
                scales: {
                    x: [{
                        ticks: {
                            callback: function (value, index, values) {
                                return timeSlots[index]; // Display custom time labels
                            }
                        }
                    }],
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

    }

    showDataButton.addEventListener("click", () => {
        createTemperatureChart();
    });

    let flag=0;
    function update_chart(heating_data_historic) {
        const past_temp=heating_data_historic.temperatureValues;
        console.log(past_temp)
        chart.data.datasets.push({
            label:"2022",
            data: past_temp,
            borderColor: "red", // Customize the color
            borderWidth: 2,
            pointBackgroundColor: "red", // Customize the point color
            fill: false,
        });
        
        // Update the chart to reflect the changes
        chart.update();
    }
    async function clearChart() {
        if (chart) {
            chart.destroy();
        }
    }

    clearButton_heating.addEventListener('click', async() =>{
        await clearChart();
        flag=0;
    });

    
    historicButton.addEventListener('click', async () => {
        try {
            const heating_data_historic = await fetch_historic();
            if(flag==0){
                update_chart(heating_data_historic);
                flag=1;
            }
            
        } catch (error) {
            console.error(error);
            document.getElementById('dataFromDatabase').textContent = 'Error fetching data';
        }
    });


    async function fetch_historic() {
        try {
            const response_historic = await fetch('/api/past_temp_values'); // This assumes your server is running on the same domain
            if (!response_historic.ok) {
                throw new Error('Failed to fetch data');
            }
            const data_historic = await response_historic.json();
            return data_historic.past_temprature[0]; // Return the entire array
        } catch (error) {
            console.error(error);
            document.getElementById('historic_list').textContent = 'Error fetching data';
            throw error; // Re-throw the error to handle it further, if needed
        }
    }
});

