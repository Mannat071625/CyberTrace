
#pragma once
#include <string>
#include <vector>
using namespace std;

struct SecurityLog {
    string timestamp;
    string sourceIP;
    string event;
    string username;
    int destinationPort;
    string message;
};

class LogParser {
public:
    static vector<SecurityLog> parseFile(const string& filename);
};
