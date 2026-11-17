
#pragma once
#include <iostream>
#include <map>
#include <set>
#include <string>
#include <vector>
using namespace std;

class DFA {
private:
    int startState;
    set<int> finalStates;
    map<pair<int, char>, int> transitions;

public:
    DFA(int start);

    void addFinalState(int state);
    void addTransition(int from, char symbol, int to);
    bool accepts(const string& input);
    vector<int> getTrace(const string& input);

    int getStartState() const;
    const set<int>& getFinalStates() const;
    const map<pair<int, char>, int>& getTransitions() const;

    void display() const;
};
