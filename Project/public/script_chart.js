// Custom labels for the x-axis (time values)
const timeLabels = [
    '8:59', '9:59', '10:59', '11:59', '12:59', '13:59',
    '14:59', '15:59', '16:59', '17:59', '18:59', '19:59', '20:59', '21:59'
];
let chart;
// Function to create the chart
function createChart(peopleData) {
    const people=peopleData.map(item => item.People)
    const maxPeople = Math.max(...people);
    const index_max = people.indexOf(maxPeople);

    const ctx = document.getElementById('peopleChart').getContext('2d');

    chart = new Chart(ctx, {
        type: 'line', // Change the chart type to 'line'
        data: {
            labels: timeLabels, // Use custom time labels
            datasets: [{
                label: 'Number of People (Total: ' + people.reduce((acc, val) => acc + val, 0) + '),(Max:'+ maxPeople +',at time:'+ timeLabels[index_max] +')',
                data: people, // Extract 'People' values
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
                            return timeLabels[index]; // Display custom time labels
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
let flag=0;
function update_chart(peopleData_historic) {
    colors=['red','green','orange','black','purple'];
    for(let i=0;i<5;i++){
        const people=peopleData_historic[i].people_count_list;
        let year=2018+i
        chart.data.datasets.push({
            label: year.toString(),
            data: people,
            borderColor: colors[i], // Customize the color
            borderWidth: 2,
            pointBackgroundColor: colors[i], // Customize the point color
            fill: false,
        });
    }
    // Update the chart to reflect the changes
    chart.update();

}

function clearChart() {
    if (chart) {
        chart.destroy();
    }
}

const predictButton = document.getElementById('Predict_button');
predictButton.addEventListener('click', async () => {
    try {
        const peopleData = await fetch_predictions();
        createChart(peopleData);
    } catch (error) {
        console.error(error);
        document.getElementById('dataFromDatabase').textContent = 'Error fetching data';
    }
});


const historicButton = document.getElementById('Historic_button');
historicButton.addEventListener('click', async () => {
    try {
        const peopleData_historic = await fetch_historic();
        if(flag==0){update_chart(peopleData_historic);}
        flag=1;
    } catch (error) {
        console.error(error);
        document.getElementById('dataFromDatabase').textContent = 'Error fetching data';
    }
});

const clearButton = document.getElementById('Clear_button');
clearButton.addEventListener('click', async () =>{
    clearChart();
    flag=0;
});

async function fetch_predictions() {
    try {
        const response = await fetch('/api/get_prediction'); // This assumes your server is running on the same domain
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        return data.dataFromDatabase; // Return the entire array
    } catch (error) {
        console.error(error);
        document.getElementById('dataFromDatabase').textContent = 'Error fetching data';
        throw error; // Re-throw the error to handle it further, if needed
    }
}

async function fetch_historic() {
    try {
        const response_historic = await fetch('/api/get_historic'); // This assumes your server is running on the same domain
        if (!response_historic.ok) {
            throw new Error('Failed to fetch data');
        }
        const data_historic = await response_historic.json();
        return data_historic.historic_list; // Return the entire array
    } catch (error) {
        console.error(error);
        document.getElementById('historic_list').textContent = 'Error fetching data';
        throw error; // Re-throw the error to handle it further, if needed
    }
}
