
#include "crow.h"
#include "crow/middlewares/cors.h"
#include "LogParser.h"
#include "AttackDetector.h"
#include "JSONSerializer.h"
#include <exception>
#include "NFA.h"
#include "DFA.h"
#include "RegexParser.h"
#include "NFAtoDFA.h"
#include "DFAMinimizer.h"
#include <set>
#include <map>
#include <string>
#include <vector>



crow::json::wvalue serializeNFA(const NFA& nfa) {
    crow::json::wvalue result;
    set<int> states;
    states.insert(nfa.getStartState());
    states.insert(nfa.getFinalStates().begin(), nfa.getFinalStates().end());

    crow::json::wvalue::list stateList;
    crow::json::wvalue::list finalList;
    crow::json::wvalue::list transitionList;

    for (const auto& entry : nfa.getTransitions()) {
        states.insert(entry.first.first);
        states.insert(entry.second.begin(), entry.second.end());

        for (int to : entry.second) {
            crow::json::wvalue transition;
            transition["from"] = entry.first.first;
            transition["symbol"] = entry.first.second == '\0'
                ? "epsilon"
                : string(1, entry.first.second);
            transition["to"] = to;
            transitionList.emplace_back(std::move(transition));
        }
    }

    for (int state : states)
        stateList.emplace_back(state);

    for (int state : nfa.getFinalStates())
        finalList.emplace_back(state);

    result["states"] = std::move(stateList);
    result["startState"] = nfa.getStartState();
    result["finalStates"] = std::move(finalList);
    result["transitions"] = std::move(transitionList);

    return result;
}

crow::json::wvalue serializeDFA(const DFA& dfa) {
    crow::json::wvalue result;
    set<int> states;
    states.insert(dfa.getStartState());
    states.insert(dfa.getFinalStates().begin(), dfa.getFinalStates().end());

    crow::json::wvalue::list stateList;
    crow::json::wvalue::list finalList;
    crow::json::wvalue::list transitionList;

    for (const auto& entry : dfa.getTransitions()) {
        states.insert(entry.first.first);
        states.insert(entry.second);

        crow::json::wvalue transition;
        transition["from"] = entry.first.first;
        transition["symbol"] = string(1, entry.first.second);
        transition["to"] = entry.second;
        transitionList.emplace_back(std::move(transition));
    }

    for (int state : states)
        stateList.emplace_back(state);

    for (int state : dfa.getFinalStates())
        finalList.emplace_back(state);

    result["states"] = std::move(stateList);
    result["startState"] = dfa.getStartState();
    result["finalStates"] = std::move(finalList);
    result["transitions"] = std::move(transitionList);

    return result;
}


int main() {
    crow::App<crow::CORSHandler> app;

    auto& cors = app.get_middleware<crow::CORSHandler>();

    cors.global()
        .origin("*")
        .methods("GET"_method, "POST"_method, "OPTIONS"_method)
        .headers("Content-Type", "Accept")
        .max_age(86400);


CROW_ROUTE(app, "/automata").methods("POST"_method)([](const crow::request& req) {
    try {
        auto body = crow::json::load(req.body);

        if (!body || !body.has("regex"))
            return crow::response(400, "Missing regex field");

        if (body["regex"].t() != crow::json::type::String)
            return crow::response(400, "Regex must be a string");

        string pattern = body["regex"].s();

        if (pattern.empty())
            return crow::response(400, "Regex cannot be empty");

        if (pattern.size() > 200)
            return crow::response(400, "Regex exceeds 200 characters");

        bool hasTestString = body.has("testString");
        string testString;

        if (hasTestString) {
            if (body["testString"].t() != crow::json::type::String)
                return crow::response(400, "Test string must be a string");

            testString = body["testString"].s();

            if (testString.size() > 1000)
                return crow::response(400, "Test string exceeds 1000 characters");
        }

        RegexParser parser;
        NFA nfa = parser.buildNFA(pattern);
        DFA dfa = NFAtoDFA::convert(nfa);
        DFA minimized = DFAMinimizer::minimize(dfa);

        crow::json::wvalue result;
        result["regex"] = pattern;
        result["nfa"] = serializeNFA(nfa);
        result["dfa"] = serializeDFA(dfa);
        result["minimizedDFA"] = serializeDFA(minimized);

        if (hasTestString) {
            vector<int> trace = minimized.getTrace(testString);
            bool accepted = minimized.accepts(testString);

            crow::json::wvalue::list traceList;

            for (int state : trace)
                traceList.emplace_back(state);

            result["testString"] = testString;
            result["accepted"] = accepted;
            result["result"] = accepted ? "Accepted" : "Rejected";
            result["trace"] = std::move(traceList);
        }

        return crow::response(200, result);
    }
    catch (const exception& e) {
        return crow::response(400, string("Regex Error: ") + e.what());
    }
});
      

    CROW_ROUTE(app, "/")([]() {
        return "CyberTrace API is running!";
    });

    CROW_ROUTE(app, "/health")([]() {
    crow::json::wvalue result;
    result["status"] = "healthy";
    result["service"] = "CyberTrace API";
    result["message"] = "Backend is running successfully";
    return result;
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

    
CROW_ROUTE(app, "/upload").methods("POST"_method)([](const crow::request& req) {
    try {
        if (req.body.empty())
            return crow::response(400, "No CSV data received");

        if (req.body.size() > 5 * 1024 * 1024)
            return crow::response(413, "CSV file exceeds the 5 MB limit");

        vector<SecurityLog> logs = LogParser::parseContent(req.body);

        if (logs.empty())
            return crow::response(400, "CSV contains no log records");

        vector<DetectionAlert> alerts =
            AttackDetector::detectAll(logs);

        crow::response response(
            JSONSerializer::serializeAlerts(alerts)
        );

        response.set_header("Content-Type", "application/json");
        return response;
    }
    catch (const exception& e) {
        return crow::response(400, string("CSV Error: ") + e.what());
    }
});


    app.port(18080).multithreaded().run();
}
