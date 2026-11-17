
#include <iostream>
#include "LogParser.h"
#include "AttackDetector.h"
#include "RegexParser.h"
#include "NFAtoDFA.h"
#include "DFAMinimizer.h"
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

        for (const auto& alert : bruteForce) {
            cout << "\nAttack: " << alert.attackType;
            cout << "\nSource IP: " << alert.sourceIP;
            cout << "\nDetails: " << alert.details << "\n";
        }

        for (const auto& alert : portScan) {
            cout << "\nAttack: " << alert.attackType;
            cout << "\nSource IP: " << alert.sourceIP;
            cout << "\nDetails: " << alert.details << "\n";
        }

        for (const auto& alert : sqlInjection) {
    cout << "\nAttack: " << alert.attackType;
    cout << "\nSource IP: " << alert.sourceIP;
    cout << "\nDetails: " << alert.details << "\n";
}

for (const auto& alert : xss) {
    cout << "\nAttack: " << alert.attackType;
    cout << "\nSource IP: " << alert.sourceIP;
    cout << "\nDetails: " << alert.details << "\n";
}
    }
    catch (const exception& e) {
        cout << "Error: " << e.what() << "\n";
    }

    string pattern;

cout << "\n\nEnter Regular Expression to Visualize: ";
getline(cin >> ws, pattern);

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

    return 0;
}
