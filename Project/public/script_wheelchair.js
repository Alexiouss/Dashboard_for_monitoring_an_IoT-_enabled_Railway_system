let first=0;
let previous_detection;
let next_detection;
let wheelChairExists = false;
async function check_for_wheelchair(time) {
    try {
        const response = await fetch('/api/wheelchair_detection'); // This assumes your server is running on the same domain
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        var nameArray = data.check_wheelchair.detection.name;

// Check if the array contains the string "Wheel_chair"
        if (nameArray.includes("wheel_chair")) {
            wheelChairExists = true;
        } else {
            wheelChairExists = false;
        }
        // data.check_wheelchair.detection.forEach(item => {
        //     if (item.name === "wheel_chair") {
                
        //     }
        // });
        if (wheelChairExists && (time>3)) {
            document.getElementById('wheel_chair').textContent = "Wheelchair_detected....Failed to initiate system.\nRequired manual system initiation";
        } 
        else if (wheelChairExists && (time<4)) {
            document.getElementById('wheel_chair').textContent = "Wheelchair_detected....Initiating system";
        } else if(!wheelChairExists) {
            document.getElementById('wheel_chair').textContent = "Wheelchair_not_detected";
        }
        
    } catch (error) {
        console.error(error);
        document.getElementById('wheel_chair').textContent = 'Error fetching data';
        throw error; // Re-throw the error to handle it further, if needed
    }
}

async function check_detection(){
    try {
        const response = await fetch('/api/detection'); // This assumes your server is running on the same domain
        const data = await response.json();
        document.getElementById('wheel_chair').textContent ="Entering sleep mode";
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        if(first==0){
            previous_detection = data.detection_num;
            first=1;
            setTimeout(check_detection,5000);
        }
        else{
            next_detection = data.detection_num;
            console.log(previous_detection,next_detection)
            if(previous_detection!=next_detection){
                check_for_wheelchair(next_detection);
            }
            previous_detection=next_detection;
            setTimeout(check_detection,5000);
        }
    } catch (error) {
        console.error(error);
        document.getElementById('check_wheelchair').textContent = 'Nooooooooooooooooooooooooooo';
        throw error; // Re-throw the error to handle it further, if needed
    }
}

check_detection();





