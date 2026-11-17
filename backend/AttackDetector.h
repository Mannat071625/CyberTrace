
#pragma once
#include "LogParser.h"
#include <string>
#include <vector>
using namespace std;

struct DetectionAlert {
    string attackType;
    string sourceIP;
    string details;
};

class AttackDetector {
public:
    static vector<DetectionAlert> detectBruteForce(
        const vector<SecurityLog>& logs
    );

    static vector<DetectionAlert> detectPortScan(
        const vector<SecurityLog>& logs
    );
    static vector<DetectionAlert> detectSQLInjection(
    const vector<SecurityLog>& logs
);
static vector<DetectionAlert> detectXSS(
    const vector<SecurityLog>& logs
);
};
