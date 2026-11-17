
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
const prepareScanBtn = document.getElementById("prepareScanBtn");

function parseCSVLine(line) {
    const values = [];
    let currentValue = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const character = line[i];

        if (character === '"') {
            if (insideQuotes && line[i + 1] === '"') {
                currentValue += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (character === "," && !insideQuotes) {
            values.push(currentValue.trim());
            currentValue = "";
        } else {
            currentValue += character;
        }
    }

    values.push(currentValue.trim());

    return values;
}

function parseCSV(text) {
    const lines = text
        .replace(/^\uFEFF/, "")
        .split(/\r?\n/)
        .filter(line => line.trim() !== "");

    if (lines.length < 2) {
        throw new Error("The CSV file does not contain any data records.");
    }

    const headers = parseCSVLine(lines[0]).map(header =>
        header.trim().toLowerCase()
    );

    const missingColumns = requiredColumns.filter(
        column => !headers.includes(column)
    );

    if (missingColumns.length > 0) {
        throw new Error(
            "Missing required columns: " + missingColumns.join(", ")
        );
    }

    const records = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);

        if (values.length !== headers.length) {
            throw new Error(
                "Invalid number of fields on CSV row " + (i + 1) + "."
            );
        }

        const record = {};

        headers.forEach((header, index) => {
            record[header] = values[index];
        });

        records.push(record);
    }

    return {
        headers,
        records
    };
}

function showUploadMessage(message, type = "") {
    uploadMessage.textContent = message;
    uploadMessage.className = "upload-message";

    if (type) {
        uploadMessage.classList.add(type);
    }
}

function displayFileInformation(file) {
    document.getElementById("fileName").textContent = file.name;

    const sizeInKB = (file.size / 1024).toFixed(2);

    document.getElementById("fileSize").textContent =
        sizeInKB + " KB";

    fileInformation.hidden = false;
}

function displayPreview(records) {
    previewTableBody.replaceChildren();

    const previewRecords = records.slice(0, 10);

    previewRecords.forEach(record => {
        const row = document.createElement("tr");

        requiredColumns.forEach(column => {
            const cell = document.createElement("td");
            cell.textContent = record[column] || "-";
            row.appendChild(cell);
        });

        previewTableBody.appendChild(row);
    });

    document.getElementById("recordCount").textContent = records.length;

    document.getElementById("columnCount").textContent =
        requiredColumns.length;

    document.getElementById("fileStatus").textContent = "Valid";

    document.getElementById("previewDescription").textContent =
        "Showing " + previewRecords.length +
        " of " + records.length + " records";

    document.getElementById("previewNote").textContent =
        records.length > 10
            ? "Showing the first 10 records. All records were loaded for validation."
            : "All records are displayed.";

    previewSection.hidden = false;
    prepareScanBtn.disabled = false;

    document.getElementById("scanMessage").textContent =
        "CSV structure validated. The file is ready to be handed to the backend when its API is connected.";
}

async function handleCSVFile(file) {
    if (!file) {
        return;
    }

    resetDetectionPage();

    if (!file.name.toLowerCase().endsWith(".csv")) {
        showUploadMessage("Please select a CSV file.", "error");
        return;
    }

    if (file.size === 0) {
        showUploadMessage("The selected file is empty.", "error");
        return;
    }

    selectedCSVFile = file;

    try {
        const text = await file.text();
        const result = parseCSV(text);

        parsedCSVRecords = result.records;

        displayFileInformation(file);
        displayPreview(parsedCSVRecords);

        showUploadMessage(
            "CSV uploaded successfully. All required columns were found.",
            "success"
        );

    } catch (error) {
        selectedCSVFile = null;
        parsedCSVRecords = [];

        showUploadMessage(error.message, "error");
    }
}

function resetDetectionPage() {
    selectedCSVFile = null;
    parsedCSVRecords = [];

    fileInformation.hidden = true;
    previewSection.hidden = true;
    previewTableBody.replaceChildren();

    prepareScanBtn.disabled = true;

    document.getElementById("scanMessage").textContent =
        "Upload a valid CSV file to continue.";
}

csvInput.addEventListener("change", event => {
    const file = event.target.files[0];
    handleCSVFile(file);
});

document.getElementById("removeFileBtn").addEventListener("click", () => {
    csvInput.value = "";
    resetDetectionPage();
    showUploadMessage("File removed. Select another CSV file.");
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

    if (file) {
        csvInput.value = "";
        handleCSVFile(file);
    }
});

prepareScanBtn.addEventListener("click", () => {
    if (!selectedCSVFile || parsedCSVRecords.length === 0) {
        return;
    }

    document.getElementById("scanMessage").textContent =
        "CSV validation is complete. Backend connection is not configured yet, so no attack analysis has been performed.";
});
