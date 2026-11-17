
#pragma once
#include "NFA.h"
#include <string>
#include <vector>

class RegexParser {
private:
    struct Fragment {
        int start;
        int end;
    };

    struct Edge {
        int from;
        int to;
        char symbol;
        bool epsilon;
    };

    string regex;
    int position;
    int nextState;
    vector<Edge> edges;

    int newState();
    void addEdge(int from, int to, char symbol, bool epsilon);

    Fragment parseExpression();
    Fragment parseConcatenation();
    Fragment parseRepetition();
    Fragment parseAtom();

    void skipWhitespace();

public:
    NFA buildNFA(const string& pattern);
};
