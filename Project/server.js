const express = require('express');
const cors = require('cors');
const {exec} = require('child_process');

// Replace 'your-python-script.py' with the path to your Python script
const pythonScriptPath_live = 'your_path\\simulation.py';
const pythonScriptPath_prediction = 'your_path\\predict_people.py'
const pythonScriptPath_wheel='your_path\\wheelchair_detection.py'
const pythonScriptPath_transformation='your_path\\date_transformation.py'
const pythonScriptPath_environment_sensors='your_path\\environment_sensors.py'
const pythonScriptPath_prediction_environmental='your_path\\prediction_target_humidity_temp.py'

const app = express();
const port = 8080;
const { ConnectToDB,client } = require('./db');


app.use(express.json());
app.use(express.static("public"));

function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0'); // Ensure two digits
    const minutes = now.getMinutes().toString().padStart(2, '0'); // Ensure two digits
    return `${hours}:${minutes}`;
}

// Example usage:
const currentTime = getCurrentTime();

let totalSensedPeople = 0;
async function queryAndAccumulate(collection) {
    try {
        const result =await collection.aggregate([
        {
            $group: {
            _id: null,
            totalPeople: { $sum: "$sensed_people" }
            }
        }
        ]).toArray();
        
        //startTime = endTime;

        if (result.length > 0) {
            totalSensedPeople = result[0].totalPeople;
        } 
        }catch(error){
            console.error(error)
        }
}
let dataFromDatabase=[];

async function get_prediction(collection) {
    try {
        // Create a new Date object for today
        const today = new Date();

        // Calculate the next date by adding 1 day
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + 1);

        // Format the next date as "YYYY-MM-DD"
        const formattedNextDate = nextDate.toISOString().split('T')[0];
        const query = { _id: formattedNextDate };
        const result = await collection.findOne(query);
        if (result) {
                // Assuming your data is stored in a field called "data"
            dataFromDatabase = result.prediction;
        }
        }catch(error){
            console.error(error);
        }
}
let historic_list=[]
async function get_historic(collection){
    try {
        // Create a new Date object for today
        const today = new Date();

        // Calculate the next date by adding 1 day
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + 1);

        // Format the next date as "YYYY-MM-DD"
        const formattedNextDate = nextDate.toISOString().split('T')[0];
        const previousYears = [];

        for (let i = 2018; i <= 2022; i++) {
            const yearDate = new Date(formattedNextDate);
            yearDate.setFullYear(i);
            const formattedpreviousDate=yearDate.toISOString().split('T')[0];
            const target_date=formattedpreviousDate
            const stringed_year=i.toString()
            const pipeline = [
                {
                  $match: {
                    _id: stringed_year, // Assuming the document with _id "2018" contains the data
                    [target_date]: { $exists: true }, // Replace with the actual date field in your document
                  },
                },
                {
                  $project: {
                    timeslots: `$${target_date}.timeslots`, // Replace with the actual date field in your document
                  },
                },
                {
                  $unwind: '$timeslots',
                },
                {
                  $match: {
                    'timeslots.time': {
                      $gte: '08:59',
                      $lte: '21:59',
                    },
                  },
                },
                {
                  $group: {
                    _id: null,
                    people_count_list: {
                      $push: '$timeslots.people_count',
                    },
                  },
                },
              ];
            const result=await collection.aggregate(pipeline).toArray();
            historic_list.push(result[0])
        }

    }catch(error){
        console.error(error)
    }
}

let check_wheelchair;
async function wheelchair_detection(collection){
    const result = await collection.find({}).sort({ _id: -1 }).toArray()
    check_wheelchair = result[0];
}

let detection_num=0;
async function detection_system(collection){
    const result = await collection.find({}).toArray();
    if (result) {
        // Assuming your data is stored in a field called "data"
        detection_num=result.length;
    }
    else{
        detection_num=0;
    }
    
}

let timeslots_end=[];
let new_fields=[];
async function transform_data(collection){
    for(let i = 8;i<=21;i++){
        const result=await collection.aggregate([
            {
                $match: {
                    $and: [
                        { hour: i }, // Match entries with hour equal to 15
                        { second: { $gte: 0, $lte: 59 } }, // Match entries with seconds between 0 and 59
                    ]
                }
            },
            {
                $group: {
                    _id: null,
                    transformed_totalPeople: {$sum: "$sensed_people" }
                }
            }
        ]).toArray();
        if(result.length>0){
            if(i<10){
                timeslots_end.push({time:"0"+i.toString()+":59",people_count:result[0].transformed_totalPeople});
            }
            else{
                timeslots_end.push({time:i.toString()+":59",people_count:result[0].transformed_totalPeople});
            }   
        }
        else{
            if(i<10){
                timeslots_end.push({time:"0"+i.toString()+":59",people_count:0});
            }
            else{
                timeslots_end.push({time:i.toString()+":59",people_count:0});
            }  
        }
    }
    new_fields.push(timeslots_end);
    var maxPeopleCount = -1; // Initialize to a value lower than the possible people counts
    var maxPeopleTime = "";
    var totalPeopleCount = 0;

    for (var i = 0; i < timeslots_end.length; i++) {
        var slot = timeslots_end[i];
        totalPeopleCount += slot.people_count;
        if (slot.people_count > maxPeopleCount) {
            maxPeopleCount = slot.people_count;
            maxPeopleTime = slot.time;
        }
    }
    new_fields.unshift({peak_hour:parseInt(maxPeopleTime.split(":")[0],10)})
    new_fields.push({Total_number_of_people:totalPeopleCount});
}

async function deleteDataFromLive(collection){
    await collection.deleteMany({});
}

let heating_values;
async function Heating_prediction_next(collection) {
    const this_day = new Date();

    // Calculate the next date by adding 1 day
    const targetDate = new Date(this_day);
    targetDate.setDate(this_day.getDate() + 1);

    // Format the next date as "YYYY-MM-DD"
    const formattedtargetDate = targetDate.toISOString().split('T')[0];
    // const projection = { "environment_readings.temperature": 1, _id:0 };
    try {
        const result = await collection.findOne({ _id: formattedtargetDate } ,{ projection: { "_id": 0, "environment_readings.temperature": 1 } });
        heating_values=result;

    } catch (error) {
    console.error(error);
    throw error; // Propagate the error for better error handling
    }
}

let humidity_values;
async function fetch_all_predicted_humidity_tommorrow(collection) {
    const this_day = new Date();

    // Calculate the next date by adding 1 day
    const targetDate = new Date(this_day);
    targetDate.setDate(this_day.getDate() + 1);

    // Format the next date as "YYYY-MM-DD"
    const formattedtargetDate = targetDate.toISOString().split('T')[0];
    // const projection = { "environment_readings.temperature": 1, _id:0 };
    try {
        const result = await collection.findOne({ _id: formattedtargetDate } ,{ projection: { "_id": 0, "environment_readings.humidity": 1 } });
        humidity_values=result;

    } catch (error) {
    console.error(error);
    throw error; // Propagate the error for better error handling
    }
}

let past_temprature;
async function fetchpasttempFromDB(collection) {

    const today = new Date();

    // Calculate the next date by adding 1 day
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + 1);

    // Format the next date as "YYYY-MM-DD"
    const formattedNextDate = nextDate.toISOString().split('T')[0];
    const yearDate = new Date(formattedNextDate);
    yearDate.setFullYear(2022);
    const formattedpreviousDate=yearDate.toISOString().split('T')[0];
    const target_date=formattedpreviousDate
    try {
        const pipeline = [
            {$match:{
                _id: "2022",
                [`${target_date}.environment_readings`]: { $exists: true } // Match documents with the desired date
            },
        },
            {
                $project: {
                    _id: 0, // Exclude the "_id" field
                    temperatureValues: `$${target_date}.environment_readings.temperature`
                }
            }
              
        ];

        const result = await collection.aggregate(pipeline).toArray();
        past_temprature = result
    } catch (error) {
        console.error(error);
        throw error; // Propagate the error for better error handling
    }
}

let past_humidity;
async function fetch_past_humidity(collection) {

    const today = new Date();

    // Calculate the next date by adding 1 day
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + 1);

    // Format the next date as "YYYY-MM-DD"
    const formattedNextDate = nextDate.toISOString().split('T')[0];
    const yearDate = new Date(formattedNextDate);
    yearDate.setFullYear(2022);
    const formattedpreviousDate=yearDate.toISOString().split('T')[0];
    const target_date=formattedpreviousDate
    try {
        const pipeline = [
            {$match:{
                _id: "2022",
                [`${target_date}.environment_readings`]: { $exists: true } // Match documents with the desired date
            },
        },
            {
                $project: {
                    _id: 0, // Exclude the "_id" field
                    humidityvalues: `$${target_date}.environment_readings.humidity`
                }
            }
              
        ];

        const result = await collection.aggregate(pipeline).toArray();
        past_humidity = result
    } catch (error) {
        console.error(error);
        throw error; // Propagate the error for better error handling
    }
}
async function  fetch_all_predicted_temp_today(collection,targettime) {
    try {

        // Parse hours and minutes from targettime
        const [targetHours, targetMinutes] = targettime.split(':').map(Number);

        // Calculate the total minutes for targettime
        const targetTotalMinutes = targetHours * 60 + targetMinutes;

        // Calculate the total minutes for targettime + 2 hours
        const totalMinutesOneHourLater = targetTotalMinutes +  60;

        // Calculate the hours and minutes for targettime + 2 hours
        const hoursOneHourLater = Math.floor(totalMinutesOneHourLater / 60);
        const minutesOneHourLater = totalMinutesOneHourLater % 60;

        // Format the result as 'HH:mm'
        const targettimePlus1 = `${String(hoursOneHourLater).padStart(2, '0')}:${String(minutesOneHourLater).padStart(2, '0')}`;

        const pipeline = [
            {
                $match:{
                    _id: "2024-08-01",
                    
                },
            },
            {
              $unwind: '$environment_readings', // Flatten the "data" array
            },
            {$match:{
                'environment_readings.time':{
                    $gte:targettime,
                    $lte:targettimePlus1 ,
                } , // Filter based on time // Sort by "time" in ascending order
            },
            },
            {
              $group: {
                _id: '$_id',
                real_temp_values : { $push: '$environment_readings.temperature' }, // Push the sorted data back into an array
              },
            },
            {
              $project: {
                _id: 0, // Include only the sorted data array
              }
            },
          ];

        const result=await collection.aggregate(pipeline).toArray();

        if (result.length > 0) {
            const real_temp_values = result[0].real_temp_values;
            
            // Calculate the average of the temperature values
            const averageTemperature = real_temp_values.reduce((acc, value) => acc + value, 0) / real_temp_values.length;
            
            return averageTemperature;
        } else {
            return 'No matching documents found.';
        }
        
       
    } catch (error) {
    console.error(error);
    throw error; // Propagate the error for better error handling
    }
}
async function fetch_all_predicted_humidity_today(collection,targettime) {
    try {

        // Parse hours and minutes from targettime
        const [targetHours, targetMinutes] = targettime.split(':').map(Number);

        // Calculate the total minutes for targettime
        const targetTotalMinutes = targetHours * 60 + targetMinutes;

        // Calculate the total minutes for targettime + 2 hours
        const totalMinutesOneHourLater = targetTotalMinutes +  60;

        // Calculate the hours and minutes for targettime + 2 hours
        const hoursOneHourLater = Math.floor(totalMinutesOneHourLater / 60);
        const minutesOneHourLater = totalMinutesOneHourLater % 60;

        // Format the result as 'HH:mm'
        const targettimePlus1 = `${String(hoursOneHourLater).padStart(2, '0')}:${String(minutesOneHourLater).padStart(2, '0')}`;

        const pipeline = [
            {
                $match:{
                    _id: "2024-08-01",
                    
                },
            },
            {
              $unwind: '$environment_readings', // Flatten the "data" array
            },
            {$match:{
                'environment_readings.time':{
                    $gte:targettime,
                    $lte:targettimePlus1 ,

                    


                } , // Filter based on time // Sort by "time" in ascending order
            },
            },
            {
              $group: {
                _id: '$_id',
                real_hum_values : { $push: '$environment_readings.humidity' }, // Push the sorted data back into an array
              },
            },
            {
              $project: {
                _id: 0, // Include only the sorted data array
              }
            },
          ];

        const result=await collection.aggregate(pipeline).toArray();

        if (result.length > 0) {
            const real_hum_values = result[0].real_hum_values;
            
            // Calculate the average of the temperature values
            const averageHumidity = real_hum_values.reduce((acc, value) => acc + value, 0) / real_hum_values.length;
            
            return averageHumidity;
        } else {
            return 'No matching documents found.';
        }
        
       
    } catch (error) {
    console.error(error);
    throw error; // Propagate the error for better error handling
    }
}


let live_env_data;
async function Live_data_system(collection){
    const result = await collection.aggregate([
        { $sort: { _id: -1 } }, // Sort by _id in descending order to get the last document
        { $limit: 1 }, // Limit the result to only one document
        { $project: { _id: 0 } } // Exclude the _id field from the output
      ]).toArray()
      live_env_data=result[0]
}
ConnectToDB()
  .then(() => {
    const today_1 = new Date();

    // Calculate the next date by adding 1 day
    const nextDate_1 = new Date(today_1);
    nextDate_1.setDate(today_1.getDate() + 1);

        // Format the next date as "YYYY-MM-DD"
    const formattedNextDate_1 = nextDate_1.toISOString().split('T')[0];
    const db = client.db('Railway');
    const collection_for_live=db.collection('People_counting_live');
    const collection_for_pred = db.collection("Predictions_for_people");
    const collection_for_historic=db.collection("People_in_the_station_historic");
    const collection_for_wheelchair=db.collection("Wheelchair_detection");
    const collection_for_predict_heating=db.collection("env_predictions");
    const collection_for_predict_humidity=db.collection("env_predictions");
    const collcetion_for_past_heating = db.collection("environmental_data");
    const collection_for_past_humidity = db.collection("environmental_data");
    const collection_for_live_system = db.collection("environment_system")

    collection_for_wheelchair.deleteMany({});
    collection_for_live.deleteMany({});
    collection_for_pred.deleteOne({_id:formattedNextDate_1})
    collection_for_predict_heating.deleteOne({_id:formattedNextDate_1})
    exec(`python ${pythonScriptPath_live}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    console.log(`Python Script Output: ${stdout}`);
    });

    exec(`python ${pythonScriptPath_prediction}`, (error, stdout, stderr) => {
        if (error) {
        console.error(`Error: ${error.message}`);
        return;
        }
        console.log(`Python Script Output: ${stdout}`);
    });
    
    exec(`python ${pythonScriptPath_wheel}`, (error, stdout, stderr) => {
        if (error) {
        console.error(`Error: ${error.message}`);
        return;
        }
        console.log(`Python Script Output: ${stdout}`);
    });
    exec(`python ${pythonScriptPath_transformation}`, (error, stdout, stderr) => {
        if (error) {
        console.error(`Error: ${error.message}`);
        return;
        }
        console.log(`Python Script Output: ${stdout}`);
    });
    
    exec(`python ${pythonScriptPath_environment_sensors}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          return;
        }
        console.log(`Python Script Output: ${stdout}`);
        });
    exec(`python ${pythonScriptPath_prediction_environmental}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        console.log(`Python Script Output: ${stdout}`);
        });

    app.get('/api/live', (req, res) => {
        queryAndAccumulate(collection_for_live).then( _ =>{
            try {
                res.status(200).json({ totalSensedPeople });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
            });
        
    });

    app.get('/api/get_prediction',(req,res) =>{
        get_prediction(collection_for_pred).then(_=>{
            try{
                res.status(200).json({dataFromDatabase})
            }catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
        
    });

    app.get('/api/get_historic',(req,res)=>{
        get_historic(collection_for_historic).then(_=>{
            try{
                res.status(200).json({historic_list})
            }catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    });

    app.get('/api/wheelchair_detection',(req,res)=>{
        wheelchair_detection(collection_for_wheelchair).then(_=>{
            try{
                res.status(200).json({check_wheelchair})
            }catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    })
    
    app.get('/api/detection',(req,res)=>{
        detection_system(collection_for_wheelchair).then(_=>{
            try{
                res.status(200).json({detection_num})
            }catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
        })
    });

    app.get('/api/get_end_day',(req,res)=>{
        transform_data(collection_for_live).then(_=>{
            try{
                res.status(200).json({new_fields})
            }catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
       
    });

    app.get('/api/get_environmental_prediction_heating',(req,res)=>{
        Heating_prediction_next(collection_for_predict_heating).then(_=>{
            try{
                res.status(200).json({heating_values})
            }catch(error){
                console.log(error);
                res.status(500).json({message:'Internal server error'})
            }
        });
    })

    app.get('/api/predicted_humidity_tommorrow',async  (req, res) => {
        fetch_all_predicted_humidity_tommorrow(collection_for_predict_humidity).then(_=>{
            try{
                res.status(200).json({ humidity_values});
            }catch(error){
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
        
            
        });
    });

    app.get('/api/past_temp_values',async  (req, res) => {
        fetchpasttempFromDB(collcetion_for_past_heating).then(_=>{
            try{
                res.status(200).json({ past_temprature});
            }catch(error){
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
        
            
        });
    });
    app.get('/api/past_humidity_values',async  (req, res) => {
        fetch_past_humidity(collection_for_past_humidity).then(_=>{
            try{
                res.status(200).json({ past_humidity});
            }catch(error){
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
        
            
        });
    });

    app.get('/api/predicted_temp_today',async  (req, res) => {
        try {
            const averageTemperature = await fetch_all_predicted_temp_today(collection_for_predict_heating, currentTime);
            
            // Check if averageTemperature is not null (i.e., data found)
            if (averageTemperature !== null) {
                res.status(200).json({ averageTemperature });
            } else {
                res.status(404).json({ message: 'No data found' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
    
    app.get('/api/predicted_humidity_today',async  (req, res) => {
        try{
            const averageHumidity = await fetch_all_predicted_humidity_today(collection_for_predict_humidity, currentTime);
            
           // Check if averageTemperature is not null (i.e., data found)
            if (averageHumidity !== null) {
                res.status(200).json({ averageHumidity });
            } else {
                res.status(404).json({ message: 'No data found' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
    app.get('/api/live_sensors',async (req,res)=>{
        Live_data_system(collection_for_live_system).then(_=>{
            try{
                res.status(200).json({live_env_data});
            }catch(error){
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    });

    app.post('/api/save_end_day',async (req,res)=>{
        const postData = req.body;
        // Extract the _id from the URL parameter
        // Update the specific document with _id and the "2023-09-27" subdocument
        const currentDate = new Date();

// Transform the date into 'YYYY-MM-DD' format
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        
        // Extract only the year
        const extractedYear = year.toString();
        const result = await collection_for_historic.updateOne(
            { _id: extractedYear, [formattedDate]: { $exists: true } },
            {
              $set: {
                [`${formattedDate}.peak_hour`]: postData.new_fields[0].peak_hour,
                [`${formattedDate}.timeslots`]: postData.new_fields[1],
                [`${formattedDate}.Total_number_of_people`]: postData.new_fields[2].Total_number_of_people,
              }
            },
            {upsert : true }
        );
        if (result.matchedCount === 0) {
            res.status(404).json({ error: 'Document not found ' });
          } 
          else {
            res.json({ message: 'Data inserted successfully' });
            await deleteDataFromLive(collection_for_live);
          }
    }); 
        
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
app.use(cors());