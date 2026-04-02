const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const year = document.getElementById("year");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
        mainNav.classList.toggle("open");
    });

    mainNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            mainNav.classList.remove("open");
        });
    });
}

if (year) {
    year.textContent = String(new Date().getFullYear());
}

if (contactForm && formStatus) {
    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();
        formStatus.textContent = "Thanks for reaching out. MyNPco LLC will reply shortly.";
        contactForm.reset();
    });
}
