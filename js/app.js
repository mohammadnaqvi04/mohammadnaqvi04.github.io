document.addEventListener("DOMContentLoaded", function () {
    const contentDiv = document.getElementById("content");
    
    const loadPage = async (url) => {
        const response = await fetch(url);
        const content = await response.text();
        contentDiv.innerHTML = content;
    };

    // Handle link clicks
    const handleLinkClick = (event) => {
        event.preventDefault();
        const target = event.target;
        const url = target.getAttribute("href");
        window.history.pushState(null, null, url);

        loadPage(url);
    };

    document.querySelectorAll('a[data-link]').forEach((link) => {
        link.addEventListener('click', handleLinkClick);
    });

    window.addEventListener("popstate", () => {
        const currentPath = window.location.pathname;
        loadPage(currentPath);
    });
});
