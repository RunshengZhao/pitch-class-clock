let notes,
  svg,
  selectedIndices = [],
  selectedPitches = [];

function updateButtonState() {
  const rotateLeft = document.getElementById("rotate-left");
  const rotateRight = document.getElementById("rotate-right");
  const enabled = selectedIndices.length > 0;
  rotateLeft.disabled = !enabled;
  rotateRight.disabled = !enabled;
}

window.addEventListener("DOMContentLoaded", () => {
  notes = document.querySelectorAll(".note");
  svg = document.getElementById("connections");

  positionNotes();

  notes.forEach((note, index) => {
    note.addEventListener("click", () => {
      const pitch = parseInt(note.getAttribute("data-pitch"));
      const idx = index;

      note.classList.toggle("selected");
      if (note.classList.contains("selected")) {
        selectedIndices.push(idx);
      } else {
        selectedIndices = selectedIndices.filter((i) => i !== idx);
      }

      if (selectedPitches.includes(pitch)) {
        selectedPitches = selectedPitches.filter((p) => p !== pitch);
      } else {
        selectedPitches.push(pitch);
      }
      document.querySelector(".scale-sheet").style.display = "flex";
      drawConnections();
      updateHighlightAndFilter();
      updateButtonState();
    });
  });
});

window.addEventListener("resize", positionNotes);

function positionNotes() {
  const clock = document.querySelector(".clock");
  // clientWidth/Height = content + padding, excludes border
  const w = clock.clientWidth;
  const h = clock.clientHeight;
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.min(w, h) / 2;

  notes.forEach((note, index) => {
    const angle = (index / 12) * 2 * Math.PI - Math.PI / 2;
    // compute the exact center point
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);

    // CSS is still doing transform: translate(-50%,-50%)
    note.style.left = `${x}px`;
    note.style.top = `${y}px`;

    // but if you need the raw center for SVG…
    note.dataset.x = x;
    note.dataset.y = y;
  });

  // sync your SVG grid to the same inner size
  svg.setAttribute("width", w);
  svg.setAttribute("height", h);

  drawConnections();
}

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
    line.setAttribute("stroke-width", 2);

    svg.appendChild(line);
  }
}

// Rotate Left button
document.getElementById("rotate-left").addEventListener("click", () => {
  selectedIndices = selectedIndices.map((i) => (i + 11) % 12);
  updateSelectionFromIndices();
  updateSelectedPitchesFromIndices();
  updateHighlightAndFilter();
  updateButtonState();
});

// Rotate Right button
document.getElementById("rotate-right").addEventListener("click", () => {
  selectedIndices = selectedIndices.map((i) => (i + 1) % 12);
  updateSelectionFromIndices();
  updateSelectedPitchesFromIndices();
  updateHighlightAndFilter();
  updateButtonState();
});

function updateSelectionFromIndices() {
  notes.forEach((note) => note.classList.remove("selected"));
  selectedIndices.forEach((i) => {
    notes[i].classList.add("selected");
  });
  drawConnections();
}
function updateSelectedPitchesFromIndices() {
  selectedPitches = selectedIndices.map((i) =>
    parseInt(notes[i].getAttribute("data-pitch"))
  );
}
function updateHighlightAndFilter() {
  document.querySelectorAll(".degree").forEach((cell) => {
    cell.classList.remove("highlight");
  });
  selectedPitches.forEach((pitch) => {
    document
      .querySelectorAll(`.degree[data-pitch="${pitch}"]`)
      .forEach((cell) => {
        if (cell.textContent.trim() !== "") {
          cell.classList.add("highlight");
        }
      });
  });
  document.querySelectorAll(".scale-row").forEach((row) => {
    const hasAllPitches = selectedPitches.every((pitch) => {
      const cell = row.querySelector(`.degree[data-pitch="${pitch}"]`);
      return cell && cell.textContent.trim() !== "";
    });
    row.style.display = hasAllPitches ? "flex" : "none";
  });
}
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
  updateButtonState();
});
