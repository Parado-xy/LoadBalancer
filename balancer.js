const express = require('express');
const path = require('path');
const app = express();
const axios = require('axios');
const WebSocket = require('ws');
const http = require('http');

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Application servers
const servers = [
    { id: 1, host: "localhost", port: 3000, requests: 0, status: 'active', responseTime: 0, errorRate: 0, lastError: null },
    { id: 2, host: "localhost", port: 3001, requests: 0, status: 'active', responseTime: 0, errorRate: 0, lastError: null }
];

// Track the current application server to send request
let current = 0;

// Metrics state
let metrics = {
    totalRequests: 0,
    avgResponseTime: 0,
    servers: servers.reduce((acc, server) => {
        acc[server.id] = {
            host: server.host,
            port: server.port,
            requests: 0,
            status: 'active',
            responseTime: 0,
            errorRate: 0,
            lastError: null
        };
        return acc;
    }, {}),
    currentServer: current
};

// Broadcast metrics to all connected clients
function broadcastMetrics() {
    const clients = wss.clients;
    const data = JSON.stringify(metrics);
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

// Handle incoming requests
const handler = async (req, res) => {
    const { method, originalUrl, headers, body } = req;
    console.log(req.originalUrl)
    const server = servers[current];
    const startTime = Date.now();

    // Update current server index
    current = (current + 1) % servers.length;
    metrics.currentServer = current;

    try {
        // Request to application server
        console.log(`http://${server.host}:${server.port}${originalUrl}`)
        const response = await axios({
            url: `http://${server.host}:${server.port}${originalUrl}`,
            method: method,
            headers: headers,
            data: body
        });

        // Update metrics
        const responseTime = Date.now() - startTime;
        metrics.totalRequests++;
        metrics.servers[server.id].requests++;
        metrics.servers[server.id].responseTime = 
            (metrics.servers[server.id].responseTime + responseTime) / 2;
        metrics.avgResponseTime = 
            Object.values(metrics.servers).reduce((acc, s) => acc + s.responseTime, 0) / 
            Object.keys(metrics.servers).length;

        // Broadcast updated metrics
        broadcastMetrics();

        res.send(response.data);
    } catch (err) {
        // Update error metrics
        metrics.servers[server.id].status = 'error';
        metrics.servers[server.id].lastError = err.message;
        metrics.servers[server.id].errorRate = 
            (metrics.servers[server.id].errorRate + 1) / 2;

        // Broadcast updated metrics
        broadcastMetrics();

        res.status(500).send("Server error!");
    }
};

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.send(JSON.stringify(metrics))});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});    

app.use('*', handler)

server.listen(8080, ()=> {
    console.log(`Balancer listening on http://localhost:8080`)
})    