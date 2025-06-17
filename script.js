let notes;
let svg;
let selectedIndices = [];
let selectedPitches = [];

window.addEventListener("DOMContentLoaded", () => {
  const clock = document.querySelector(".clock");
  notes = document.querySelectorAll(".note");
  svg = document.getElementById("connections");

  const clockRect = clock.getBoundingClientRect();
  const centerX = clockRect.width / 2;
  const centerY = clockRect.height / 2;
  const radius = 300;

  notes.forEach((note, index) => {
    const angle = (index / 12) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    note.style.left = `${x}px`;
    note.style.top = `${y}px`;

    note.dataset.index = index;
    note.dataset.x = x;
    note.dataset.y = y;

    // Click to toggle note selection
    note.addEventListener("click", () => {
      const pitch = parseInt(note.getAttribute("data-pitch"));
      const index = parseInt(note.dataset.index);

      note.classList.toggle("selected");

      // Update selectedIndices
      if (note.classList.contains("selected")) {
        selectedIndices.push(index);
      } else {
        selectedIndices = selectedIndices.filter((i) => i !== index);
      }

      // Update selectedPitches
      if (selectedPitches.includes(pitch)) {
        selectedPitches = selectedPitches.filter((p) => p !== pitch);
      } else {
        selectedPitches.push(pitch);
      }
      // 👇 Show the scale sheet on any click
      document.querySelector(".scale-sheet").style.display = "flex";

      drawConnections();
      updateHighlightAndFilter();
    });
  });
});

// Draw connection lines between selected notes
function drawConnections() {
  svg.innerHTML = "";

  if (selectedIndices.length < 2) return;

  const sorted = [...selectedIndices].sort((a, b) => a - b);

  for (let i = 0; i < sorted.length; i++) {
    const from = notes[sorted[i]];
    const to = notes[sorted[(i + 1) % sorted.length]];

    const x1 = from.dataset.x;
    const y1 = from.dataset.y;
    const x2 = to.dataset.x;
    const y2 = to.dataset.y;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", "#C87C68");
    line.setAttribute("stroke-width", "2");

    svg.appendChild(line);
  }
}

// Rotate Left button
document.getElementById("rotate-left").addEventListener("click", () => {
  selectedIndices = selectedIndices.map((i) => (i + 11) % 12);
  updateSelectionFromIndices();
  updateSelectedPitchesFromIndices(); // sync pitches
  updateHighlightAndFilter();
});

// Rotate Right button
document.getElementById("rotate-right").addEventListener("click", () => {
  selectedIndices = selectedIndices.map((i) => (i + 1) % 12);
  updateSelectionFromIndices();
  updateSelectedPitchesFromIndices(); // sync pitches
  updateHighlightAndFilter();
});

// Re-apply .selected class after rotation
function updateSelectionFromIndices() {
  notes.forEach((note) => note.classList.remove("selected"));

  selectedIndices.forEach((i) => {
    notes[i].classList.add("selected");
  });

  drawConnections();
}

// Generate selectedPitches from selectedIndices
function updateSelectedPitchesFromIndices() {
  selectedPitches = selectedIndices.map((i) =>
    parseInt(notes[i].getAttribute("data-pitch"))
  );
}

// Highlight matching scale cells and show matching rows
function updateHighlightAndFilter() {
  // Clear previous highlights
  document.querySelectorAll(".degree").forEach((cell) => {
    cell.classList.remove("highlight");
  });

  // Highlight matching degrees
  selectedPitches.forEach((pitch) => {
    document
      .querySelectorAll(`.degree[data-pitch="${pitch}"]`)
      .forEach((cell) => {
        if (cell.textContent.trim() !== "") {
          cell.classList.add("highlight");
        }
      });
  });

  // Filter visible rows: only show those that contain ALL selected pitches
  document.querySelectorAll(".scale-row").forEach((row) => {
    const hasAllPitches = selectedPitches.every((pitch) => {
      const cell = row.querySelector(`.degree[data-pitch="${pitch}"]`);
      return cell && cell.textContent.trim() !== "";
    });
    row.style.display = hasAllPitches ? "flex" : "none";
  });
}

// Reset all selections and highlights
document.getElementById("reset").addEventListener("click", () => {
  selectedIndices = [];
  selectedPitches = [];

  document.querySelectorAll(".note").forEach((note) => {
    note.classList.remove("selected");
  });

  document.querySelectorAll(".degree").forEach((cell) => {
    cell.classList.remove("highlight");
  });

  document.querySelectorAll(".scale-row").forEach((row) => {
    row.style.display = "none";
  });

  drawConnections();
});
