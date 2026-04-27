const popup = document.getElementById("popup");
const openBtn = document.getElementById("openBtn");
const closeBtn = document.getElementById("clsBtn");

// 1. Open the popup
openBtn.onclick = function(event) {
    popup.style.display = "block";
};

// 2. Close the popup with [X]
closeBtn.onclick = function(event) {
    // This is the magic line! It stops the click from hitting the openBtn underneath it.
    event.stopPropagation();
    popup.style.display = "none";
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