async function getpredicted_heating() {
    try {
        const response = await fetch('/api/predicted_temp_today'); // This assumes your server is running on the same domain
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        const averageTemperature = data.averageTemperature;
        return averageTemperature;
    } catch (error) {
    console.error(error);
    document.getElementById("averageTemperature").textContent = 'Error fetching data';
    throw error; // Re-throw the error to handle it further, if needed
    }
}
async function getpredicted_humidity() {
    try {
        const response = await fetch('/api/predicted_humidity_today'); // This assumes your server is running on the same domain
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        const averageHumidity = data.averageHumidity;
        return averageHumidity;
    } catch (error) {
    console.error(error);
    document.getElementById("averageHumidity").textContent = 'Error fetching data';
    throw error; // Re-throw the error to handle it further, if needed
    }
}

async function fetch_live_Values() {
    try{
        const response = await fetch('/api/live_sensors');
        const data = await response.json();
            // Assuming your JSON response structure matches the example
        const realTemp = data.live_env_data.real_temp;
        const realhumidity=data.live_env_data.real_humidity;
            // Update your UI or perform any necessary actions with the data
        return {realTemp,realhumidity};
    }catch (error) {
        console.error(error);
        document.getElementById("averageTemperature").textContent = 'Error fetching data';
        throw error; // Re-throw the error to handle it further, if needed
    }
}
  
async function environmental_system(){
    const averageTemperature=await getpredicted_heating();
    const averageHumidity= await getpredicted_humidity();
    const  {realTemp,realhumidity} = await fetch_live_Values();
    
    document.getElementById('Live_temp').textContent = realTemp+"°C";
    document.getElementById('Live_humidity').textContent=realhumidity+"%";
    if (averageTemperature > 20) {
        if(realTemp<20){
            document.getElementById("averageTemperature").textContent = "Overriding System....Heating System has been tunred on because the live temperature dropped below 20°C";
        }
        else{
            document.getElementById("averageTemperature").textContent = "Heating System has been tunred off because the average predicted temperature for the next hour is projected to be "+averageTemperature.toString();
        }
        
    } 
    else if (averageTemperature < 20) {
        if(realTemp>20){
            document.getElementById("averageTemperature").textContent = "Overriding System....Heating System has been tunred off because the live temperature exceeded 20°C";
        }
        else{
            document.getElementById("averageTemperature").textContent = "Heating System has been turned on because the average predicted temperature for the next hour is projected to be "+averageTemperature.toString();

        }
    }
    else {
        document.getElementById("averageTemperature").textContent = "No heating system";
        console.log("no heating system")
    }

    if (averageHumidity > 65) {
        if(realhumidity<40){
            document.getElementById("averageHumidity").textContent = "Overriding System....Dehumidifier System has been tunred off because the live humidity dropped below 40%";
        }
        else{
            document.getElementById("averageHumidity").textContent = "Dehumidifier System has been tunred on because the average predicted humidity for the next hour is projected to be "+averageHumidity.toString();
        }
        
    } 
    else if (averageHumidity < 65) {
        if(realhumidity>65){
            document.getElementById("averageHumidity").textContent = "Overriding System....Dehumidifier System has been tunred on because the live humidity is above 40%";
        }
        else{
            document.getElementById("averageHumidity").textContent = "Dehumidifier System has been tunred on because the average predicted humidity for the next hour is projected to be "+averageHumidity.toString();

        }
    }
    else {
        document.getElementById("averageHumidity").textContent = "No humidity system";
    }
    setTimeout(getpredicted_heating,50000)
    setTimeout(getpredicted_humidity,50000)
    setTimeout(fetch_live_Values,1000)
}

environmental_system();
setInterval(environmental_system,1000);

