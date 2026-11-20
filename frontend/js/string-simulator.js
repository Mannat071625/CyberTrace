const StringSimulator = (() => {

    function getTransitions(automaton) {
        if (Array.isArray(automaton.transitions)) {
            return automaton.transitions;
        }

        return automaton.states.flatMap(state =>
            (state.transitions || []).map(transition => ({
                from: state.id,
                symbol: transition.symbol,
                to: transition.to
            }))
        );
    }

    function simulate(automaton, input) {
        const transitions = getTransitions(automaton);
        const acceptingStates = new Set(automaton.acceptingStates);
        const trace = [];

        let currentState = automaton.startState;

        trace.push({
            state: currentState,
            input: "Start",
            nextState: currentState
        });

        for (const symbol of input) {
            const transition = transitions.find(item =>
                item.from === currentState &&
                item.symbol === symbol
            );

            if (!transition) {
                trace.push({
                    state: currentState,
                    input: symbol,
                    nextState: null
                });

                return {
                    accepted: false,
                    finalState: currentState,
                    trace: trace
                };
            }

            trace.push({
                state: currentState,
                input: symbol,
                nextState: transition.to
            });

            currentState = transition.to;
        }

        return {
            accepted: acceptingStates.has(currentState),
            finalState: currentState,
            trace: trace
        };
    }

    return {
        simulate
    };

})();

window.StringSimulator = StringSimulator;