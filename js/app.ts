document.addEventListener("DOMContentLoaded", () => {
    const contentDiv = document.getElementById("content") as HTMLDivElement | null;

    const loadPage = async (url: string): Promise<void> => {
        try {
            const response = await fetch(url);
            const content = await response.text();
            if (contentDiv) {
                contentDiv.innerHTML = content;
            }
        } catch (error) {
            console.error("Error loading page:", error);
        }
    };

    // Handle link clicks
    const handleLinkClick = (event: MouseEvent): void => {
        event.preventDefault();
        const target = event.target as HTMLAnchorElement;
        const url = target.getAttribute("href");
        if (url) {
            window.history.pushState(null, "", url);
            loadPage(url);
        }
    };

    document.querySelectorAll('a[data-link]').forEach((link) => {
        link.addEventListener('click', (event: Event) => handleLinkClick(event as MouseEvent));
    });

    window.addEventListener("popstate", () => {
        const currentPath = window.location.pathname;
        loadPage(currentPath);
    });
});
