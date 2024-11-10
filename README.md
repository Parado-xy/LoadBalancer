
# Load Balancer and Monitoring Dashboard

This application is a load balancer with a WebSocket-based dashboard that monitors and visualizes key metrics for multiple backend servers. The application supports request distribution and server health monitoring, with metrics such as total requests, average response time, active servers, and error rates displayed in a responsive dashboard.

## Features
- **Load Balancer**: Routes incoming requests to backend servers in a round-robin fashion.
- **Real-Time Monitoring**: Tracks metrics such as request count, response time, and error rate for each server.
- **WebSocket Dashboard**: Updates the dashboard in real-time with metrics, displayed using Bootstrap and Chart.js.
- **Responsive Layout**: Dashboard is mobile-friendly, with metrics and charts adjusting based on screen size.

## File Structure
```
.
├── index.html               # Frontend HTML for the monitoring dashboard
├── balancer.js              # Main load balancer and WebSocket server
└── script.js                # Client-side JavaScript for rendering charts and metrics
```

## Setup and Installation
1. **Install Dependencies**: Clone the repository and install dependencies.
   ```bash
   npm install express path axios ws http dotenv multer
   ```

2. **Start MongoDB (if required)**: If the project requires MongoDB, start the MongoDB service.
   ```bash
   sudo service mongodb start
   ```

3. **Run the Application**:
   ```bash
   node balancer.js
   ```
   The load balancer and monitoring dashboard will be available at [http://localhost:8080](http://localhost:8080).

## How It Works
1. **Request Routing**: Incoming requests to `http://localhost:8080` are routed to backend servers running on ports `3000` and `3001`.
2. **Round-Robin Load Balancing**: Each request is directed to the next available server in a round-robin sequence.
3. **Metrics Collection**: For each request, the application logs metrics like response time, error rates, and server status.
4. **WebSocket Dashboard**: A WebSocket connection sends metrics to connected clients in real-time, displaying server statistics and request trends in the dashboard.

## Frontend Dashboard
The dashboard displays the following metrics:
- **Total Requests**: Total requests received by the load balancer.
- **Average Response Time**: Average response time across all servers.
- **Active Servers**: Number of active servers.
- **Current Server**: The server currently handling requests.
- **Server-Specific Metrics**: Per-server metrics, including response time, error rate, and last error message.

Charts visualize trends for:
- Response times
- Request distribution
- Error rates

## Code Overview
- **Load Balancer Logic**: Routes requests in round-robin style to active servers.
- **Error Handling**: Catches and logs server errors, updating server status metrics.
- **WebSocket Server**: Sends metrics data to connected clients to update the dashboard in real-time.
- **Metrics Calculation**: Averages response times and computes error rates to reflect current server health.

## Future Improvements
- **Dynamic Server Pool Management**: Add functionality to dynamically add or remove servers from the pool.
- **Server Health Checks**: Implement periodic health checks to automatically disable or enable servers based on their availability and response time.
- **Request Retry Mechanism**: Retry failed requests on a different server before responding with an error to improve reliability.
- **Load-Balancing Algorithms**: Implement additional algorithms such as weighted round-robin, least connections, and IP hashing.
- **Persistent Metrics Storage**: Save metrics to a database (e.g., MongoDB) for historical analysis and visualization.
- **Enhanced Dashboard**: Display additional insights like server uptime, CPU and memory usage, and an error log.

## Dependencies
- [Express](https://expressjs.com/): Web application framework for Node.js.
- [Axios](https://www.npmjs.com/package/axios): Promise-based HTTP client.
- [WebSocket](https://www.npmjs.com/package/ws): WebSocket implementation for real-time communication.
- [Chart.js](https://www.chartjs.org/): JavaScript charting library for data visualization.
- [Bootstrap](https://getbootstrap.com/): Frontend toolkit for responsive design.

## License
This project is licensed under the MIT License.
