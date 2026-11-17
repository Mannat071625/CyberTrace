
#include "crow.h"
#include "LogParser.h"
#include "AttackDetector.h"
#include "JSONSerializer.h"
#include <exception>

int main() {
    crow::SimpleApp app;

    CROW_ROUTE(app, "/")([]() {
        return "CyberTrace API is running!";
    });

    CROW_ROUTE(app, "/scan")([]() {
        try {
            vector<SecurityLog> logs =
                LogParser::parseFile("../datasets/sample-logs.csv");

            vector<DetectionAlert> alerts =
                AttackDetector::detectAll(logs);

            crow::response response(
                JSONSerializer::serializeAlerts(alerts)
            );

            response.set_header("Content-Type", "application/json");
            return response;
        }
        catch (const exception& e) {
            crow::response response(500, e.what());
            response.set_header("Content-Type", "text/plain");
            return response;
        }
    });

    app.port(18080).multithreaded().run();
}
