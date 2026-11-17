
#include "DFAMinimizer.h"
#include <algorithm>

DFA DFAMinimizer::minimize(const DFA& dfa) {
    const auto& transitions = dfa.getTransitions();
    const auto& finalStates = dfa.getFinalStates();

    set<int> states;
    set<char> alphabet;

    states.insert(dfa.getStartState());

    for (const auto& entry : transitions) {
        states.insert(entry.first.first);
        states.insert(entry.second);
        alphabet.insert(entry.first.second);
    }

    vector<set<int>> partitions;
    set<int> accepting, nonAccepting;

    for (int state : states) {
        if (finalStates.count(state))
            accepting.insert(state);
        else
            nonAccepting.insert(state);
    }

    if (!accepting.empty())
        partitions.push_back(accepting);

    if (!nonAccepting.empty())
        partitions.push_back(nonAccepting);

    bool changed = true;

    while (changed) {
        changed = false;
        vector<set<int>> refined;

        for (const auto& group : partitions) {
            map<vector<int>, set<int>> groups;

            for (int state : group) {
                vector<int> signature;

                for (char symbol : alphabet) {
                    auto it = transitions.find({state, symbol});
                    int destination = -1;

                    if (it != transitions.end()) {
                        for (int i = 0; i < partitions.size(); i++) {
                            if (partitions[i].count(it->second)) {
                                destination = i;
                                break;
                            }
                        }
                    }

                    signature.push_back(destination);
                }

                groups[signature].insert(state);
            }

            for (const auto& entry : groups)
                refined.push_back(entry.second);

            if (groups.size() > 1)
                changed = true;
        }

        partitions = refined;
    }

    map<int, int> stateMap;

    for (int i = 0; i < partitions.size(); i++) {
        for (int state : partitions[i])
            stateMap[state] = i;
    }

    DFA minimized(stateMap[dfa.getStartState()]);

    for (int i = 0; i < partitions.size(); i++) {
        for (int state : partitions[i]) {
            if (finalStates.count(state)) {
                minimized.addFinalState(i);
                break;
            }
        }
    }

    for (const auto& entry : transitions) {
        int from = stateMap[entry.first.first];
        int to = stateMap[entry.second];
        char symbol = entry.first.second;

        minimized.addTransition(from, symbol, to);
    }

    return minimized;
}
