
const automataData = {
    nfa: {
        title: "Nondeterministic Finite Automaton",
        description: "Thompson construction with epsilon transitions",
        states: 4,
        accepting: 1,
        transitionCount: 5,
        alphabet: "a",
        explanationTitle: "How the NFA works",
        explanationText:
            "The NFA uses epsilon transitions to represent the zero-or-more repetition in a*. It can reach the accepting state without consuming any input, and it can also repeatedly consume the symbol a.",
        transitions: [
            ["q0", "ε", "q1"],
            ["q0", "ε", "q3"],
            ["q1", "a", "q2"],
            ["q2", "ε", "q1"],
            ["q2", "ε", "q3"]
        ],
        svg: `
            <svg viewBox="0 0 850 300" role="img" aria-label="NFA state diagram for a star">
                <defs>
                    <marker id="nfaArrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L9,3 z" fill="#8794a9"/>
                    </marker>
                    <marker id="nfaStart" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L9,3 z" fill="#20df9a"/>
                    </marker>
                </defs>

                <path class="start-arrow" d="M25 145 L95 145" marker-end="url(#nfaStart)"/>
                <path class="edge" d="M145 135 L285 135" marker-end="url(#nfaArrow)"/>
                <text class="edge-label" x="215" y="120">ε</text>
                <path class="edge" d="M125 120 Q320 15 690 115" marker-end="url(#nfaArrow)"/>
                <text class="edge-label" x="400" y="55">ε</text>
                <path class="edge" d="M345 135 L485 135" marker-end="url(#nfaArrow)"/>
                <text class="edge-label" x="415" y="120">a</text>
                <path class="edge" d="M505 165 Q415 270 325 165" marker-end="url(#nfaArrow)"/>
                <text class="edge-label" x="415" y="230">ε</text>
                <path class="edge" d="M545 135 L685 135" marker-end="url(#nfaArrow)"/>
                <text class="edge-label" x="615" y="120">ε</text>

                <circle class="state-circle" cx="120" cy="145" r="27"/>
                <text class="state-label" x="120" y="145">q0</text>

                <circle class="state-circle" cx="315" cy="145" r="27"/>
                <text class="state-label" x="315" y="145">q1</text>

                <circle class="state-circle" cx="515" cy="145" r="27"/>
                <text class="state-label" x="515" y="145">q2</text>

                <circle class="state-circle accepting-circle" cx="715" cy="145" r="27"/>
                <circle class="state-circle accepting-circle" cx="715" cy="145" r="21"/>
                <text class="state-label" x="715" y="145">q3</text>

                <text class="edge-label" x="715" y="195">Final</text>
            </svg>
        `
    },

    dfa: {
        title: "Deterministic Finite Automaton",
        description: "Subset construction from the NFA",
        states: 2,
        accepting: 2,
        transitionCount: 2,
        alphabet: "a",
        explanationTitle: "How the DFA works",
        explanationText:
            "The subset construction combines NFA states into DFA states. Both states are accepting because the expression a* accepts the empty string and every string containing only the symbol a. Each state has exactly one transition for the input symbol a.",
        transitions: [
            ["A", "a", "B"],
            ["B", "a", "B"]
        ],
        svg: `
            <svg viewBox="0 0 850 300" role="img" aria-label="DFA state diagram for a star">
                <defs>
                    <marker id="dfaArrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L9,3 z" fill="#8794a9"/>
                    </marker>
                    <marker id="dfaStart" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L9,3 z" fill="#20df9a"/>
                    </marker>
                </defs>

                <path class="start-arrow" d="M75 150 L185 150" marker-end="url(#dfaStart)"/>
                <path class="edge" d="M240 150 L565 150" marker-end="url(#dfaArrow)"/>
                <text class="edge-label" x="400" y="135">a</text>
                <path class="edge" d="M600 120 C600 35 770 35 770 120" marker-end="url(#dfaArrow)"/>
                <text class="edge-label" x="685" y="42">a</text>

                <circle class="state-circle accepting-circle" cx="215" cy="150" r="29"/>
                <circle class="state-circle accepting-circle" cx="215" cy="150" r="23"/>
                <text class="state-label" x="215" y="150">A</text>

                <circle class="state-circle accepting-circle" cx="595" cy="150" r="29"/>
                <circle class="state-circle accepting-circle" cx="595" cy="150" r="23"/>
                <text class="state-label" x="595" y="150">B</text>

                <text class="edge-label" x="215" y="205">Accepting</text>
                <text class="edge-label" x="595" y="205">Accepting</text>
            </svg>
        `
    },

    minimized: {
        title: "Minimized Deterministic Finite Automaton",
        description: "Equivalent accepting states merged",
        states: 1,
        accepting: 1,
        transitionCount: 1,
        alphabet: "a",
        explanationTitle: "How minimization works",
        explanationText:
            "The two DFA states are equivalent: both are accepting, and both transition to an accepting state on input a. They can therefore be merged into one state. The resulting one-state DFA accepts every string consisting only of zero or more a symbols.",
        transitions: [
            ["M0", "a", "M0"]
        ],
        svg: `
            <svg viewBox="0 0 850 300" role="img" aria-label="Minimized DFA state diagram for a star">
                <defs>
                    <marker id="minArrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L9,3 z" fill="#8794a9"/>
                    </marker>
                    <marker id="minStart" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L9,3 z" fill="#20df9a"/>
                    </marker>
                </defs>

                <path class="start-arrow" d="M220 150 L365 150" marker-end="url(#minStart)"/>
                <path class="edge" d="M395 120 C395 25 590 25 590 120" marker-end="url(#minArrow)"/>
                <text class="edge-label" x="490" y="30">a</text>

                <circle class="state-circle accepting-circle" cx="400" cy="150" r="31"/>
                <circle class="state-circle accepting-circle" cx="400" cy="150" r="24"/>
                <text class="state-label" x="400" y="150">M0</text>

                <text class="edge-label" x="400" y="210">Accepting</text>
            </svg>
        `
    }
};

function renderAutomaton(type) {
    const data = automataData[type];

    document.getElementById("automataTitle").textContent = data.title;
    document.getElementById("automataDescription").textContent = data.description;

    document.getElementById("automataType").textContent =
        type === "minimized" ? "MINIMIZED DFA" : type.toUpperCase();

    document.getElementById("automataCanvas").innerHTML = data.svg;

    document.getElementById("stateCount").textContent = data.states;
    document.getElementById("acceptingCount").textContent = data.accepting;
    document.getElementById("transitionCount").textContent = data.transitionCount;
    document.getElementById("alphabetValue").textContent = data.alphabet;

    document.getElementById("explanationTitle").textContent =
        data.explanationTitle;

    document.getElementById("explanationText").textContent =
        data.explanationText;

    const tableBody = document.getElementById("transitionTableBody");
    tableBody.replaceChildren();

    data.transitions.forEach(transition => {
        const row = document.createElement("tr");

        transition.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });

    document.querySelectorAll(".automata-tab").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.type === type
        );
    });
}

document.querySelectorAll(".automata-tab").forEach(button => {
    button.addEventListener("click", () => {
        renderAutomaton(button.dataset.type);
    });
});

renderAutomaton("nfa");
