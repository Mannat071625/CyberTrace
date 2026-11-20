
const DFAMinimizer = (() => {
    function minimizeDFA(dfa) {
        if (!dfa || !dfa.states || dfa.states.length === 0) {
            throw new Error("Invalid DFA supplied for minimization.");
        }

        const alphabet = [...dfa.alphabet];
        const stateMap = new Map(
            dfa.states.map(state => [state.id, state])
        );

        const transitionMap = new Map();

        dfa.transitions.forEach(transition => {
            transitionMap.set(
                `${transition.from}|${transition.symbol}`,
                transition.to
            );
        });

        function getDestination(stateId, symbol) {
            const key = `${stateId}|${symbol}`;

            if (!transitionMap.has(key)) {
                throw new Error(
                    `Missing DFA transition from state ${stateId} on ${symbol}.`
                );
            }

            return transitionMap.get(key);
        }

        // Initial partition:
        // Accepting states and non-accepting states

        const accepting = dfa.states
            .filter(state => state.isAccepting)
            .map(state => state.id);

        const nonAccepting = dfa.states
            .filter(state => !state.isAccepting)
            .map(state => state.id);

        let partitions = [];

        if (nonAccepting.length > 0) {
            partitions.push(nonAccepting);
        }

        if (accepting.length > 0) {
            partitions.push(accepting);
        }

        // ==============================
        // PARTITION REFINEMENT
        // ==============================

        let changed = true;

        while (changed) {
            changed = false;

            const partitionIndex = new Map();

            partitions.forEach((partition, index) => {
                partition.forEach(stateId => {
                    partitionIndex.set(stateId, index);
                });
            });

            const refinedPartitions = [];

            for (const partition of partitions) {
                const groups = new Map();

                for (const stateId of partition) {
                    const signature = alphabet.map(symbol => {
                        const destination = getDestination(
                            stateId,
                            symbol
                        );

                        return partitionIndex.get(destination);
                    }).join(",");

                    if (!groups.has(signature)) {
                        groups.set(signature, []);
                    }

                    groups.get(signature).push(stateId);
                }

                if (groups.size > 1) {
                    changed = true;
                }

                refinedPartitions.push(...groups.values());
            }

            partitions = refinedPartitions;
        }

        // ==============================
        // BUILD MINIMIZED DFA
        // ==============================

        const originalToMinimized = new Map();

        partitions.forEach((partition, index) => {
            partition.forEach(stateId => {
                originalToMinimized.set(stateId, index);
            });
        });

        const minimizedStates = partitions.map(
            (partition, index) => {
                const originalStates = partition.map(
                    stateId => stateMap.get(stateId)
                );

                return {
                    id: index,
                    name: `M${index}`,
                    subset: [...partition].sort((a, b) => a - b),
                    originalStateNames: originalStates.map(
                        state => state.name || `D${state.id}`
                    ),
                    isAccepting: originalStates.some(
                        state => state.isAccepting
                    ),
                    transitions: []
                };
            }
        );

        const minimizedTransitions = [];

        partitions.forEach((partition, index) => {
            const representative = partition[0];

            for (const symbol of alphabet) {
                const originalDestination = getDestination(
                    representative,
                    symbol
                );

                const minimizedDestination =
                    originalToMinimized.get(originalDestination);

                const transition = {
                    from: index,
                    symbol: symbol,
                    to: minimizedDestination
                };

                minimizedStates[index].transitions.push(transition);
                minimizedTransitions.push(transition);
            }
        });

        const minimizedStartState =
            originalToMinimized.get(dfa.startState);

        const minimizedAcceptingStates =
            minimizedStates
                .filter(state => state.isAccepting)
                .map(state => state.id);

        return {
            states: minimizedStates,
            transitions: minimizedTransitions,
            alphabet: alphabet,
            startState: minimizedStartState,
            acceptingStates: minimizedAcceptingStates,
            stateCount: minimizedStates.length,
            transitionCount: minimizedTransitions.length,
            partitions: partitions.map(partition =>
                [...partition].sort((a, b) => a - b)
            )
        };
    }

    return {
        minimizeDFA
    };
})();

window.DFAMinimizer = DFAMinimizer;
