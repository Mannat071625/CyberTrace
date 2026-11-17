
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

    if (!dashboardPage || !detectionPage) {
        return;
    }

    if (pageName === "detection") {
        dashboardPage.hidden = true;
        detectionPage.hidden = false;
    } else {
        dashboardPage.hidden = false;
        detectionPage.hidden = true;
    }

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

        if (pageName === "dashboard" || pageName === "detection") {
            event.preventDefault();
            showPage(pageName);
        }
    });
});
