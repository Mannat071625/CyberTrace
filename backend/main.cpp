
#include <iostream>
#include "LogParser.h"
#include "AttackDetector.h"
#include "RegexParser.h"
#include "NFAtoDFA.h"
#include "DFAMinimizer.h"
#include "JSONSerializer.h"
using namespace std;

int main() {
    try {
        vector<SecurityLog> logs =
            LogParser::parseFile("../datasets/sample-logs.csv");

        cout << "Total Logs Loaded: " << logs.size() << "\n";

        vector<DetectionAlert> bruteForce =
            AttackDetector::detectBruteForce(logs);

        vector<DetectionAlert> portScan =
            AttackDetector::detectPortScan(logs);

        vector<DetectionAlert> sqlInjection =
            AttackDetector::detectSQLInjection(logs);

        vector<DetectionAlert> xss =
            AttackDetector::detectXSS(logs);

        cout << "\n===== SECURITY SCAN RESULTS =====\n";

        auto printAlerts = [](const vector<DetectionAlert>& alerts) {
            for (const auto& alert : alerts) {
                cout << "\nAttack: " << alert.attackType;
                cout << "\nSource IP: " << alert.sourceIP;
                cout << "\nDetails: " << alert.details << "\n";
            }
        };

        printAlerts(bruteForce);
        printAlerts(portScan);
        printAlerts(sqlInjection);
        printAlerts(xss);

        vector<DetectionAlert> allAlerts =
            AttackDetector::detectAll(logs);
            cout << "\n========== JSON OUTPUT ==========\n";
cout << JSONSerializer::serializeAlerts(allAlerts) << "\n";

        cout << "\n===== ALL DETECTED ATTACKS =====\n";
        printAlerts(allAlerts);
        cout << "\nTotal Alerts: " << allAlerts.size() << "\n";
    }
    catch (const exception& e) {
        cout << "Error: " << e.what() << "\n";
    }

    string pattern;

    cout << "\n\nEnter Regular Expression to Visualize: ";
    getline(cin >> ws, pattern);

    try {
        RegexParser parser;
        NFA nfa = parser.buildNFA(pattern);
        DFA dfa = NFAtoDFA::convert(nfa);
        DFA minimizedDFA = DFAMinimizer::minimize(dfa);

        cout << "\n========== NFA STRUCTURE ==========\n";
        nfa.display();

        cout << "\n========== DFA STRUCTURE ==========\n";
        dfa.display();

        cout << "\n====== MINIMIZED DFA STRUCTURE ======\n";
        minimizedDFA.display();
    }
    catch (const exception& e) {
        cout << "Regex Error: " << e.what() << "\n";
    }

    return 0;
}
