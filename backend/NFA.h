
#pragma once
#include <iostream>
#include <map>
#include <set>
#include <string>
#include <vector>
using namespace std;

class NFA {
private:
    int startState;
    set<int> finalStates;
    map<pair<int, char>, set<int>> transitions;

    set<int> epsilonClosure(const set<int>& states);

public:
    NFA(int start);
void display() const;
    void addFinalState(int state);
    void addTransition(int from, char symbol, int to);
    void addEpsilonTransition(int from, int to);

    bool accepts(const string& input);
    int getStartState() const;
const set<int>& getFinalStates() const;
const map<pair<int, char>, set<int>>& getTransitions() const;
};
