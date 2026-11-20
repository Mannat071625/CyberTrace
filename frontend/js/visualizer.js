
const AutomataVisualizer = (() => {
    const SVG_NS = "http://www.w3.org/2000/svg";

    function escapeXML(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
    }

    function getStateLabel(state, type) {
        if (type === "nfa") {
            return `q${state.id}`;
        }

        if (state.name) {
            return state.name;
        }

        return `${type === "minimized" ? "M" : "D"}${state.id}`;
    }

    function getTransitions(automaton, type) {
        if (type === "nfa") {
            const transitions = [];

            automaton.states.forEach(state => {
                state.transitions.forEach(transition => {
                    transitions.push({
                        from: state.id,
                        to: transition.to,
                        symbol: transition.symbol
                    });
                });
            });

            return transitions;
        }

        return automaton.transitions || [];
    }

    function groupTransitions(transitions) {
        const groups = new Map();

        transitions.forEach(transition => {
            const key = `${transition.from}|${transition.to}`;

            if (!groups.has(key)) {
                groups.set(key, {
                    from: transition.from,
            to: transition.to,
                symbols: []
            });
            }

            groups.get(key).symbols.push(transition.symbol);
        });

        return [...groups.values()];
    }

    function render(automaton, type, container) {
        if (!automaton || !automaton.states || !container) {
            return;
        }

        const states = automaton.states;
        const transitions = groupTransitions(
            getTransitions(automaton, type)
        );

        const count = states.length;
        const width = Math.max(850, count * 125);
        const height = Math.max(420, count * 95);
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.max(115, Math.min(count * 38, height * 0.34));
        const nodeRadius = 30;

        const positions = new Map();

        states.forEach((state, index) => {
            const angle = -Math.PI / 2 + (2 * Math.PI * index / count);

            positions.set(state.id, {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            });
        });

        const markerId = `arrow-${type}-${Date.now()}`;

        let svg = `
            <svg xmlns="${SVG_NS}"
                 viewBox="0 0 ${width} ${height}"
                 role="img"
                 aria-label="${escapeXML(type.toUpperCase())} state diagram">
                <defs>
                    <marker id="${markerId}"
                            markerWidth="10"
                            markerHeight="10"
                            refX="8"
                            refY="3"
                            orient="auto"
                            markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" fill="#8794a9"/>
                    </marker>
                </defs>
        `;

        // Draw transitions first so that they remain behind states.

        transitions.forEach((transition, index) => {
            const from = positions.get(transition.from);
            const to = positions.get(transition.to);

            if (!from || !to) {
                return;
            }

            const label = transition.symbols.join(", ");

            if (transition.from === transition.to) {
                const loopPath = `
                    M ${from.x - 14} ${from.y - 24}
                    C ${from.x - 65} ${from.y - 95},
                      ${from.x + 65} ${from.y - 95},
                      ${from.x + 14} ${from.y - 24}
                `;

                svg += `
                    <path d="${loopPath}"
                          class="edge"
                          marker-end="url(#${markerId})"/>
                    <text class="edge-label"
                          x="${from.x}"
                          y="${from.y - 78}">
                        ${escapeXML(label)}
                    </text>
                `;

                return;
            }

            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;

            const ux = dx / distance;
            const uy = dy / distance;

            const startX = from.x + ux * nodeRadius;
            const startY = from.y + uy * nodeRadius;
            const endX = to.x - ux * nodeRadius;
            const endY = to.y - uy * nodeRadius;

            const reciprocal = transitions.some(
                item =>
                    item.from === transition.to &&
                    item.to === transition.from
            );

            const curveOffset = reciprocal ? 32 : 0;
            const perpendicularX = -uy;
            const perpendicularY = ux;

            const controlX =
                (startX + endX) / 2 +
                perpendicularX * curveOffset;

            const controlY =
                (startY + endY) / 2 +
                perpendicularY * curveOffset;

            const path = curveOffset === 0
                ? `M ${startX} ${startY} L ${endX} ${endY}`
                : `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;

            const labelX = curveOffset === 0
                ? (startX + endX) / 2
                : controlX;

            const labelY = curveOffset === 0
                ? (startY + endY) / 2 - 12
                : controlY - 12;

            svg += `
                <path d="${path}"
                      class="edge"
                      marker-end="url(#${markerId})"/>
                <text class="edge-label"
                      x="${labelX}"
                      y="${labelY}">
                    ${escapeXML(label)}
                </text>
            `;
        });

        // Draw start arrows.

        const startState = states.find(
            state => state.id === automaton.startState
        );

        if (startState) {
            const position = positions.get(startState.id);

            svg += `
                <path class="start-arrow"
                      d="M ${position.x - 75} ${position.y}
                         L ${position.x - nodeRadius - 5} ${position.y}"
                      marker-end="url(#${markerId})"/>
            `;
        }

        // Draw states.

        states.forEach(state => {
            const position = positions.get(state.id);
            const label = getStateLabel(state, type);
            const accepting = Boolean(state.isAccepting);

            svg += `
                <circle class="state-circle ${accepting ? "accepting-circle" : ""}"
                        cx="${position.x}"
                        cy="${position.y}"
                        r="${nodeRadius}"/>
            `;

            if (accepting) {
                svg += `
                    <circle class="state-circle accepting-circle"
                            cx="${position.x}"
                            cy="${position.y}"
                            r="${nodeRadius - 6}"/>
                `;
            }

            svg += `
                <text class="state-label"
                      x="${position.x}"
                      y="${position.y}">
                    ${escapeXML(label)}
                </text>
            `;
        });

        svg += `</svg>`;

        container.innerHTML = svg;
    }

    return {
        render
    };
})();

window.AutomataVisualizer = AutomataVisualizer;
