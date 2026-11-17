
#include "NFA.h"

NFA::NFA(int start) {
    startState = start;
}

void NFA::addFinalState(int state) {
    finalStates.insert(state);
}

void NFA::addTransition(int from, char symbol, int to) {
    transitions[{from, symbol}].insert(to);
}

void NFA::addEpsilonTransition(int from, int to) {
    transitions[{from, '\0'}].insert(to);
}

set<int> NFA::epsilonClosure(const set<int>& states) {
    set<int> closure = states;
    vector<int> stack(states.begin(), states.end());

    while (!stack.empty()) {
        int current = stack.back();
        stack.pop_back();

        auto it = transitions.find({current, '\0'});

        if (it != transitions.end()) {
            for (int next : it->second) {
                if (closure.insert(next).second)
                    stack.push_back(next);
            }
        }
    }

    return closure;
}

bool NFA::accepts(const string& input) {
    set<int> currentStates = epsilonClosure({startState});

    for (char symbol : input) {
        set<int> nextStates;

        for (int state : currentStates) {
            auto it = transitions.find({state, symbol});

            if (it != transitions.end()) {
                for (int next : it->second)
                    nextStates.insert(next);
            }
        }

        currentStates = epsilonClosure(nextStates);
    }

    for (int state : currentStates) {
        if (finalStates.count(state))
            return true;
    }

    return false;
}
int NFA::getStartState() const {
    return startState;
}

const set<int>& NFA::getFinalStates() const {
    return finalStates;
}

const map<pair<int, char>, set<int>>& NFA::getTransitions() const {
    return transitions;
}

void NFA::display() const {
    set<int> states;
    states.insert(startState);
    states.insert(finalStates.begin(), finalStates.end());

    for (const auto& entry : transitions) {
        states.insert(entry.first.first);
        states.insert(entry.second.begin(), entry.second.end());
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
        for (int next : entry.second) {
            cout << "q" << entry.first.first << " --";

            if (entry.first.second == '\0')
                cout << "epsilon";
            else
                cout << entry.first.second;

            cout << "--> q" << next << "\n";
        }
    }
}

