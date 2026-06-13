// const popup = document.getElementById("popup");
// const openBtn = document.getElementById("openBtn");
// const closeBtn = document.getElementById("clsBtn");
//
// // 1. Open the popup
// openBtn.onclick = function(event) {
//     popup.style.display = "block";
// };
//
// // 3. Close the popup when clicking outside of it
// window.onclick = function(event) {
//     // If the popup is open AND the user clicks completely outside the 'openBtn' container...
//     if (popup.style.display === "block" && !openBtn.contains(event.target)) {
//         popup.style.display = "none";
//     }
// };
//
// // Optional but highly recommended:
// // Stop clicks *inside* the popup from bubbling up and triggering the openBtn again
// popup.onclick = function(event) {
//     event.stopPropagation();
// };                                 UNUSED FUNCTION


// --- THEME TOGGLE LOGIC ---
const toggleBtn = document.getElementById("theme-toggle");
const bodyElement = document.body;
let activeTransition = null;

if (toggleBtn) {
    toggleBtn.addEventListener("click", function(e) {
        // If there's an active transition, skip it immediately to start the new one
        if (activeTransition) {
            try {
                activeTransition.skipTransition();
            } catch (err) {
                // Ignore any skip errors
            }
        }

        // If the browser does not support the View Transitions API, toggle the class normally
        if (!document.startViewTransition) {
            bodyElement.classList.toggle('dark-mode');
            const isLight = bodyElement.classList.contains('dark-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            return;
        }

        // Calculate the exact center coordinates of the toggle button
        const rect = toggleBtn.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        // Calculate distance to the furthest viewport corner to ensure the circle covers the screen
        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        ) + 15;

        // Set CSS custom properties on the root element to pass them down to the view transition pseudo-elements
        document.documentElement.style.setProperty('--clip-x', `${x}px`);
        document.documentElement.style.setProperty('--clip-y', `${y}px`);
        document.documentElement.style.setProperty('--clip-r', `${endRadius}px`);

        // Trigger the view transition
        activeTransition = document.startViewTransition(() => {
            bodyElement.classList.toggle('dark-mode');
            const isLight = bodyElement.classList.contains('dark-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        });

        // Catch internal view transition promises to avoid unhandled rejections when skipped
        activeTransition.ready.catch(() => {});
        activeTransition.updateCallbackDone.catch(() => {});
        activeTransition.finished.catch(() => {});

        // Clean up the active transition reference when finished
        activeTransition.finished.finally(() => {
            activeTransition = null;
        });
    });
}