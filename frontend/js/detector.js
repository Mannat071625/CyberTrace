
const requiredColumns = [
    "timestamp",
    "source_ip",
    "event",
    "username",
    "destination_port",
    "message"
];

let selectedCSVFile = null;
let parsedCSVRecords = [];

const csvInput = document.getElementById("csvFile");
const uploadBox = document.getElementById("uploadBox");
const uploadMessage = document.getElementById("uploadMessage");
const fileInformation = document.getElementById("fileInformation");
const previewSection = document.getElementById("previewSection");
const previewTableBody = document.getElementById("previewTableBody");
const scanButton = document.getElementById("prepareScanBtn");
const scanMessage = document.getElementById("scanMessage");
const totalAlertsCount = document.getElementById("totalAlertsCount");
const alertsContainer = document.getElementById("alertsContainer");

function parseCSVLine(line) {
    const result = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (insideQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === "," && !insideQuotes) {
            result.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);

    if (lines.length < 2) {
        return {
            headers: [],
            records: []
        };
    }

    const rawHeaders = parseCSVLine(lines[0]).map(header =>
    header.trim().toLowerCase()
);

const headerAliases = {
    sourceip: "source_ip",
    destinationport: "destination_port"
};

const headers = rawHeaders.map(header =>
    headerAliases[header] || header
);

    const records = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) {
            continue;
        }

        const values = parseCSVLine(lines[i]);
        const record = {};

        headers.forEach((header, index) => {
            record[header] = values[index] || "";
        });

        records.push(record);
    }

    return {
        headers,
        records
    };
}


function validateCSV(headers, records) {
    const headerAliases = {
        source_ip: ["source_ip", "sourceip"],
        destination_port: ["destination_port", "destinationport"]
    };

    const missingColumns = requiredColumns.filter(column => {
        const aliases = headerAliases[column] || [column];
        return !aliases.some(alias => headers.includes(alias));
    });

    if (missingColumns.length > 0) {
        return {
            valid: false,
            message: `Missing required columns: ${missingColumns.join(", ")}`
        };
    }

    if (records.length === 0) {
        return {
            valid: false,
            message: "The CSV file contains no data records."
        };
    }

    return {
        valid: true,
        message: "CSV file validated successfully."
    };
}


function displayPreview(records) {
    previewTableBody.innerHTML = "";

    const previewRecords = records.slice(0, 5);

    previewRecords.forEach(record => {
        const row = document.createElement("tr");

        requiredColumns.forEach(column => {
            const cell = document.createElement("td");
            cell.textContent = record[column] || "";
            row.appendChild(cell);
        });

        previewTableBody.appendChild(row);
    });

    previewSection.hidden = false;
previewSection.style.display = "";
}

function resetUpload() {
    selectedCSVFile = null;
    parsedCSVRecords = [];

    csvInput.value = "";
    scanButton.disabled = true;
    fileInformation.innerHTML = "";
    uploadMessage.textContent = "";
    previewTableBody.innerHTML = "";
    previewSection.hidden = true;
previewSection.style.display = "";

    if (scanMessage) {
        scanMessage.textContent = "";
    }

    if (alertsContainer) {
        alertsContainer.innerHTML = "";
    }

    if (totalAlertsCount) {
        totalAlertsCount.textContent = "0";
    }

    const counters = [
        "bruteForceCount",
        "portScanningCount",
        "sqlInjectionCount",
        "scanXssCount"
    ];

    counters.forEach(id => {
        const counter = document.getElementById(id);

        if (counter) {
            counter.textContent = "0";
        }
    });
}

function handleCSVFile(file) {
    if (!file) {
        return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
        uploadMessage.textContent = "Please upload a CSV file.";
        uploadMessage.style.color = "#ff5c5c";
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
        try {
            const csvText = event.target.result;
            const parsed = parseCSV(csvText);
            const validation = validateCSV(parsed.headers, parsed.records);

            if (!validation.valid) {
                uploadMessage.textContent = validation.message;
                uploadMessage.style.color = "#ff5c5c";
                return;
            }

            selectedCSVFile = file;
            parsedCSVRecords = parsed.records;
            scanButton.disabled = false;

            uploadMessage.textContent = validation.message;
            uploadMessage.style.color = "#4ade80";

            fileInformation.innerHTML = `
                <div class="file-info">
                    <span>${file.name}</span>
                    <span>${parsed.records.length} records</span>
                </div>
            `;

            displayPreview(parsed.records);
        } catch (error) {
            uploadMessage.textContent = "Error reading CSV file.";
            uploadMessage.style.color = "#ff5c5c";
        }
    };

    reader.onerror = function () {
        uploadMessage.textContent = "Unable to read the selected file.";
        uploadMessage.style.color = "#ff5c5c";
    };

    reader.readAsText(file);
}

csvInput.addEventListener("change", event => {
    const file = event.target.files[0];
    handleCSVFile(file);
});

uploadBox.addEventListener("dragover", event => {
    event.preventDefault();
    uploadBox.classList.add("drag-over");
});

uploadBox.addEventListener("dragleave", () => {
    uploadBox.classList.remove("drag-over");
});

uploadBox.addEventListener("drop", event => {
    event.preventDefault();
    uploadBox.classList.remove("drag-over");

    const file = event.dataTransfer.files[0];
    handleCSVFile(file);
});

const removeFileButton = document.getElementById("removeFileBtn");

if (removeFileButton) {
    removeFileButton.addEventListener("click", resetUpload);
}

scanButton.addEventListener("click", async () => {
    if (!selectedCSVFile || parsedCSVRecords.length === 0) {
        scanMessage.textContent = "Please upload a valid CSV file first.";
        scanMessage.style.color = "#ff5c5c";
        return;
    }

    scanButton.disabled = true;
    scanButton.textContent = "Scanning...";
    scanMessage.textContent = "Analyzing logs...";
    scanMessage.style.color = "var(--text-secondary)";
    alertsContainer.innerHTML = "";

    try {
        const csvText = await selectedCSVFile.text();

        const response = await fetch("http://localhost:18080/upload", {
            method: "POST",
            headers: {
                "Content-Type": "text/plain"
            },
            body: csvText
        });

        const responseText = await response.text();

        if (!response.ok) {
            throw new Error(responseText || "Server error during scan.");
        }

        const result = JSON.parse(responseText);
        const scanResultsSection = document.getElementById("scanResultsSection");
        scanResultsSection.hidden = false;

        totalAlertsCount.textContent = result.totalAlerts;

        const attackCounts = {
            bruteForce: 0,
            portScanning: 0,
            sqlInjection: 0,
            xss: 0
        };

        result.alerts.forEach(alert => {
            const type = alert.attackType.toLowerCase();

            if (type.includes("brute")) {
                attackCounts.bruteForce++;
            } else if (type.includes("port")) {
                attackCounts.portScanning++;
            } else if (type.includes("sql")) {
                attackCounts.sqlInjection++;
            } else if (type.includes("xss")) {
                attackCounts.xss++;
            }
        });

        document.getElementById("bruteForceCount").textContent =
            attackCounts.bruteForce;

        document.getElementById("portScanningCount").textContent =
            attackCounts.portScanning;

        document.getElementById("sqlInjectionCount").textContent =
            attackCounts.sqlInjection;

        document.getElementById("scanXssCount").textContent =
            attackCounts.xss;

        const scanHistory = JSON.parse(localStorage.getItem("cyberTraceHistory") || "[]");

scanHistory.unshift({
    date: new Date().toLocaleString(),
    fileName: selectedCSVFile.name,
    totalAlerts: result.totalAlerts,
    bruteForce: attackCounts.bruteForce,
    portScanning: attackCounts.portScanning,
    sqlInjection: attackCounts.sqlInjection,
    xss: attackCounts.xss
});

localStorage.setItem("cyberTraceHistory", JSON.stringify(scanHistory));

        if (result.alerts.length === 0) {
            scanMessage.textContent = "Scan completed. No threats detected.";
            scanMessage.style.color = "#4ade80";

            const emptyMessage = document.createElement("p");
            emptyMessage.textContent = "No suspicious activity found.";
            emptyMessage.className = "no-alerts-message";
            alertsContainer.appendChild(emptyMessage);
        } else {
            scanMessage.textContent =
                `Scan completed. ${result.totalAlerts} alert(s) detected.`;

            scanMessage.style.color = "#ff5c5c";

            result.alerts.forEach(alert => {
                const alertCard = document.createElement("div");
                alertCard.className = "alert-card";

                const alertTitle = document.createElement("h4");
                alertTitle.textContent = alert.attackType;

                const alertDetails = document.createElement("p");
                alertDetails.textContent = alert.description;

                const alertIP = document.createElement("p");
                alertIP.textContent = `Source IP: ${alert.sourceIP}`;

                const alertEvent = document.createElement("p");
                alertEvent.textContent = `Event: ${alert.event}`;

                alertCard.appendChild(alertTitle);
                alertCard.appendChild(alertDetails);
                alertCard.appendChild(alertIP);
                alertCard.appendChild(alertEvent);

                alertsContainer.appendChild(alertCard);
            });
        }
    } catch (error) {
        scanMessage.textContent = `Scan failed: ${error.message}`;
        scanMessage.style.color = "#ff5c5c";
    } finally {
        scanButton.disabled = false;
        scanButton.textContent = "Scan Logs";
    }
});
