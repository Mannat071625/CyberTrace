#include <sstream>
#include "AttackDetector.h"
#include <map>
#include <algorithm>
#include <set>
#include <cctype>
#include <algorithm>
#include "RegexParser.h"
#include "NFAtoDFA.h"
#include "DFAMinimizer.h"
#include <cctype>



bool automataContains(const string& text, const string& pattern) {
    string normalizedText, normalizedPattern;

    for (unsigned char c : text) {
        if (!isspace(c))
            normalizedText += static_cast<char>(tolower(c));
    }

    for (unsigned char c : pattern) {
        if (!isspace(c))
            normalizedPattern += static_cast<char>(tolower(c));
    }

    if (normalizedPattern.empty())
        return false;

    RegexParser parser;
    NFA nfa = parser.buildNFA(normalizedPattern);
    DFA dfa = NFAtoDFA::convert(nfa);
    DFA minimized = DFAMinimizer::minimize(dfa);

    for (int i = 0; i + normalizedPattern.size() <= normalizedText.size(); i++) {
        string candidate = normalizedText.substr(i, normalizedPattern.size());

        if (minimized.accepts(candidate))
            return true;
    }

    return false;
}


int convertTime(const string& timestamp) {
    int hours = 0, minutes = 0, seconds = 0;
    char separator;

    stringstream stream(timestamp);
    stream >> hours >> separator >> minutes >> separator >> seconds;

    return hours * 3600 + minutes * 60 + seconds;
}

vector<DetectionAlert> AttackDetector::detectBruteForce(
    const vector<SecurityLog>& logs
) {
    map<string, vector<int>> failedAttempts;

    for (const auto& log : logs) {
        if (log.event == "LOGIN_FAILED")
            failedAttempts[log.sourceIP].push_back(convertTime(log.timestamp));
    }

    vector<DetectionAlert> alerts;

    for (auto& entry : failedAttempts) {
        auto& times = entry.second;
        sort(times.begin(), times.end());

        int left = 0;
        int maximumAttempts = 0;

        for (int right = 0; right < times.size(); right++) {
            while (times[right] - times[left] > 60)
                left++;

            maximumAttempts = max(maximumAttempts, right - left + 1);
        }

        if (maximumAttempts >= 4) {
            alerts.push_back({
                "Brute Force Attack",
                entry.first,
                to_string(maximumAttempts) +
                " failed login attempts within 60 seconds"
            });
        }
    }

    return alerts;
}


vector<DetectionAlert> AttackDetector::detectPortScan(
    const vector<SecurityLog>& logs
) {
    map<string, set<int>> accessedPorts;

    for (const auto& log : logs) {
        if (log.event == "CONNECTION" && log.destinationPort > 0)
            accessedPorts[log.sourceIP].insert(log.destinationPort);
    }

    vector<DetectionAlert> alerts;

    for (const auto& entry : accessedPorts) {
        if (entry.second.size() >= 3) {
            alerts.push_back({
                "Port Scanning",
                entry.first,
                to_string(entry.second.size()) +
                " different destination ports accessed"
            });
        }
    }

    return alerts;
}

vector<DetectionAlert> AttackDetector::detectSQLInjection(
    const vector<SecurityLog>& logs
) {
    vector<string> patterns = {
        "or 1=1",
        "union select",
        "drop table",
        "insert into",
        "delete from",
        "--",
        " or '1'='1"
    };

    vector<DetectionAlert> alerts;

    for (const auto& log : logs) {
        if (log.event != "HTTP_REQUEST")
            continue;

        for (const string& pattern : patterns) {
            if (automataContains(log.message, pattern)) {
                alerts.push_back({
                    "SQL Injection",
                    log.sourceIP,
                    "Automata matched suspicious SQL pattern: " + pattern
                });

                break;
            }
        }
    }

    return alerts;
}



vector<DetectionAlert> AttackDetector::detectXSS(
    const vector<SecurityLog>& logs
) {
    vector<string> patterns = {
        "<script",
        "javascript:",
        "onerror=",
        "onload=",
        "<iframe",
        "document.cookie"
    };

    vector<DetectionAlert> alerts;

    for (const auto& log : logs) {
        if (log.event != "HTTP_REQUEST")
            continue;

        for (const string& pattern : patterns) {
            if (automataContains(log.message, pattern)) {
                alerts.push_back({
                    "Cross-Site Scripting (XSS)",
                    log.sourceIP,
                    "Automata matched suspicious XSS pattern: " + pattern
                });

                break;
            }
        }
    }

    return alerts;
}


