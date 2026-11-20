
const regexPatternInput = document.getElementById("regexPattern");
const regexFlagsInput = document.getElementById("regexFlags");
const regexTestTextInput = document.getElementById("regexTestText");

const testRegexButton = document.getElementById("testRegexBtn");
const clearRegexButton = document.getElementById("clearRegexBtn");

const regexResultMessage = document.getElementById("regexResultMessage");
const regexMatchStatus = document.getElementById("regexMatchStatus");
const regexMatchCount = document.getElementById("regexMatchCount");
const regexMatchesContainer = document.getElementById("regexMatchesContainer");

function showRegexMessage(message, type = "") {
    regexResultMessage.textContent = message;
    regexResultMessage.className = "regex-result-message";

    if (type) {
        regexResultMessage.classList.add(type);
    }
}

function clearRegexResults() {
    regexMatchStatus.textContent = "Ready";
    regexMatchCount.textContent = "0";
    regexMatchesContainer.innerHTML = `
        <div class="regex-empty-state">
            <h3>No results yet</h3>
            <p>Enter a regular expression and test it against your text.</p>
        </div>
    `;

    showRegexMessage("Waiting for pattern input");
}

function createRegexElement(tag, className, text = "") {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    element.textContent = text;

    return element;
}

function displayRegexMatch(match, index) {
    const card = document.createElement("div");
    card.className = "regex-match-card";

    const matchIndex = createRegexElement(
        "div",
        "regex-match-index",
        String(index + 1)
    );

    const content = document.createElement("div");
    content.className = "regex-match-content";

    const matchText = createRegexElement(
        "div",
        "regex-match-text",
        match[0] === "" ? "(empty match)" : match[0]
    );

    const details = document.createElement("div");
    details.className = "regex-match-details";

    const startDetail = document.createElement("span");
    startDetail.className = "regex-match-detail";
    startDetail.append("Start index: ");

    startDetail.append(
        createRegexElement("strong", "", String(match.index))
    );

    const endDetail = document.createElement("span");
    endDetail.className = "regex-match-detail";
    endDetail.append("End index: ");

    endDetail.append(
        createRegexElement(
            "strong",
            "",
            String(match.index + match[0].length)
        )
    );

    details.append(startDetail, endDetail);

    content.append(matchText, details);

    if (match.groups && Object.keys(match.groups).length > 0) {
        const groupsContainer = document.createElement("div");
        groupsContainer.className = "regex-match-groups";

        const groupsTitle = createRegexElement(
            "div",
            "regex-match-groups-title",
            "Named Capture Groups"
        );

        groupsContainer.appendChild(groupsTitle);

        Object.entries(match.groups).forEach(([name, value]) => {
            const groupItem = document.createElement("div");
            groupItem.className = "regex-group-item";

            const groupName = createRegexElement(
                "span",
                "regex-group-name",
                name + ":"
            );

            const groupValue = createRegexElement(
                "span",
                "regex-group-value",
                value === undefined ? "undefined" : value
            );

            groupItem.append(groupName, groupValue);
            groupsContainer.appendChild(groupItem);
        });

        content.appendChild(groupsContainer);
    }

    if (match.length > 1) {
        const groupsContainer = document.createElement("div");
        groupsContainer.className = "regex-match-groups";

        const groupsTitle = createRegexElement(
            "div",
            "regex-match-groups-title",
            "Capture Groups"
        );

        groupsContainer.appendChild(groupsTitle);

        for (let i = 1; i < match.length; i++) {
            const groupItem = document.createElement("div");
            groupItem.className = "regex-group-item";

            const groupName = createRegexElement(
                "span",
                "regex-group-name",
                "Group " + i + ":"
            );

            const groupValue = createRegexElement(
                "span",
                "regex-group-value",
                match[i] === undefined ? "undefined" : match[i]
            );

            groupItem.append(groupName, groupValue);
            groupsContainer.appendChild(groupItem);
        }

        content.appendChild(groupsContainer);
    }

    card.append(matchIndex, content);
    regexMatchesContainer.appendChild(card);
}

function runRegexTest() {
    const pattern = regexPatternInput.value;
    const flags = regexFlagsInput.value;
    const testText = regexTestTextInput.value;

    regexMatchesContainer.innerHTML = "";
    regexMatchCount.textContent = "0";

    if (!pattern) {
        regexMatchStatus.textContent = "No pattern";
        showRegexMessage("Enter a regular expression pattern.", "warning");
        clearRegexResultsDisplay();
        return;
    }

    let regex;

    try {
        regex = new RegExp(pattern, flags);
    } catch (error) {
        regexMatchStatus.textContent = "Invalid";
        showRegexMessage(error.message, "error");

        regexMatchesContainer.appendChild(
            createRegexElement(
                "div",
                "regex-empty-state",
                "Please fix your regular expression or flags and try again."
            )
        );

        return;
    }

    const matches = [];
    let match;

    if (regex.global || regex.sticky) {
        while ((match = regex.exec(testText)) !== null) {
            matches.push(match);

            if (match[0] === "") {
                regex.lastIndex++;
            }
        }
    } else {
        match = regex.exec(testText);

        if (match) {
            matches.push(match);
        }
    }

    regexMatchCount.textContent = String(matches.length);

    if (matches.length === 0) {
        regexMatchStatus.textContent = "No matches";
        showRegexMessage("No matches found for this pattern.", "warning");

        regexMatchesContainer.appendChild(
            createRegexElement(
                "div",
                "regex-empty-state",
                "No matching text was found. Try changing your pattern."
            )
        );

        return;
    }

    regexMatchStatus.textContent = "Matched";
    showRegexMessage(
        `Successfully found ${matches.length} match${matches.length === 1 ? "" : "es"}.`,
        "success"
    );

    matches.forEach((item, index) => {
        displayRegexMatch(item, index);
    });
}

function clearRegexResultsDisplay() {
    regexMatchCount.textContent = "0";

    regexMatchesContainer.innerHTML = `
        <div class="regex-empty-state">
            <h3>No results yet</h3>
            <p>Enter a regular expression and test it against your text.</p>
        </div>
    `;
}

if (testRegexButton) {
    testRegexButton.addEventListener("click", runRegexTest);
}

if (clearRegexButton) {
    clearRegexButton.addEventListener("click", () => {
        regexPatternInput.value = "";
        regexFlagsInput.value = "gi";
        regexTestTextInput.value = "";

        clearRegexResults();
    });
}

if (regexPatternInput && regexFlagsInput && regexTestTextInput) {
    [regexPatternInput, regexFlagsInput, regexTestTextInput].forEach(input => {
        input.addEventListener("input", () => {
            regexMatchStatus.textContent = "Ready";
            regexMatchCount.textContent = "0";
            showRegexMessage("Input changed. Run the test again.");

            clearRegexResultsDisplay();
        });
    });
}

clearRegexResults();
