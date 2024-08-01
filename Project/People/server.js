const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 8080;

// Function to serve the static files (HTML, JS)
function serveStaticFile(response, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      response.writeHead(404);
      response.end("File not found");
    } else {
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end(data);
    }
  });
}

// Create the server
const server = http.createServer((req, res) => {
  const url = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(__dirname, url);
  serveStaticFile(res, filePath);
});

// Start the server
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
