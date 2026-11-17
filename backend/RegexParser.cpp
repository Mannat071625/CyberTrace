
#include "RegexParser.h"
#include <stdexcept>
#include <cctype>

int RegexParser::newState() {
    return nextState++;
}

void RegexParser::addEdge(int from, int to, char symbol, bool epsilon) {
    edges.push_back({from, to, symbol, epsilon});
}

void RegexParser::skipWhitespace() {
    while (position < regex.size() &&
           isspace(static_cast<unsigned char>(regex[position])))
        position++;
}

RegexParser::Fragment RegexParser::parseAtom() {
    skipWhitespace();

    if (position >= regex.size())
        throw runtime_error("Unexpected end of expression");

    if (regex[position] == '(') {
        position++;
        Fragment fragment = parseExpression();
        skipWhitespace();

        if (position >= regex.size() || regex[position] != ')')
            throw runtime_error("Missing closing parenthesis");

        position++;
        return fragment;
    }

    char symbol = regex[position];

    if (symbol == ')' || symbol == '|' ||
        symbol == '*' || symbol == '+' || symbol == '?')
        throw runtime_error("Invalid regular expression");

    position++;

    int start = newState();
    int end = newState();

    addEdge(start, end, symbol, false);

    return {start, end};
}

RegexParser::Fragment RegexParser::parseRepetition() {
    Fragment fragment = parseAtom();

    while (true) {
        skipWhitespace();

        if (position >= regex.size())
            break;

        char op = regex[position];

        if (op != '*' && op != '+' && op != '?')
            break;

        position++;

        int start = newState();
        int end = newState();

        addEdge(start, fragment.start, '\0', true);
        addEdge(fragment.end, end, '\0', true);

        if (op == '*') {
            addEdge(start, end, '\0', true);
            addEdge(fragment.end, fragment.start, '\0', true);
        }
        else if (op == '+') {
            addEdge(fragment.end, fragment.start, '\0', true);
        }
        else {
            addEdge(start, end, '\0', true);
        }

        fragment = {start, end};
    }

    return fragment;
}

RegexParser::Fragment RegexParser::parseConcatenation() {
    Fragment result = parseRepetition();

    while (true) {
        skipWhitespace();

        if (position >= regex.size() ||
            regex[position] == ')' || regex[position] == '|')
            break;

        Fragment next = parseRepetition();

        addEdge(result.end, next.start, '\0', true);
        result.end = next.end;
    }

    return result;
}

RegexParser::Fragment RegexParser::parseExpression() {
    Fragment left = parseConcatenation();

    while (true) {
        skipWhitespace();

        if (position >= regex.size() || regex[position] != '|')
            break;

        position++;

        Fragment right = parseConcatenation();

        int start = newState();
        int end = newState();

        addEdge(start, left.start, '\0', true);
        addEdge(start, right.start, '\0', true);
        addEdge(left.end, end, '\0', true);
        addEdge(right.end, end, '\0', true);

        left = {start, end};
    }

    return left;
}

NFA RegexParser::buildNFA(const string& pattern) {
    regex = pattern;
    position = 0;
    nextState = 0;
    edges.clear();

    if (regex.empty())
        throw runtime_error("Empty regular expression");

    Fragment fragment = parseExpression();

    skipWhitespace();

    if (position != regex.size())
        throw runtime_error("Invalid regular expression");

    NFA nfa(fragment.start);

    for (const Edge& edge : edges) {
        if (edge.epsilon)
            nfa.addEpsilonTransition(edge.from, edge.to);
        else
            nfa.addTransition(edge.from, edge.symbol, edge.to);
    }

    nfa.addFinalState(fragment.end);

    return nfa;
}
