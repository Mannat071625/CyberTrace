# CyberTrace

CyberTrace is a C++-based cybersecurity log analyzer that detects suspicious activities in log files. It provides a web-based interface for log analysis, threat detection, regex testing, and automata visualization.

## Features

- CSV log upload and validation
- Log preview before scanning
- Detection of Brute Force attacks
- Detection of Port Scanning
- Detection of SQL Injection
- Detection of Cross-Site Scripting (XSS)
- Scan result dashboard
- Detection History with locally stored scan records
- Downloadable scan reports
- Regex Playground for testing regular expressions
- Automata Visualizer for Regex-to-NFA, NFA-to-DFA, and DFA minimization
- String acceptance and rejection simulation

## Technologies Used

### Backend
- C++
- C++17
- Crow
- Asio

### Frontend
- HTML5
- CSS3
- JavaScript

## Project Structure

```text
CyberTrace/
├── backend/
│   ├── main.cpp
│   ├── api.cpp
│   ├── AttackDetector.cpp
│   ├── DFA.cpp
│   ├── DFAMinimizer.cpp
│   ├── JSONSerializer.cpp
│   ├── LogParser.cpp
│   ├── NFA.cpp
│   ├── NFAtoDFA.cpp
│   ├── RegexParser.cpp
│   └── third_party/
│       ├── Crow/
│       └── asio/
├── datasets/
│   ├── sample-logs.csv
│   ├── test-logs.csv
│   └── clean-logs.csv
└── frontend/
    ├── index.html
    ├── automata.html
    ├── css/
    │   ├── style.css
    │   ├── threat-detection.css
    │   ├── regex-playground.css
    │   └── automata.css
    └── js/
        ├── script.js
        ├── dashboard.js
        ├── detector.js
        ├── regex.js
        ├── automata.js
        ├── visualizer.js
        └── string-simulator.js
```

## Prerequisites

- Windows
- GCC/G++ compiler supporting C++17 (MinGW-w64)
- Visual Studio Code
- Live Server extension for VS Code

## Setup and Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/CyberTrace.git
cd CyberTrace
```

### 2. Build the Backend

Run the following command from the project root directory:

```bash
g++ -std=c++17 backend/main.cpp backend/api.cpp backend/AttackDetector.cpp backend/DFA.cpp backend/DFAMinimizer.cpp backend/JSONSerializer.cpp backend/LogParser.cpp backend/NFA.cpp backend/NFAtoDFA.cpp backend/RegexParser.cpp -Ibackend/third_party/Crow/include -Ibackend/third_party/asio -o backend/CyberTrace.exe
```

### 3. Start the Backend Server

Navigate to the backend directory and run:

```bash
cd backend
./CyberTrace.exe
```

The backend server runs on port **18080**.

### 4. Start the Frontend

1. Open the project in Visual Studio Code.
2. Open `frontend/index.html`.
3. Right-click and select **Open with Live Server**.
4. The CyberTrace dashboard will open in your browser.

## Usage

1. Open the CyberTrace dashboard.
2. Upload a CSV log file.
3. Validate the file and review the log preview.
4. Start the scan.
5. View detected threats and scan statistics on the dashboard.
6. Download the scan report if required.
7. Visit Detection History to review previous