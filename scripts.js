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
    toggleBtn.addEventListener("click", function() {
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

// --- GITHUB ACTIVITY HEATMAP ---

document.addEventListener('DOMContentLoaded', () => {
    // Only run on pages containing the heatmap grid container
    const gridContainer = document.getElementById('heatmap-grid');
    if (gridContainer) {
        initGitHubActivity();
    }
});

/**
 * Initializes and fetches the GitHub activity data, falling back
 * to simulated data if the static JSON file is not found.
 */
async function initGitHubActivity() {
    let response;
    try {
        response = await fetch('./github-activity.json');
    } catch (err) {
        // network error
    }

    if (response && response.ok) {
        try {
            const data = await response.json();
            renderHeatmap(data);
            return;
        } catch (err) {
            // json parse error
        }
    }

    console.warn("Failed to load real GitHub activity JSON, falling back to simulated data.");
    
    // Render realistic simulated dataset if JSON fetch fails (e.g. on first run or offline preview)
    const mockData = generateMockActivity();
    renderHeatmap(mockData, true);
}

/**
 * Renders the heatmap calendar using dynamic cells and event delegation.
 * @param {object} data The contribution calendar data object.
 * @param {boolean} isSimulated If true, adds a simulated indicator to the stats text.
 */
function renderHeatmap(data, isSimulated = false) {
    const grid = document.getElementById('heatmap-grid');
    const totalText = document.getElementById('total-contributions');
    const tooltip = document.getElementById('heatmap-tooltip');
    const monthsContainer = document.getElementById('heatmap-months-labels');
    
    if (!grid || !totalText || !tooltip) return;
    
    // Set total contributions text
    const labelSuffix = isSimulated ? ' (simulated)' : ' in the last year';
    totalText.textContent = `${data.totalContributions} contributions${labelSuffix}`;

    // Map GraphQL contribution levels to local style classes
    const levelMap = {
        'NONE': 'level-0',
        'FIRST_QUARTILE': 'level-1',
        'SECOND_QUARTILE': 'level-2',
        'THIRD_QUARTILE': 'level-3',
        'FOURTH_QUARTILE': 'level-4'
    };

    // Clear previous month labels and grid if any
    if (monthsContainer) {
        monthsContainer.innerHTML = '';
    }
    grid.innerHTML = '';
    
    let lastMonthName = '';

    // Unscramble and sort dataset chronologically to guarantee correct grid alignment
    let allDays = [];
    data.weeks.forEach(week => {
        if (week.contributionDays) {
            allDays.push(...week.contributionDays);
        }
    });
    allDays.sort((a, b) => a.date.localeCompare(b.date));

    const chronologicalWeeks = [];
    for (let i = 0; i < allDays.length; i += 7) {
        chronologicalWeeks.push({
            contributionDays: allDays.slice(i, i + 7)
        });
    }

    // Use DocumentFragment to batch DOM inserts and prevent layout thrashing
    const fragment = document.createDocumentFragment();

    chronologicalWeeks.forEach(week => {
        const column = document.createElement('div');
        column.className = 'heatmap-column';

        // Dynamic Month Header Label Alignment
        const firstDay = week.contributionDays[0];
        if (firstDay && monthsContainer) {
            const parts = firstDay.date.split('-');
            const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
            const currentMonthName = dateObj.toLocaleString('en-US', { month: 'short' });

            const monthDiv = document.createElement('div');
            monthDiv.className = 'month-label';
            
            // Only output label if it's a new month name from the previous week
            if (currentMonthName !== lastMonthName) {
                monthDiv.textContent = currentMonthName;
                lastMonthName = currentMonthName;
            }
            monthsContainer.appendChild(monthDiv);
        }

        week.contributionDays.forEach(day => {
            const cell = document.createElement('div');
            cell.className = `heatmap-cell ${levelMap[day.contributionLevel] || 'level-0'}`;
            cell.setAttribute('data-date', day.date);
            cell.setAttribute('data-count', day.contributionCount);
            
            // Accessibility labels for screen readers
            cell.setAttribute('aria-label', `${day.contributionCount} contributions on ${day.date}`);
            cell.setAttribute('tabindex', '0');
            
            column.appendChild(cell);
        });

        fragment.appendChild(column);
    });

    grid.appendChild(fragment);

    // Event Delegation: single listener on grid container instead of 371 cell listeners
    grid.addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('heatmap-cell')) {
            const count = e.target.getAttribute('data-count');
            const date = e.target.getAttribute('data-date');
            if (count === null || !date) return;
            
            const countText = count === "0" ? "No contributions" : `${count} contributions`;
            tooltip.textContent = `${countText} on ${date}`;
            tooltip.style.opacity = '1';
        }
    });

    grid.addEventListener('mousemove', (e) => {
        if (e.target.classList.contains('heatmap-cell')) {
            const tooltipWidth = tooltip.offsetWidth || 140;

            // Calculate coordinates relative to the offset parent (.heatmap-section)
            const offsetParent = tooltip.offsetParent || document.body;
            const parentRect = offsetParent.getBoundingClientRect();

            const mouseX = e.clientX - parentRect.left;
            const mouseY = e.clientY - parentRect.top;

            // Default: position tooltip 15px to the right of the cursor
            let left = mouseX + 15;

            // Flip to the left if the tooltip would overflow the right viewport edge
            if (e.clientX + tooltipWidth + 20 > window.innerWidth) {
                left = mouseX - tooltipWidth - 15;
            }

            // Clamp to prevent overflow on the left boundary of the viewport
            if (e.clientX + (left - mouseX) < 5) {
                left = 5 - parentRect.left;
            }
            // Clamp to prevent overflow on the right boundary of the viewport
            if (e.clientX + (left - mouseX) + tooltipWidth > window.innerWidth - 5) {
                left = window.innerWidth - tooltipWidth - 5 - parentRect.left;
            }

            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${mouseY - 30}px`;
        }
    });

    grid.addEventListener('mouseout', (e) => {
        if (e.target.classList.contains('heatmap-cell')) {
            tooltip.style.opacity = '0';
        }
    });
}

/**
 * Generates deterministic simulated GitHub contributions as a backup
 * when the static json file is unavailable.
 * @returns {object} Simulated contributions calendar object.
 */
function generateMockActivity() {
    const weeks = [];
    const today = new Date();
    // Start from 371 days ago (53 weeks * 7 days)
    let currentDate = new Date(today.getTime() - 371 * 24 * 60 * 60 * 1000);
    let totalContributions = 0;
    
    for (let w = 0; w < 53; w++) {
        const contributionDays = [];
        for (let d = 0; d < 7; d++) {
            const dateStr = currentDate.toISOString().split('T')[0];
            
            // Create organic waves of contributions instead of pure random noise
            // Uses simple sine function patterns combined with pseudo-random variance
            const dayOfYear = (w * 7) + d;
            const wave = Math.sin(dayOfYear / 15) * Math.sin(dayOfYear / 60);
            const probability = (wave + 1) / 2; // normalise to 0..1
            
            let count = 0;
            let level = 'NONE';
            
            // Determine level based on wave probability
            if (Math.random() < probability * 0.7) {
                count = Math.floor(Math.random() * 8) + 1;
                totalContributions += count;
                
                if (count <= 2) level = 'FIRST_QUARTILE';
                else if (count <= 4) level = 'SECOND_QUARTILE';
                else if (count <= 6) level = 'THIRD_QUARTILE';
                else level = 'FOURTH_QUARTILE';
            }
            
            contributionDays.push({
                contributionCount: count,
                date: dateStr,
                contributionLevel: level
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        weeks.push({ contributionDays });
    }
    
    return { totalContributions, weeks };
}