
#include "DFA.h"

DFA::DFA(int start) {
    startState = start;
}

void DFA::addFinalState(int state) {
    finalStates.insert(state);
}

void DFA::addTransition(int from, char symbol, int to) {
    transitions[{from, symbol}] = to;
}

bool DFA::accepts(const string& input) {
    int current = startState;

    for (char symbol : input) {
        auto it = transitions.find({current, symbol});

        if (it == transitions.end())
            return false;

        current = it->second;
    }

    return finalStates.count(current) > 0;
}


vector<int> DFA::getTrace(const string& input) {
    vector<int> trace;
    int current = startState;

    trace.push_back(current);

    for (char symbol : input) {
        auto it = transitions.find({current, symbol});

        if (it == transitions.end())
            break;

        current = it->second;
        trace.push_back(current);
    }

    return trace;
}



int DFA::getStartState() const {
    return startState;
}

const set<int>& DFA::getFinalStates() const {
    return finalStates;
}

const map<pair<int, char>, int>& DFA::getTransitions() const {
    return transitions;
}

void DFA::display() const {
    set<int> states;
    states.insert(startState);
    states.insert(finalStates.begin(), finalStates.end());

    for (const auto& entry : transitions) {
        states.insert(entry.first.first);
        states.insert(entry.second);
    }

    cout << "\nStates: ";
    for (int state : states) {
        cout << "q" << state << " ";
    }

    cout << "\nStart State: q" << startState;
    cout << "\nFinal States: ";

    for (int state : finalStates)
        cout << "q" << state << " ";

    cout << "\n\nTransitions:\n";

    for (const auto& entry : transitions) {
        cout << "q" << entry.first.first
             << " --" << entry.first.second
             << "--> q" << entry.second << "\n";
    }
}


