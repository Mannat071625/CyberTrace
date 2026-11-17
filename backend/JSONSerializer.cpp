
#include "JSONSerializer.h"

string escapeJSON(const string& value) {
    string result;

    for (char c : value) {
        switch (c) {
            case '"': result += "\\\""; break;
            case '\\': result += "\\\\"; break;
            case '\b': result += "\\b"; break;
            case '\f': result += "\\f"; break;
            case '\n': result += "\\n"; break;
            case '\r': result += "\\r"; break;
            case '\t': result += "\\t"; break;
            default:
                if (static_cast<unsigned char>(c) < 0x20)
                    result += ' ';
                else
                    result += c;
        }
    }

    return result;
}

string JSONSerializer::serializeAlerts(const vector<DetectionAlert>& alerts) {
    string json = "{\"totalAlerts\":";
    json += to_string(alerts.size());
    json += ",\"alerts\":[";

    for (size_t i = 0; i < alerts.size(); i++) {
        const auto& alert = alerts[i];

        if (i > 0)
            json += ",";

        json += "{\"attackType\":\"" + escapeJSON(alert.attackType) + "\",";
        json += "\"sourceIP\":\"" + escapeJSON(alert.sourceIP) + "\",";
        json += "\"details\":\"" + escapeJSON(alert.details) + "\"}";
    }

    json += "]}";
    return json;
}
