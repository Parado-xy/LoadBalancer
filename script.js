// WebSocket connection
const ws = new WebSocket('ws://localhost:8080/metrics');
        
// Dashboard state
let dashboardState = {
    totalRequests: 0,
    avgResponseTime: 0,
    servers: {},
    timeSeriesData: [],
    currentServer: 0
};

// Charts configuration
let charts = {
    responseTime: null,
    requestDist: null,
    errorRate: null
};

// Initialize charts
function initializeCharts() {
    // Response Time Chart
    const rtCtx = document.getElementById('responseTimeChart').getContext('2d');
    charts.responseTime = new Chart(rtCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Response Time (ms)',
                data: [],
                borderColor: '#0d6efd',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            animation: false
        }
    });

    // Request Distribution Chart
    const rdCtx = document.getElementById('requestDistChart').getContext('2d');
    charts.requestDist = new Chart(rdCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Requests per Server',
                data: [],
                backgroundColor: '#198754'
            }]
        },
        options: {
            responsive: true,
            animation: false
        }
    });

    // Error Rate Chart
    const erCtx = document.getElementById('errorRateChart').getContext('2d');
    charts.errorRate = new Chart(erCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Error Rate (%)',
                data: [],
                borderColor: '#dc3545',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            animation: false
        }
    });
}

// Update UI with new metrics
function updateUI(metrics) {
    // Update overall metrics
    document.getElementById('totalRequests').textContent = metrics.totalRequests.toLocaleString();
    document.getElementById('avgResponseTime').textContent = `${metrics.avgResponseTime.toFixed(2)} ms`;
    document.getElementById('activeServers').textContent = 
        `${Object.values(metrics.servers).filter(s => s.status === 'active').length}/${Object.keys(metrics.servers).length}`;
    document.getElementById('currentServer').textContent = `Server ${metrics.currentServer}`;

    // Update server cards
    updateServerCards(metrics.servers);

    // Update charts
    updateCharts(metrics);

    // Update alerts
    updateAlerts(metrics.servers);
}

// Update server cards
function updateServerCards(servers) {
    const container = document.getElementById('serverContainer');
    container.innerHTML = '';

    Object.entries(servers).forEach(([id, server]) => {
        const card = document.createElement('div');
        card.className = 'card metrics-card';
        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">
                    <span class="status-badge status-${server.status}"></span>
                    Server ${id} (${server.host}:${server.port})
                </h5>
                <div class="row">
                    <div class="col-6">
                        <div class="metric-label">Requests</div>
                        <div class="metric-value">${server.requests.toLocaleString()}</div>
                    </div>
                    <div class="col-6">
                        <div class="metric-label">Response Time</div>
                        <div class="metric-value">${server.responseTime.toFixed(2)} ms</div>
                    </div>
                    <div class="col-6">
                        <div class="metric-label">Error Rate</div>
                        <div class="metric-value">${server.errorRate.toFixed(2)}%</div>
                    </div>
                    <div class="col-6">
                        <div class="metric-label">Last Error</div>
                        <div class="metric-value">${server.lastError || '-'}</div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Update charts
function updateCharts(metrics) {
    const now = new Date().toLocaleTimeString();

    // Update Response Time Chart
    charts.responseTime.data.labels.push(now);
    charts.responseTime.data.datasets[0].data.push(metrics.avgResponseTime);
    if (charts.responseTime.data.labels.length > 20) {
        charts.responseTime.data.labels.shift();
        charts.responseTime.data.datasets[0].data.shift();
    }
    charts.responseTime.update('none');

    // Update Request Distribution Chart
    charts.requestDist.data.labels = Object.keys(metrics.servers).map(id => `Server ${id}`);
    charts.requestDist.data.datasets[0].data = Object.values(metrics.servers).map(s => s.requests);
    charts.requestDist.update('none');

    // Update Error Rate Chart
    charts.errorRate.data.labels.push(now);
    charts.errorRate.data.datasets[0].data.push(
        Object.values(metrics.servers).reduce((acc, s) => acc + s.errorRate, 0) / Object.keys(metrics.servers).length
    );
    if (charts.errorRate.data.labels.length > 20) {
        charts.errorRate.data.labels.shift();
        charts.errorRate.data.datasets[0].data.shift();
    }
    charts.errorRate.update('none');
}

// Update alerts
function updateAlerts(servers) {
    const alertsContainer = document.getElementById('alertsContainer');
    alertsContainer.innerHTML = '';

    Object.entries(servers).forEach(([id, server]) => {
        if (server.status === 'error') {
            alertsContainer.innerHTML += `
                <div class="alert alert-danger" role="alert">
                    <strong>Server ${id} Error:</strong> ${server.host}:${server.port} is experiencing issues!
                    ${server.lastError ? `<br>Last Error: ${server.lastError}` : ''}
                </div>
            `;
        }
    });
}

// WebSocket event handlers
ws.onopen = () => {
    console.log('Connected to metrics WebSocket');
    initializeCharts();
};

ws.onmessage = (event) => {
    const metrics = JSON.parse(event.data);
    dashboardState = metrics;
    updateUI(metrics);
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    document.getElementById('alertsContainer').innerHTML = `
        <div class="alert alert-danger" role="alert">
            Error connecting to metrics service! Retrying...
        </div>
    `;
};

ws.onclose = () => {
    console.log('Disconnected from metrics WebSocket');
    //reconnection logic here if needed
    setTimeout(() => {
        window.location.reload();
    }, 5000);
};