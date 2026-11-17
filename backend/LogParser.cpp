
#include "LogParser.h"
#include <fstream>
#include <stdexcept>

vector<string> splitCSV(const string& line) {
    vector<string> fields;
    string field;
    bool insideQuotes = false;

    for (int i = 0; i < line.size(); i++) {
        char ch = line[i];

        if (ch == '"') {
            if (insideQuotes && i + 1 < line.size() && line[i + 1] == '"') {
                field += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        }
        else if (ch == ',' && !insideQuotes) {
            fields.push_back(field);
            field.clear();
        }
        else {
            field += ch;
        }
    }

    if (insideQuotes)
        throw runtime_error("Unclosed quotation mark");

    fields.push_back(field);
    return fields;
}

vector<SecurityLog> LogParser::parseFile(const string& filename) {
    ifstream file(filename);

    if (!file.is_open())
        throw runtime_error("Unable to open CSV file");

    vector<SecurityLog> logs;
    string line;
    int lineNumber = 1;

    getline(file, line);

    while (getline(file, line)) {
        lineNumber++;

        if (line.empty())
            continue;

        try {
            vector<string> fields = splitCSV(line);

            if (fields.size() != 6)
                throw runtime_error("Expected 6 columns, found " + to_string(fields.size()));

            SecurityLog log;
            log.timestamp = fields[0];
            log.sourceIP = fields[1];
            log.event = fields[2];
            log.username = fields[3];
            log.destinationPort = stoi(fields[4]);
            log.message = fields[5];

            logs.push_back(log);
        }
        catch (const exception& e) {
            throw runtime_error("CSV line " + to_string(lineNumber) + ": " + e.what());
        }
    }

    return logs;
}
