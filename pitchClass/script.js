let notes;
let svg;
let selectedIndices = [];

window.addEventListener("DOMContentLoaded", () => {
  const clock = document.querySelector(".clock");
  notes = document.querySelectorAll(".note");
  svg = document.getElementById("connections");

  const clockRect = clock.getBoundingClientRect();
  const centerX = clockRect.width / 2;
  const centerY = clockRect.height / 2;
  const radius = 300;

  notes.forEach((note, index) => {
    angle = (index / 12) * 2 * Math.PI - Math.PI / 2;

    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    note.style.left = `${x}px`;
    note.style.top = `${y}px`;

    note.dataset.index = index; // store index for sorting
    note.dataset.x = x;
    note.dataset.y = y;

    note.addEventListener("click", () => {
      const index = parseInt(note.dataset.index);
      note.classList.toggle("selected");

      if (note.classList.contains("selected")) {
        selectedIndices.push(index);
      } else {
        selectedIndices = selectedIndices.filter((i) => i !== index);
      }

      drawConnections();
    });
  });
});

function drawConnections() {
  svg.innerHTML = "";

  if (selectedIndices.length < 2) return;

  // Sort indices clockwise
  const sorted = [...selectedIndices].sort((a, b) => a - b);

  // Map to actual DOM elements and draw lines
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

document.getElementById("rotate-left").addEventListener("click", () => {
  selectedIndices = selectedIndices.map((i) => (i + 11) % 12); // -1 mod 12
  updateSelectionFromIndices();
});

document.getElementById("rotate-right").addEventListener("click", () => {
  selectedIndices = selectedIndices.map((i) => (i + 1) % 12); // +1 mod 12
  updateSelectionFromIndices();
});

document.getElementById("reset").addEventListener("click", () => {
  selectedIndices = [];

  notes.forEach((note) => {
    note.classList.remove("selected");
  });

  drawConnections();
});

function updateSelectionFromIndices() {
  notes.forEach((note) => {
    note.classList.remove("selected");
  });

  selectedIndices.forEach((i) => {
    notes[i].classList.add("selected");
  });

  drawConnections();
}
