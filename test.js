
const express = require('express')




// Function to initialize and configure a new server instance
function createServer(port) {
  const app = express();
  
  // // Apply middlewares
  // applyMiddleware();

  app.use((req, res, next) => {
    console.log(`[${port}] Request URL: ${req.url}`);
    next();
  });

  // Routes
  app.get('/something', (req, res)=> {res.send({'something':'something'})})

  app.all("*", (req, res) => {
    console.log(`[${port}] Route not found: ${req.url}`);
    res.status(404).json({ status: "404 :(" });
  });

  // Start listening
  app.listen(port, () => {
    console.log(`SERVER IS LISTENING ON PORT ${port}`);
    console.log(`http://localhost:${port}`);
  });

  return app;
}

// Initialize servers on different ports
const server = createServer(3000); 
const server2 = createServer(3001);


