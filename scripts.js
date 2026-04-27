const popup = document.getElementById("popup");
const openBtn = document.getElementById("openBtn");
const closeBtn = document.getElementById("clsBtn");

// 1. Open the popup
openBtn.onclick = function(event) {
    popup.style.display = "block";
};

// 3. Close the popup when clicking outside of it
window.onclick = function(event) {
    // If the popup is open AND the user clicks completely outside the 'openBtn' container...
    if (popup.style.display === "block" && !openBtn.contains(event.target)) {
        popup.style.display = "none";
    }
};

// Optional but highly recommended:
// Stop clicks *inside* the popup from bubbling up and triggering the openBtn again
popup.onclick = function(event) {
    event.stopPropagation();
};