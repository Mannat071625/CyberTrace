
const scanButton = document.getElementById("scanBtn");

if (scanButton) {
    scanButton.addEventListener("click", () => {
        showPage("detection");
    });
}

const navLinks = document.querySelectorAll(".nav-link");

function showPage(pageName) {
    const dashboardPage = document.getElementById("dashboardPage");
    const detectionPage = document.getElementById("detectionPage");
    const regexPage = document.getElementById("regexPage");

    const pages = {
        dashboard: dashboardPage,
        detection: detectionPage,
        regex: regexPage
    };

    if (!pages[pageName]) {
        return;
    }

    Object.entries(pages).forEach(([name, page]) => {
        if (page) {
            page.hidden = name !== pageName;
        }
    });

    navLinks.forEach(link => {
        link.classList.toggle(
            "active",
            link.dataset.page === pageName
        );
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

navLinks.forEach(link => {
    link.addEventListener("click", event => {
        const pageName = link.dataset.page;

        if (pageName === "dashboard" || pageName === "detection" || pageName === "regex") {
            event.preventDefault();
            showPage(pageName);
        }
    });
});
