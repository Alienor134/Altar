// Theme toggle with persistence
(function () {
  const root = document.documentElement;
  const preferred = localStorage.getItem("theme");
  if (preferred) root.setAttribute("data-theme", preferred);

  const btn = document.getElementById("themeToggle");
  if (btn) {
    btn.addEventListener("click", () => {
      const current = root.getAttribute("data-theme");
      const next = current === "light" ? "dark" : "light";
      if (!current) {
        // If not set, infer from system; then toggle
        const systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.setAttribute("data-theme", systemDark ? "light" : "light"); // force set to ensure next works
      }
      const newTheme = (root.getAttribute("data-theme") || "dark") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      btn.textContent = newTheme === "light" ? "🌙" : "☀️";
    });
  }

  // Set initial icon
  if (btn) {
    const t = root.getAttribute("data-theme");
    btn.textContent = t === "light" ? "🌙" : "☀️";
  }

  // Year in footer
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
})();

// Resource Finder Logic
(function () {
  // Wait for DOM if not ready, otherwise execute immediately
  function initFinder() {
    let selectedProfile = null;
    let selectedApproach = null;
    let selectedGoal = null;
    let resourceDataObj = null;

    // Load resource data from embedded JSON
    const dataEl = document.getElementById('resourceData');
    if (dataEl) {
      try {
        resourceDataObj = JSON.parse(dataEl.textContent);
      } catch (e) {
        console.error('Failed to parse resource data:', e);
      }
    }

  // Selection items
  const finderItems = document.querySelectorAll('.finder-item');
  const showBtn = document.getElementById('showResourcesBtn');
  const resetBtn = document.getElementById('resetBtn');
  const resultsDiv = document.getElementById('resourceResults');

  // Helper function to show results automatically
  function autoShowResults() {
    if (!selectedGoal || !selectedApproach || !resourceDataObj) return;

    const pathKey = `${selectedGoal}_${selectedApproach}`;
    const resourceIds = resourceDataObj.paths[pathKey];

    if (!resourceIds || resourceIds.length === 0) {
      // Hide results if no path exists
      if (resultsDiv) resultsDiv.style.display = 'none';
      return;
    }

    // Build and show results
    displayResults(resourceIds);
  }

  // Helper function to update available options
  function updateAvailableOptions() {
    if (!resourceDataObj) return;

    // Filter goals based on selected profile
    if (selectedProfile && resourceDataObj.profileGoals) {
      const allowedGoals = resourceDataObj.profileGoals[selectedProfile];
      
      document.querySelectorAll('.finder-item[data-type="goal"]').forEach(goalItem => {
        const goalId = goalItem.dataset.id;
        
        if (allowedGoals && allowedGoals.includes(goalId)) {
          goalItem.classList.remove('disabled');
        } else {
          goalItem.classList.add('disabled');
          if (goalItem.classList.contains('selected')) {
            goalItem.classList.remove('selected');
            selectedGoal = null;
          }
        }
      });
    } else {
      // No profile selected, enable all goals
      document.querySelectorAll('.finder-item[data-type="goal"]').forEach(i => 
        i.classList.remove('disabled'));
    }
  }

  finderItems.forEach(item => {
    item.addEventListener('click', () => {
      // Don't allow clicking disabled items
      if (item.classList.contains('disabled')) return;

      const type = item.dataset.type;
      const id = item.dataset.id;

      if (type === 'profile') {
        // Deselect other profiles
        document.querySelectorAll('.finder-item[data-type="profile"]').forEach(i => 
          i.classList.remove('selected'));
        selectedProfile = id;
      } else if (type === 'approach') {
        // Deselect other approaches
        document.querySelectorAll('.finder-item[data-type="approach"]').forEach(i => 
          i.classList.remove('selected'));
        selectedApproach = id;
      } else if (type === 'goal') {
        // Deselect other goals
        document.querySelectorAll('.finder-item[data-type="goal"]').forEach(i => 
          i.classList.remove('selected'));
        selectedGoal = id;
      }

      item.classList.add('selected');
      
      // Update which options are available
      updateAvailableOptions();
      
      // Auto-show results when all selections are made
      autoShowResults();
    });
  });

  // Reset button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      selectedProfile = null;
      selectedApproach = null;
      selectedGoal = null;
      finderItems.forEach(item => {
        item.classList.remove('selected');
        item.classList.remove('disabled');
      });
      if (resultsDiv) resultsDiv.style.display = 'none';
      document.getElementById('resource-finder').scrollIntoView({ behavior: 'smooth' });
    });
  }

  function displayResults(resourceIds) {
    if (!resultsDiv || !resourceDataObj) return;

    const timeline = resultsDiv.querySelector('.results-timeline');
    const contextP = resultsDiv.querySelector('.results-context');
    const totalTimeSpan = document.getElementById('totalTime');

    // Clear previous results
    timeline.innerHTML = '';

    // Set context
    const goalLabel = document.querySelector(`.finder-item[data-type="goal"][data-id="${selectedGoal}"] .finder-text`);
    const approachLabel = document.querySelector(`.finder-item[data-type="approach"][data-id="${selectedApproach}"] .finder-text`);
    contextP.textContent = `${goalLabel?.textContent} using ${approachLabel?.textContent}`;

    // Create resource cards
    resourceIds.forEach((id, index) => {
      const res = resourceDataObj.resources[id];
      if (!res) return;

      const card = document.createElement('div');
      card.className = 'resource-card';
      card.innerHTML = `
        <div class="resource-number">${index + 1}</div>
        <div class="resource-content">
          <div class="resource-header">
            <i class="${res.icon}"></i>
            <h4>${res.title}</h4>
          </div>
          <p class="resource-description">${res.description}</p>
          <a href="${res.link}" class="btn btn-link" target="${res.link.startsWith('http') ? '_blank' : '_self'}">
            ${res.link_text} <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      `;
      timeline.appendChild(card);
    });

    resultsDiv.style.display = 'block';
  }
  
  } // end initFinder
  
  // Run immediately since script is at bottom of body
  initFinder();
})();
