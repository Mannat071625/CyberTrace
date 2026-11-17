
#include "NFAtoDFA.h"
#include <queue>
#include <map>
#include <set>

DFA NFAtoDFA::convert(const NFA& nfa) {
    const auto& transitions = nfa.getTransitions();
    const auto& finalStates = nfa.getFinalStates();

    set<char> alphabet;

    for (const auto& entry : transitions) {
        if (entry.first.second != '\0')
            alphabet.insert(entry.first.second);
    }

    auto epsilonClosure = [&](set<int> states) {
        vector<int> stack(states.begin(), states.end());

        while (!stack.empty()) {
            int current = stack.back();
            stack.pop_back();

            auto it = transitions.find({current, '\0'});

            if (it != transitions.end()) {
                for (int next : it->second) {
                    if (states.insert(next).second)
                        stack.push_back(next);
                }
            }
        }

        return states;
    };

    set<int> initial = epsilonClosure({nfa.getStartState()});

    map<set<int>, int> stateMap;
    queue<set<int>> pending;

    stateMap[initial] = 0;
    pending.push(initial);

    DFA dfa(0);
    int nextState = 1;

    while (!pending.empty()) {
        set<int> current = pending.front();
        pending.pop();

        int currentId = stateMap[current];

        for (int state : current) {
            if (finalStates.count(state)) {
                dfa.addFinalState(currentId);
                break;
            }
        }

        for (char symbol : alphabet) {
            set<int> next;

            for (int state : current) {
                auto it = transitions.find({state, symbol});

                if (it != transitions.end()) {
                    next.insert(it->second.begin(), it->second.end());
                }
            }

            if (next.empty())
                continue;

            next = epsilonClosure(next);

            if (!stateMap.count(next)) {
                stateMap[next] = nextState++;
                pending.push(next);
            }

            dfa.addTransition(currentId, symbol, stateMap[next]);
        }
    }

    return dfa;
}
