const sampleAttackData = {
    totalLogs: 10,
    attacks: {
        bruteForce: 1,
        portScanning: 1,
        sqlInjection: 1,
        xss: 1
    }
};

const sampleAlerts = [
    {
        type: "Brute Force",
        ip: "192.168.1.5",
        description: "Repeated failed login attempts",
        severity: "High",
        status: "Detected"
    },
    {
        type: "Port Scanning",
        ip: "192.168.1.8",
        description: "Multiple destination ports accessed",
        severity: "Medium",
        status: "Detected"
    },
    {
        type: "SQL Injection",
        ip: "192.168.1.10",
        description: "Suspicious SQL pattern identified",
        severity: "High",
        status: "Detected"
    },
    {
        type: "XSS",
        ip: "192.168.1.11",
        description: "Suspicious script pattern identified",
        severity: "High",
        status: "Detected"
    }
];

let attackChart = null;

function createAttackChart(data) {
    const canvas = document.getElementById("attackChart");

    if (!canvas || typeof Chart === "undefined") {
        console.error("Chart.js or chart canvas not found.");
        return;
    }

    const labels = [
        "Brute Force",
        "Port Scanning",
        "SQL Injection",
        "XSS"
    ];

    const values = [
        data.attacks.bruteForce,
        data.attacks.portScanning,
        data.attacks.sqlInjection,
        data.attacks.xss
    ];

    if (attackChart) {
        attackChart.destroy();
    }

    attackChart = new Chart(canvas, {
        type: "doughnut",

        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    "#20df9a",
                    "#45a7ff",
                    "#ffbd59",
                    "#ff647c"
                ],
                borderColor: "#101a2b",
                borderWidth: 5,
                hoverOffset: 10
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "72%",

            plugins: {
                legend: {
                    display: false
                },

                tooltip: {
                    backgroundColor: "#101a2b",
                    titleColor: "#edf2fa",
                    bodyColor: "#edf2fa",
                    borderColor: "#1e2b40",
                    borderWidth: 1,
                    padding: 12
                }
            }
        }
    });
}

function updateDashboard(data) {
    const attacks = data.attacks;

    const totalThreats =
        attacks.bruteForce +
        attacks.portScanning +
        attacks.sqlInjection +
        attacks.xss;

    const totalLogsElement = document.getElementById("totalLogs");
    const totalThreatsElement = document.getElementById("totalThreats");

    if (totalLogsElement) {
        totalLogsElement.textContent = data.totalLogs;
    }

    if (totalThreatsElement) {
        totalThreatsElement.textContent = totalThreats;
    }

    const countElements = {
        bruteCount: attacks.bruteForce,
        portCount: attacks.portScanning,
        sqlCount: attacks.sqlInjection,
        xssCount: attacks.xss
    };

    Object.entries(countElements).forEach(([id, value]) => {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    });

    const overviewElements = {
        bruteOverviewCount: attacks.bruteForce,
        portOverviewCount: attacks.portScanning,
        sqlOverviewCount: attacks.sqlInjection,
        xssOverviewCount: attacks.xss
    };

    Object.entries(overviewElements).forEach(([id, value]) => {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = String(value).padStart(2, "0");
        }
    });

    createAttackChart(data);
}

function updateAlerts(alerts) {
    const tableBody = document.getElementById("alertsTableBody");
    const emptyMessage = document.getElementById("emptyAlerts");

    if (!tableBody) {
        return;
    }

    tableBody.replaceChildren();

    if (!alerts || alerts.length === 0) {
        if (emptyMessage) {
            emptyMessage.hidden = false;
        }
        return;
    }

    if (emptyMessage) {
        emptyMessage.hidden = true;
    }

    alerts.forEach(alert => {
        const row = document.createElement("tr");

        const typeCell = document.createElement("td");
        typeCell.textContent = alert.type;

        const ipCell = document.createElement("td");
        ipCell.textContent = alert.ip;

        const descriptionCell = document.createElement("td");
        descriptionCell.textContent = alert.description;

        const severityCell = document.createElement("td");
        const severityBadge = document.createElement("span");

        const severity = String(alert.severity || "Low").toLowerCase();

        severityBadge.className = `severity severity-${severity}`;
        severityBadge.textContent = alert.severity || "Low";
        severityCell.appendChild(severityBadge);

        const statusCell = document.createElement("td");
        const statusBadge = document.createElement("span");

        statusBadge.className = "badge danger";
        statusBadge.textContent = alert.status || "Detected";
        statusCell.appendChild(statusBadge);

        row.append(
            typeCell,
            ipCell,
            descriptionCell,
            severityCell,
            statusCell
        );

        tableBody.appendChild(row);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    updateDashboard(sampleAttackData);
    updateAlerts(sampleAlerts);
});
