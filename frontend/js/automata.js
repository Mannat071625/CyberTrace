
document.addEventListener("DOMContentLoaded", () => {
    const regexInput = document.getElementById("regexInput");
    const generateButton = document.getElementById("generateAutomataBtn");
    const regexValue = document.getElementById("regexValue");
    const regexDescription = document.getElementById("regexDescription");
    const status = document.getElementById("automataStatus");

    const tabs = document.querySelectorAll(".automata-tab");
    const canvas = document.getElementById("automataCanvas");

    const stateCount = document.getElementById("stateCount");
    const acceptingCount = document.getElementById("acceptingCount");
    const transitionCount = document.getElementById("transitionCount");
    const alphabetValue = document.getElementById("alphabetValue");

    const transitionTableBody = document.getElementById("transitionTableBody");
    const explanationTitle = document.getElementById("explanationTitle");
    const explanationText = document.getElementById("explanationText");

    const testStringInput = document.getElementById("testStringInput");
    const testStringButton = document.getElementById("testStringBtn");
    const stringTestResult = document.getElementById("stringTestResult");
    const stringTraceSection = document.getElementById("stringTraceSection");
    const stringTrace = document.getElementById("stringTrace");

    let currentType = "nfa";
    let generatedAutomata = null;

    function showStatus(message, isError = false) {
        if (!status) return;

        status.textContent = message;
        status.classList.toggle("error", isError);
        status.classList.toggle("success", !isError);
    }

    function clearStringTest() {
        stringTestResult.innerHTML = "";
        stringTestResult.className = "string-test-result";

        const message = document.createElement("p");
        message.textContent =
            "Generate an automaton first, then enter a string to test.";

        stringTestResult.appendChild(message);

        stringTrace.innerHTML = "";
        stringTraceSection.style.display = "none";
    }

    function clearAutomata() {
        generatedAutomata = null;

        canvas.innerHTML = "";

        stateCount.textContent = "0";
        acceptingCount.textContent = "0";
        transitionCount.textContent = "0";
        alphabetValue.textContent = "—";

        transitionTableBody.innerHTML = "";

        regexValue.textContent = "—";
        regexDescription.textContent =
            "Enter a valid regular expression to generate automata.";

        explanationTitle.textContent = "Automata Explanation";
        explanationText.textContent =
            "The automata explanation will appear here after generation.";

        clearStringTest();
    }

    function normalizeNFA(nfa) {
        return {
            states: nfa.states.map(state => ({
                ...state,
                name: String(state.id),
                isAccepting: state.id === nfa.acceptState
            })),
            startState: nfa.startState,
            acceptingStates: [nfa.acceptState],
            alphabet: nfa.alphabet,
            transitions: nfa.states.flatMap(state =>
                state.transitions.map(transition => ({
                    from: state.id,
                    symbol: transition.symbol,
                    to: transition.to
                }))
            )
        };
    }

    function normalizeDFA(dfa) {
        return {
            ...dfa,
            states: dfa.states,
            startState: dfa.startState,
            acceptingStates: dfa.acceptingStates,
            alphabet: dfa.alphabet,
            transitions: dfa.transitions
        };
    }

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

    function updateStats(automaton) {
        stateCount.textContent = automaton.states.length;
        acceptingCount.textContent = automaton.acceptingStates.length;
        transitionCount.textContent = getTransitions(automaton).length;
        alphabetValue.textContent = automaton.alphabet.join(", ") || "ε";
    }

    function updateTransitionTable(automaton) {
        transitionTableBody.innerHTML = "";

        getTransitions(automaton).forEach(transition => {
            const row = document.createElement("tr");

            [transition.from, transition.symbol, transition.to].forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value === "epsilon" ? "ε" : value;
                row.appendChild(cell);
            });

            transitionTableBody.appendChild(row);
        });
    }

    function updateExplanation(type) {
        const explanations = {
            nfa: {
                title: "NFA Explanation",
                text: "The NFA is constructed from the regular expression using Thompson's construction. It can contain epsilon transitions and multiple possible paths for an input."
            },
            dfa: {
                title: "DFA Explanation",
                text: "The DFA is generated from the NFA using subset construction and epsilon closures. Each state and input symbol has a deterministic transition."
            },
            minimized: {
                title: "Minimized DFA Explanation",
                text: "Equivalent DFA states are merged through partition refinement, producing a smaller automaton while preserving the language accepted."
            }
        };

        explanationTitle.textContent = explanations[type].title;
        explanationText.textContent = explanations[type].text;
    }

    function renderAutomaton(type) {
        if (!generatedAutomata) return;

        const automaton = generatedAutomata[type];

        updateStats(automaton);
        updateTransitionTable(automaton);
        updateExplanation(type);

        if (type === "nfa") {
            AutomataVisualizer.render(automaton, "nfa", canvas);
        } else if (type === "dfa") {
            AutomataVisualizer.render(automaton, "dfa", canvas);
        } else {
            AutomataVisualizer.render(automaton, "minimized", canvas);
        }
    }

    function switchTab(type) {
        currentType = type;

        tabs.forEach(tab => {
            tab.classList.toggle("active", tab.dataset.type === type);
        });

        renderAutomaton(type);
    }

    function displayStringResult(result, input) {
        stringTestResult.innerHTML = "";
        stringTestResult.className = "string-test-result";

        const heading = document.createElement("h3");
        heading.textContent = result.accepted ? "STRING ACCEPTED" : "STRING REJECTED";

        const detail = document.createElement("p");
        detail.textContent = result.accepted
            ? `The string "${input}" is accepted by the minimized DFA.`
            : `The string "${input}" is rejected by the minimized DFA.`;

        stringTestResult.classList.add(
            result.accepted ? "accepted" : "rejected"
        );

        stringTestResult.appendChild(heading);
        stringTestResult.appendChild(detail);

        displayTrace(result.trace, result.finalState, result.accepted);
    }

    function displayTrace(trace, finalState, accepted) {
        stringTrace.innerHTML = "";
        stringTraceSection.style.display = "block";

        const table = document.createElement("table");
        table.className = "string-trace-table";

        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        ["STEP", "CURRENT STATE", "INPUT", "NEXT STATE"].forEach(label => {
            const th = document.createElement("th");
            th.textContent = label;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");

        trace.forEach((step, index) => {
            const row = document.createElement("tr");

            const values = [
                index,
                step.state,
                step.input,
                step.nextState === null ? "No transition" : step.nextState
            ];

            values.forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            if (step.nextState === null) {
                row.classList.add("trace-failed");
            }

            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        stringTrace.appendChild(table);

        const finalMessage = document.createElement("p");
        finalMessage.className = "trace-final-state";
        finalMessage.textContent = accepted
            ? `Final state: ${finalState} — Accepting state`
            : `Final state: ${finalState} — ${trace.some(step => step.nextState === null)
                ? "Transition failed"
                : "Non-accepting state"}`;

        stringTrace.appendChild(finalMessage);
    }

    function testString() {
        if (!generatedAutomata) {
            stringTestResult.innerHTML = "";
            stringTestResult.className = "string-test-result rejected";

            const message = document.createElement("p");
            message.textContent = "Please generate an automaton before testing a string.";

            stringTestResult.appendChild(message);
            stringTrace.innerHTML = "";
            stringTraceSection.style.display = "none";
            return;
        }

        const input = testStringInput.value;

        try {
            const result = StringSimulator.simulate(
                generatedAutomata.minimized,
                input
            );

            displayStringResult(result, input);
        } catch (error) {
            stringTestResult.innerHTML = "";
            stringTestResult.className = "string-test-result rejected";

            const message = document.createElement("p");
            message.textContent = error.message || "Unable to simulate this string.";

            stringTestResult.appendChild(message);
            stringTrace.innerHTML = "";
            stringTraceSection.style.display = "none";

            console.error("String simulation error:", error);
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            switchTab(tab.dataset.type);
        });
    });

    generateButton.addEventListener("click", generateAutomata);

    regexInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            generateAutomata();
        }
    });

    testStringButton.addEventListener("click", testString);

    testStringInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            testString();
        }
    });

    function generateAutomata() {
        const regex = regexInput.value.trim();

        if (!regex) {
            clearAutomata();
            showStatus("Please enter a regular expression.", true);
            return;
        }

        try {
            const result = AutomataEngine.convertRegexToDFA(regex);

            const nfa = normalizeNFA(result.nfa);
            const dfa = normalizeDFA(result.dfa);
            const minimized = DFAMinimizer.minimizeDFA(dfa);

            generatedAutomata = {
                nfa,
                dfa,
                minimized
            };

            regexValue.textContent = regex;
            regexDescription.textContent =
                "Automata generated dynamically from your regular expression.";

            showStatus("Automata generated successfully.");

            clearStringTest();
            switchTab(currentType);
        } catch (error) {
            clearAutomata();
            showStatus(error.message || "Invalid regular expression.", true);
            console.error("Automata generation error:", error);
        }
    }

    clearStringTest();
    generateAutomata();
});
