
const AutomataEngine = (() => {
    const EPSILON = "ε";

    const precedence = {
        "|": 1,
        "·": 2
    };

    // ==============================
    // REGEX TOKENIZATION
    // ==============================

    function tokenize(pattern) {
        const tokens = [];

        for (let i = 0; i < pattern.length; i++) {
            const char = pattern[i];

            if (char === "\\") {
                i++;

                if (i >= pattern.length) {
                    throw new Error("Pattern ends with an incomplete escape.");
                }

                tokens.push({
                    type: "CHAR",
                    value: pattern[i]
                });

                continue;
            }

            if (
                char === "(" ||
                char === ")" ||
                char === "|" ||
                char === "*" ||
                char === "+" ||
                char === "?"
            ) {
                tokens.push({
                    type: "OP",
                    value: char
                });

                continue;
            }

            if (char === "[") {
                throw new Error(
                    "Character classes are not supported yet."
                );
            }

            if (char === ".") {
                throw new Error(
                    "Wildcard '.' is not supported yet."
                );
            }

            tokens.push({
                type: "CHAR",
                value: char
            });
        }

        return tokens;
    }

    // ==============================
    // CONCATENATION INSERTION
    // ==============================

    function canEndExpression(token) {
        return (
            token.type === "CHAR" ||
            token.value === ")" ||
            token.value === "*" ||
            token.value === "+" ||
            token.value === "?"
        );
    }

    function canStartExpression(token) {
        return (
            token.type === "CHAR" ||
            token.value === "("
        );
    }

    function insertConcatenation(tokens) {
        const result = [];

        for (let i = 0; i < tokens.length; i++) {
            const current = tokens[i];
            const previous = result[result.length - 1];

            if (
                previous &&
                canEndExpression(previous) &&
                canStartExpression(current)
            ) {
                result.push({
                    type: "OP",
                    value: "·"
                });
            }

            result.push(current);
        }

        return result;
    }

    // ==============================
    // INFIX TO POSTFIX
    // ==============================

    function toPostfix(pattern) {
        const tokens = insertConcatenation(tokenize(pattern));
        const output = [];
        const operators = [];

        for (const token of tokens) {
            if (token.type === "CHAR") {
                output.push(token);
                continue;
            }

            const op = token.value;

            if (op === "(") {
                operators.push(token);
                continue;
            }

            if (op === ")") {
                let foundOpening = false;

                while (operators.length > 0) {
                    const top = operators.pop();

                    if (top.value === "(") {
                        foundOpening = true;
                        break;
                    }

                    output.push(top);
                }

                if (!foundOpening) {
                    throw new Error("Unmatched closing parenthesis.");
                }

                continue;
            }

            if (op === "*" || op === "+" || op === "?") {
                output.push(token);
                continue;
            }

            while (
                operators.length > 0 &&
                operators[operators.length - 1].value !== "(" &&
                precedence[operators[operators.length - 1].value] >= precedence[op]
            ) {
                output.push(operators.pop());
            }

            operators.push(token);
        }

        while (operators.length > 0) {
            const op = operators.pop();

            if (op.value === "(") {
                throw new Error("Unmatched opening parenthesis.");
            }

            output.push(op);
        }

        return output;
    }

    // ==============================
    // THOMPSON NFA CONSTRUCTION
    // ==============================

    function buildNFA(pattern) {
        const postfix = toPostfix(pattern);
        const states = [];
        const stack = [];
        let nextId = 0;

        function createState() {
            const state = {
                id: nextId++,
                transitions: []
            };

            states.push(state);
            return state;
        }

        function addTransition(from, symbol, to) {
            from.transitions.push({
                symbol: symbol,
                to: to.id
            });
        }

        function createFragment(start, end) {
            return {
                start: start,
                end: end
            };
        }

        function pushSymbol(symbol) {
            const start = createState();
            const end = createState();

            addTransition(start, symbol, end);

            stack.push(createFragment(start, end));
        }

        function concatenate() {
            const right = stack.pop();
            const left = stack.pop();

            if (!left || !right) {
                throw new Error("Invalid concatenation expression.");
            }

            addTransition(left.end, EPSILON, right.start);

            stack.push(
                createFragment(left.start, right.end)
            );
        }

        function union() {
            const right = stack.pop();
            const left = stack.pop();

            if (!left || !right) {
                throw new Error("Invalid union expression.");
            }

            const start = createState();
            const end = createState();

            addTransition(start, EPSILON, left.start);
            addTransition(start, EPSILON, right.start);

            addTransition(left.end, EPSILON, end);
            addTransition(right.end, EPSILON, end);

            stack.push(createFragment(start, end));
        }

        function kleeneStar() {
            const fragment = stack.pop();

            if (!fragment) {
                throw new Error("Invalid Kleene star expression.");
            }

            const start = createState();
            const end = createState();

            addTransition(start, EPSILON, fragment.start);
            addTransition(start, EPSILON, end);

            addTransition(fragment.end, EPSILON, fragment.start);
            addTransition(fragment.end, EPSILON, end);

            stack.push(createFragment(start, end));
        }

        function oneOrMore() {
            const fragment = stack.pop();

            if (!fragment) {
                throw new Error("Invalid one-or-more expression.");
            }

            const start = createState();
            const end = createState();

            addTransition(start, EPSILON, fragment.start);

            addTransition(fragment.end, EPSILON, fragment.start);
            addTransition(fragment.end, EPSILON, end);

            stack.push(createFragment(start, end));
        }

        function optional() {
            const fragment = stack.pop();

            if (!fragment) {
                throw new Error("Invalid optional expression.");
            }

            const start = createState();
            const end = createState();

            addTransition(start, EPSILON, fragment.start);
            addTransition(start, EPSILON, end);

            addTransition(fragment.end, EPSILON, end);

            stack.push(createFragment(start, end));
        }

        if (postfix.length === 0) {
            pushSymbol(EPSILON);
        } else {
            for (const token of postfix) {
                if (token.type === "CHAR") {
                    pushSymbol(token.value);
                    continue;
                }

                switch (token.value) {
                    case "·":
                        concatenate();
                        break;

                    case "|":
                        union();
                        break;

                    case "*":
                        kleeneStar();
                        break;

                    case "+":
                        oneOrMore();
                        break;

                    case "?":
                        optional();
                        break;

                    default:
                        throw new Error(
                            "Unknown operator: " + token.value
                        );
                }
            }
        }

        if (stack.length !== 1) {
            throw new Error("Invalid regular expression structure.");
        }

        const fragment = stack.pop();

        return {
            states: states,
            startState: fragment.start.id,
            acceptState: fragment.end.id,
            alphabet: [
                ...new Set(
                    states.flatMap(state =>
                        state.transitions
                            .map(transition => transition.symbol)
                            .filter(symbol => symbol !== EPSILON)
                    )
                )
            ],
            postfix: postfix.map(token => token.value).join(" "),
            stateCount: states.length,
            transitionCount: states.reduce(
                (total, state) => total + state.transitions.length,
                0
            )
        };
    }

    // ==============================
    // EPSILON CLOSURE
    // ==============================

    function epsilonClosure(stateIds, nfa) {
        const stateMap = new Map(
            nfa.states.map(state => [state.id, state])
        );

        const visited = new Set(stateIds);
        const stack = [...stateIds];

        while (stack.length > 0) {
            const currentId = stack.pop();
            const currentState = stateMap.get(currentId);

            if (!currentState) {
                continue;
            }

            for (const transition of currentState.transitions) {
                if (transition.symbol === EPSILON) {
                    if (!visited.has(transition.to)) {
                        visited.add(transition.to);
                        stack.push(transition.to);
                    }
                }
            }
        }

        return [...visited].sort((a, b) => a - b);
    }

    // ==============================
    // MOVE FUNCTION
    // ==============================

    function move(stateIds, symbol, nfa) {
        const stateMap = new Map(
            nfa.states.map(state => [state.id, state])
        );

        const reachable = new Set();

        for (const stateId of stateIds) {
            const state = stateMap.get(stateId);

            if (!state) {
                continue;
            }

            for (const transition of state.transitions) {
                if (
                    transition.symbol === symbol &&
                    transition.symbol !== EPSILON
                ) {
                    reachable.add(transition.to);
                }
            }
        }

        return [...reachable].sort((a, b) => a - b);
    }

    // ==============================
    // SUBSET CONSTRUCTION: NFA -> DFA
    // ==============================

    function convertNFAtoDFA(nfa) {
        const alphabet = [...nfa.alphabet];
        const dfaStates = [];
        const dfaTransitions = [];
        const stateLookup = new Map();
        const queue = [];

        function subsetKey(subset) {
            return [...subset]
                .sort((a, b) => a - b)
                .join(",");
        }

        function getOrCreateState(subset) {
            const sortedSubset = [...subset].sort((a, b) => a - b);
            const key = subsetKey(sortedSubset);

            if (stateLookup.has(key)) {
                return stateLookup.get(key);
            }

            const stateId = dfaStates.length;

            const newState = {
                id: stateId,
                name: `D${stateId}`,
                subset: sortedSubset,
                isAccepting: sortedSubset.includes(nfa.acceptState),
                transitions: []
            };

            dfaStates.push(newState);
            stateLookup.set(key, stateId);
            queue.push(stateId);

            return stateId;
        }

        const startSubset = epsilonClosure(
            [nfa.startState],
            nfa
        );

        const dfaStartState = getOrCreateState(startSubset);

        while (queue.length > 0) {
            const currentDfaId = queue.shift();
            const currentDfaState = dfaStates[currentDfaId];

            for (const symbol of alphabet) {
                const movedStates = move(
                    currentDfaState.subset,
                    symbol,
                    nfa
                );

                const nextSubset = epsilonClosure(
                    movedStates,
                    nfa
                );

                const nextDfaId = getOrCreateState(nextSubset);

                const transition = {
                    from: currentDfaId,
                    symbol: symbol,
                    to: nextDfaId
                };

                currentDfaState.transitions.push(transition);
                dfaTransitions.push(transition);
            }
        }

        const acceptingStates = dfaStates
            .filter(state => state.isAccepting)
            .map(state => state.id);

        return {
            states: dfaStates,
            transitions: dfaTransitions,
            alphabet: alphabet,
            startState: dfaStartState,
            acceptingStates: acceptingStates,
            stateCount: dfaStates.length,
            transitionCount: dfaTransitions.length
        };
    }

    // ==============================
    // PUBLIC API
    // ==============================

    function convertRegexToNFA(pattern) {
        return buildNFA(pattern);
    }

    function convertRegexToDFA(pattern) {
        const nfa = buildNFA(pattern);
        const dfa = convertNFAtoDFA(nfa);

        return {
            nfa: nfa,
            dfa: dfa
        };
    }

    return {
        EPSILON,
        tokenize,
        toPostfix,
        buildNFA,
        convertRegexToNFA,
        epsilonClosure,
        move,
        convertNFAtoDFA,
        convertRegexToDFA
    };
})();

window.AutomataEngine = AutomataEngine;
