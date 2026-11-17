
#pragma once
#include "AttackDetector.h"
#include <string>
#include <vector>
using namespace std;

class JSONSerializer {
public:
    static string serializeAlerts(const vector<DetectionAlert>& alerts);
};
