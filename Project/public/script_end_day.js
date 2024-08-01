document.addEventListener('DOMContentLoaded', function () {
    const fetchAndSaveButton = document.getElementById('fetchAndSaveButton');
    const responseContainer = document.getElementById('responseContainer');
  
    fetchAndSaveButton.addEventListener('click', () => {
      // Step 1: Make a GET request to fetch data
      fetch('/api/get_end_day')
        .then(response => response.json())
        .then(data => {
          responseContainer.innerHTML = 'Data fetched successfully:<br>' ;
  
          // Step 2: Make a POST request to insert the fetched data into an existing document and object

          const url = '/api/save_end_day/';
  
          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data), // Send the fetched data in the request body
          })
            .then(response => response.json())
            .then(result => {
              responseContainer.innerHTML += '<br><br>' + result.message;
            })
            .catch(error => {
              console.error('Error:', error);
              responseContainer.innerHTML += '<br><br>Error occurred while inserting data.';
            });
        })
        .catch(error => {
          console.error('Error:', error);
          responseContainer.innerHTML = 'Error occurred while fetching data.';
        });
    });
  });
  