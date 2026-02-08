let notes;
let svg;
let selectedIndices = [];
let selectedPitches = [];
let anchorIndex = null;
const scaleGroupState = new Map();

const degreeLabels = [
  "1",
  "♭2",
  "2",
  "♯2/♭3",
  "3",
  "4",
  "♯4/♭5",
  "5",
  "♯5/♭6",
  "6",
  "♭7",
  "7"
];

const letterToPitch = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11
};

function validateData() {
  const issues = [];

  if (!Array.isArray(notesData) || notesData.length !== 12) {
    issues.push("notesData must be an array of 12 items");
  } else {
    const pitches = notesData.map((note) => note.pitch);
    const uniquePitches = new Set(pitches);
    if (uniquePitches.size !== 12) {
      issues.push("notesData pitch values must be unique");
    }
    const invalidPitch = pitches.find((pitch) =>
      typeof pitch !== "number" || pitch < 0 || pitch > 11
    );
    if (invalidPitch !== undefined) {
      issues.push("notesData pitch values must be between 0 and 11");
    }
  }

  if (!Array.isArray(scalesData) || scalesData.length === 0) {
    issues.push("scalesData must be a non-empty array");
  } else {
    scalesData.forEach((scale, index) => {
      if (!scale || typeof scale !== "object") {
        issues.push(`scalesData[${index}] is not an object`);
        return;
      }

      if (typeof scale.className !== "string" || scale.className.trim() === "") {
        issues.push(`scalesData[${index}] is missing className`);
      } else if (scale.className !== scale.className.toLowerCase()) {
        issues.push(
          `scalesData[${index}] className should be lowercase: ${scale.className}`
        );
      }

      if (typeof scale.label !== "string" || scale.label.trim() === "") {
        issues.push(`scalesData[${index}] is missing label`);
      }

      if (!Array.isArray(scale.degrees) || scale.degrees.length !== 12) {
        issues.push(`scalesData[${index}] degrees must have length 12`);
      }
    });
  }

  if (issues.length > 0) {
    console.warn("Pitch Class Clock data validation issues:");
    issues.forEach((issue) => console.warn(`- ${issue}`));
  }
}

function updateButtonState() {
  const rotateLeft = document.getElementById("rotate-left");
  const rotateRight = document.getElementById("rotate-right");
  const enabled = selectedIndices.length > 0;
  rotateLeft.disabled = !enabled;
  rotateRight.disabled = !enabled;
}

function getRotateStep(direction, rotateByNoteEnabled) {
  if (!rotateByNoteEnabled || selectedIndices.length < 2) {
    return 1;
  }

  const unique = [...new Set(selectedIndices)].sort((a, b) => a - b);
  const root = unique.includes(0) ? 0 : unique[0];
  const rootIndex = unique.indexOf(root);
  const nextIndex = unique[(rootIndex + 1) % unique.length];
  const prevIndex = unique[(rootIndex - 1 + unique.length) % unique.length];

  if (direction === "left") {
    const step = (nextIndex - root + 12) % 12;
    return step === 0 ? 1 : step;
  }

  const step = (root - prevIndex + 12) % 12;
  return step === 0 ? 1 : step;
}

function resetSelectionState() {
  selectedIndices = [];
  selectedPitches = [];
  anchorIndex = null;

  document.querySelectorAll(".note").forEach((note) => {
    note.classList.remove("selected");
  });

  document.querySelectorAll(".degree").forEach((cell) => {
    cell.classList.remove("highlight");
  });

  document.querySelectorAll(".scale-row").forEach((row) => {
    row.style.display = "none";
  });

  document.querySelector(".scale-sheet").style.display = "none";

  drawConnections();
  updateButtonState();
}

function buildNotesMarkup() {
  return notesData
    .map(
      (note) =>
        `<div class="note" data-pitch="${note.pitch}">${note.label}</div>`
    )
    .join("");
}

function parseScaleGroup(label) {
  const match = label.match(/\bof\s+([^:]+):/i);
  if (!match) return null;
  const name = match[1].trim();
  const key = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return { key, name };
}

function countScaleNotes(scale) {
  if (!scale || !Array.isArray(scale.degrees)) return 0;
  return scale.degrees.filter((degree) => degree.trim() !== "").length;
}

function getNoteGroupLabel(count) {
  switch (count) {
    case 5:
      return "Pentatonic";
    case 6:
      return "Hexatonic";
    case 7:
      return "Heptatonic";
    case 8:
      return "Octatonic";
    case 9:
      return "Enneatonic";
    default:
      return `${count}-Note`;
  }
}

function getGroupHeaderLabel(scaleLabel, groupName) {
  if (!scaleLabel) return `1 of ${groupName}`;
  const prefix = scaleLabel.split(":")[0]?.trim();
  if (prefix && prefix.toLowerCase().includes(`of ${groupName}`.toLowerCase())) {
    return prefix;
  }
  return `1 of ${groupName}`;
}

function buildScaleRowMarkup(scale, options = {}) {
  const {
    labelOverride,
    extraClasses = "",
    dataAttrs = {},
    includeToggle = false
  } = options;
  const degreesMarkup = scale.degrees
    .map(
      (degree, index) =>
        `<span class="degree" data-pitch="${index}">${degree}</span>`
    )
    .join("");

  const dataAttrMarkup = Object.entries(dataAttrs)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");

  const labelText = labelOverride ?? scale.label;
  const toggleMarkup = includeToggle
    ? `<span class="scale-toggle-icon" aria-hidden="true">▸</span>`
    : "";

  return `
    <div class="scale-row ${scale.className} ${extraClasses}" ${dataAttrMarkup}>
      <div class="scale-label">
        ${toggleMarkup}
        <span class="scale-label-text">${labelText}</span>
      </div>
      ${degreesMarkup}
    </div>
  `;
}

function buildScaleSheetMarkup() {
  const groups = new Map();
  const sequence = [];
  const noteGroups = new Map();
  const emptyDegrees = new Array(12).fill("");

  scalesData.forEach((scale) => {
    const groupInfo = parseScaleGroup(scale.label);
    if (!groupInfo) {
      const noteCount = countScaleNotes(scale);
      const label = getNoteGroupLabel(noteCount);
      if (!noteGroups.has(noteCount)) {
        noteGroups.set(noteCount, {
          count: noteCount,
          key: `note-${noteCount}`,
          label,
          headerScale: scale,
          rows: []
        });
      }
      noteGroups.get(noteCount).rows.push(scale);
      return;
    }

    const { key, name } = groupInfo;
    if (!groups.has(key)) {
      groups.set(key, { key, name, rows: [] });
      sequence.push({ type: "group", key });
    }
    groups.get(key).rows.push(scale);
  });

  const markup = sequence
    .map((item) => {
      if (item.type === "solo") {
        return buildScaleRowMarkup(item.scale, {
          dataAttrs: { "data-role": "solo" }
        });
      }

      const group = groups.get(item.key);
      if (!group) return "";
      const headerScale = {
        className: `group-${group.key}`,
        label: group.name,
        degrees: emptyDegrees
      };
      const headerMarkup = buildScaleRowMarkup(headerScale, {
        labelOverride: group.name,
        extraClasses: "scale-group-header mode-family-header",
        dataAttrs: {
          "data-group": group.key,
          "data-role": "group-header"
        },
        includeToggle: true
      });

      const itemsMarkup = group.rows
        .map((scale) =>
          buildScaleRowMarkup(scale, {
            extraClasses: "scale-group-item",
            dataAttrs: {
              "data-group": group.key,
              "data-role": "group-item"
            }
          })
        )
        .join("");

      return `
        <div class="scale-group" data-group="${group.key}" data-expanded="false">
          ${headerMarkup}
          <div class="scale-group-list" id="scale-group-${group.key}">
            ${itemsMarkup}
          </div>
        </div>
      `;
    })
    .join("");

  const noteGroupOrder = [5, 6, 7, 8];
  const noteGroupMarkup = [];
  const usedCounts = new Set();

  noteGroupOrder.forEach((count) => {
    const group = noteGroups.get(count);
    if (!group) return;
    usedCounts.add(count);
    const headerScale = {
      className: `note-group-${group.key}`,
      label: group.label,
      degrees: emptyDegrees
    };
    const headerMarkup = buildScaleRowMarkup(headerScale, {
      labelOverride: group.label,
      extraClasses: "scale-group-header note-count-header",
      dataAttrs: {
        "data-group": group.key,
        "data-role": "group-header"
      },
      includeToggle: true
    });
    const itemsMarkup = group.rows
      .map((scale) =>
        buildScaleRowMarkup(scale, {
          extraClasses: "scale-group-item",
          dataAttrs: {
            "data-group": group.key,
            "data-role": "group-item"
          }
        })
      )
      .join("");
    noteGroupMarkup.push(`
      <div class="scale-group" data-group="${group.key}" data-expanded="false">
        ${headerMarkup}
        <div class="scale-group-list" id="scale-group-${group.key}">
          ${itemsMarkup}
        </div>
      </div>
    `);
  });

  [...noteGroups.keys()]
    .filter((count) => !usedCounts.has(count))
    .sort((a, b) => a - b)
    .forEach((count) => {
      const group = noteGroups.get(count);
      if (!group) return;
      const headerScale = {
        className: `note-group-${group.key}`,
        label: group.label,
        degrees: emptyDegrees
      };
      const headerMarkup = buildScaleRowMarkup(headerScale, {
        labelOverride: group.label,
        extraClasses: "scale-group-header note-count-header",
        dataAttrs: {
          "data-group": group.key,
          "data-role": "group-header"
        },
        includeToggle: true
      });
      const itemsMarkup = group.rows
        .map((scale) =>
          buildScaleRowMarkup(scale, {
            extraClasses: "scale-group-item",
            dataAttrs: {
              "data-group": group.key,
              "data-role": "group-item"
            }
          })
        )
        .join("");
      noteGroupMarkup.push(`
        <div class="scale-group" data-group="${group.key}" data-expanded="false">
          ${headerMarkup}
          <div class="scale-group-list" id="scale-group-${group.key}">
            ${itemsMarkup}
          </div>
        </div>
      `);
    });

  const allHeaderScale = {
    className: "all-scales",
    label: "All Scales",
    degrees: degreeLabels
  };
  const allHeaderMarkup = buildScaleRowMarkup(allHeaderScale, {
    labelOverride: "All Scales",
    extraClasses: "scale-group-header scale-sheet-header",
    dataAttrs: { "data-role": "all-header" },
    includeToggle: true
  });

  return `${allHeaderMarkup}${markup}${noteGroupMarkup.join("")}`;
}

function normalizeNoteToken(token) {
  return token
    .trim()
    .replace(/♯/g, "#")
    .replace(/♭/g, "b")
    .toUpperCase();
}

function parseNoteToPitch(token) {
  if (!token) return null;
  const normalized = normalizeNoteToken(token);
  const letter = normalized[0];
  if (!letterToPitch[letter] && letter !== "C") return null;

  let pitch = letterToPitch[letter];
  const accidental = normalized.slice(1);
  if (accidental === "#" || accidental === "SHARP") {
    pitch += 1;
  } else if (accidental === "B" || accidental === "FLAT") {
    pitch -= 1;
  } else if (accidental === "##" || accidental === "X") {
    pitch += 2;
  } else if (accidental === "BB") {
    pitch -= 2;
  } else if (accidental !== "") {
    return null;
  }

  return (pitch + 12) % 12;
}

function calcDegreesFromInput(input) {
  const trimmed = input.trim();
  const rawTokens = trimmed
    .split(/[\s,-]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);

  if (rawTokens.length === 0) {
    return { error: "Enter at least one note.", degrees: [] };
  }

  const pitches = rawTokens.map(parseNoteToPitch);
  if (pitches.some((pitch) => pitch === null)) {
    return {
      error:
        "Invalid note format. Use letters A-G with optional # or b, e.g. C-E-G-B.",
      degrees: []
    };
  }

  const root = pitches[0];
  const offsets = pitches.map((pitch) => (pitch - root + 12) % 12);
  const uniqueOffsets = [...new Set(offsets)];
  const degrees = uniqueOffsets.map((offset) => degreeLabels[offset]);

  return { error: null, degrees, offsets: uniqueOffsets };
}

function positionNotes() {
  const clock = document.querySelector(".clock");
  if (!clock || !notes || !svg) return;

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

function renderConnectionsFromSegments(segments) {
  if (!svg) return;
  svg.innerHTML = "";
  if (!segments || segments.length < 2) return;

  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  group.setAttribute("id", "connection-group");

  segments.forEach((segment) => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.classList.add("connection-line");
    line.setAttribute("x1", segment.x1);
    line.setAttribute("y1", segment.y1);
    line.setAttribute("x2", segment.x2);
    line.setAttribute("y2", segment.y2);
    line.setAttribute("stroke", "#C87C68");
    line.setAttribute("stroke-width", 2);
    group.appendChild(line);
  });

  svg.appendChild(group);
}

function drawConnections() {
  renderConnectionsFromSegments(getLineSegmentsFromIndices(selectedIndices));
}

function updateSelectionFromIndices(drawLines = true) {
  notes.forEach((note) => note.classList.remove("selected"));
  selectedIndices.forEach((i) => {
    notes[i].classList.add("selected");
  });
  if (drawLines) drawConnections();
}

function getOrderedIndices(indices) {
  const unique = [...new Set(indices)].sort((a, b) => a - b);
  if (unique.length === 0) return unique;

  if (anchorIndex === null || !unique.includes(anchorIndex)) {
    anchorIndex = unique[0];
  }

  const anchorPos = unique.indexOf(anchorIndex);
  if (anchorPos <= 0) return unique;

  return unique.slice(anchorPos).concat(unique.slice(0, anchorPos));
}

function getLineSegmentsFromIndices(indices) {
  if (!svg || !indices || indices.length < 2) return [];
  const ordered = getOrderedIndices(indices);
  const segments = [];

  for (let i = 0; i < ordered.length; i++) {
    const from = notes[ordered[i]];
    const to = notes[ordered[(i + 1) % ordered.length]];
    segments.push({
      x1: Number(from.dataset.x),
      y1: Number(from.dataset.y),
      x2: Number(to.dataset.x),
      y2: Number(to.dataset.y)
    });
  }

  return segments;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function animateLineGroupRotation(angleDeg, duration = 240) {
  return new Promise((resolve) => {
    if (!svg) {
      resolve();
      return;
    }

    const group = svg.querySelector("#connection-group");
    if (!group) {
      resolve();
      return;
    }

    const width = Number(svg.getAttribute("width")) || svg.clientWidth || 0;
    const height = Number(svg.getAttribute("height")) || svg.clientHeight || 0;
    const cx = width / 2;
    const cy = height / 2;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const angle = lerp(0, angleDeg, t);
      group.setAttribute("transform", `rotate(${angle} ${cx} ${cy})`);

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        group.removeAttribute("transform");
        resolve();
      }
    };

    requestAnimationFrame(tick);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function rotateOnce(direction) {
  if (direction === "left") {
    selectedIndices = selectedIndices.map((i) => (i + 11) % 12);
    if (anchorIndex !== null) {
      anchorIndex = (anchorIndex + 11) % 12;
    }
    return;
  }
  selectedIndices = selectedIndices.map((i) => (i + 1) % 12);
  if (anchorIndex !== null) {
    anchorIndex = (anchorIndex + 1) % 12;
  }
}

async function animateRotation(direction, steps) {
  if (animateRotation.isRunning) return;
  animateRotation.isRunning = true;

  const baseDuration = 420;
  const lineDuration = Math.min(baseDuration + steps * 140, 1200);

  const beforeSegments = getLineSegmentsFromIndices(selectedIndices);
  renderConnectionsFromSegments(beforeSegments);
  const angleDeg = (direction === "right" ? steps : -steps) * 30;
  await animateLineGroupRotation(angleDeg, lineDuration);

  const delta = direction === "right" ? steps : (12 - steps) % 12;
  selectedIndices = selectedIndices.map((i) => (i + delta) % 12);
  if (anchorIndex !== null) {
    anchorIndex = (anchorIndex + delta) % 12;
  }

  updateSelectionFromIndices(false);
  updateSelectedPitchesFromIndices();
  document.querySelector(".scale-sheet").style.display = "flex";
  updateHighlightAndFilter();

  const afterSegments = getLineSegmentsFromIndices(selectedIndices);
  renderConnectionsFromSegments(afterSegments);

  updateButtonState();
  animateRotation.isRunning = false;
}

function updateSelectedPitchesFromIndices() {
  selectedPitches = selectedIndices.map((i) =>
    parseInt(notes[i].getAttribute("data-pitch"))
  );
}

function updateHighlightAndFilter() {
  const allHeader = document.querySelector('[data-role="all-header"]');
  if (allHeader) {
    allHeader.style.display = "flex";
  }
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

  const rowMatches = new Map();
  document.querySelectorAll(".scale-row").forEach((row) => {
    const hasAllPitches = selectedPitches.every((pitch) => {
      const cell = row.querySelector(`.degree[data-pitch="${pitch}"]`);
      return cell && cell.textContent.trim() !== "";
    });
    rowMatches.set(row, hasAllPitches);
  });

  document.querySelectorAll(".scale-group").forEach((groupEl) => {
    const header = groupEl.querySelector(".scale-group-header");
    const items = groupEl.querySelectorAll(".scale-group-item");
    const headerMatch = header ? rowMatches.get(header) : false;
    let anyItemMatch = false;
    items.forEach((item) => {
      if (rowMatches.get(item)) {
        anyItemMatch = true;
      }
    });

    const groupMatch = headerMatch || anyItemMatch;
    const groupKey = groupEl.dataset.group;
    const expanded = scaleGroupState.get(groupKey) ?? false;

    if (header) {
      header.style.display = groupMatch ? "flex" : "none";
    }

    items.forEach((item) => {
      item.style.display =
        groupMatch && expanded && rowMatches.get(item) ? "flex" : "none";
    });
  });

  document
    .querySelectorAll('.scale-row[data-role="solo"]')
    .forEach((row) => {
      row.style.display = rowMatches.get(row) ? "flex" : "none";
    });
}

function setAllGroupsExpanded(expanded) {
  document.querySelectorAll(".scale-group").forEach((groupEl) => {
    const key = groupEl.dataset.group;
    scaleGroupState.set(key, expanded);
    groupEl.dataset.expanded = expanded ? "true" : "false";
    const header = groupEl.querySelector(".scale-group-header");
    if (header) {
      header.setAttribute("aria-expanded", expanded ? "true" : "false");
    }
  });
  updateHighlightAndFilter();
}

function syncAllHeaderState() {
  const header = document.querySelector('[data-role="all-header"]');
  if (!header) return;
  const groups = [...document.querySelectorAll(".scale-group")];
  const allExpanded = groups.every(
    (group) => group.dataset.expanded === "true"
  );
  header.setAttribute("aria-expanded", allExpanded ? "true" : "false");
}

function init() {
  validateData();

  const clock = document.querySelector(".clock");
  clock.insertAdjacentHTML("beforeend", buildNotesMarkup());

  const scaleSheet = document.querySelector(".scale-sheet");
  scaleSheet.innerHTML = buildScaleSheetMarkup();
  document.querySelectorAll(".scale-group").forEach((groupEl) => {
    const key = groupEl.dataset.group;
    if (!scaleGroupState.has(key)) {
      scaleGroupState.set(key, false);
    }
    const expanded = scaleGroupState.get(key);
    groupEl.dataset.expanded = expanded ? "true" : "false";
    const header = groupEl.querySelector(".scale-group-header");
    if (header) {
      header.setAttribute("role", "button");
      header.setAttribute("tabindex", "0");
      header.setAttribute("aria-expanded", expanded ? "true" : "false");
    }
  });

  document.querySelectorAll(".scale-group-header").forEach((header) => {
    if (header.dataset.role === "all-header") {
      return;
    }
    const toggleGroup = () => {
      const groupEl = header.closest(".scale-group");
      if (!groupEl) return;
      const key = groupEl.dataset.group;
      const nextState = !(scaleGroupState.get(key) ?? false);
      scaleGroupState.set(key, nextState);
      groupEl.dataset.expanded = nextState ? "true" : "false";
      header.setAttribute("aria-expanded", nextState ? "true" : "false");
      updateHighlightAndFilter();
      syncAllHeaderState();
    };

    header.addEventListener("click", toggleGroup);
    header.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleGroup();
      }
    });
  });

  const allHeader = document.querySelector('[data-role="all-header"]');
  if (allHeader) {
    const toggleAll = () => {
      const groups = [...document.querySelectorAll(".scale-group")];
      const allExpanded = groups.every(
        (group) => group.dataset.expanded === "true"
      );
      setAllGroupsExpanded(!allExpanded);
      syncAllHeaderState();
    };
    allHeader.setAttribute("role", "button");
    allHeader.setAttribute("tabindex", "0");
    allHeader.addEventListener("click", toggleAll);
    allHeader.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleAll();
      }
    });
  }
  syncAllHeaderState();

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
      anchorIndex = null;
      document.querySelector(".scale-sheet").style.display = "flex";
      drawConnections();
      updateHighlightAndFilter();
      updateButtonState();
    });
  });

  document.getElementById("rotate-left").addEventListener("click", () => {
    const rotateByNoteEnabled =
      document.getElementById("rotate-by-note")?.checked ?? false;
    const step = getRotateStep("left", rotateByNoteEnabled);
    animateRotation("left", step);
  });

  document.getElementById("rotate-right").addEventListener("click", () => {
    const rotateByNoteEnabled =
      document.getElementById("rotate-by-note")?.checked ?? false;
    const step = getRotateStep("right", rotateByNoteEnabled);
    animateRotation("right", step);
  });

  document.getElementById("reset").addEventListener("click", () => {
    resetSelectionState();
  });

  const noteInput = document.getElementById("note-input");
  const applyNotes = document.getElementById("apply-notes");

  const applyNotesFromInput = () => {
    const { error, degrees, offsets } = calcDegreesFromInput(
      noteInput.value
    );

    if (error) {
      noteInput.setCustomValidity(error);
      noteInput.reportValidity();
      return;
    }

    noteInput.setCustomValidity("");

    selectedIndices = offsets;
    anchorIndex = null;
    updateSelectionFromIndices();
    updateSelectedPitchesFromIndices();
    document.querySelector(".scale-sheet").style.display = "flex";
    updateHighlightAndFilter();
    updateButtonState();
  };

  applyNotes.addEventListener("click", applyNotesFromInput);

  noteInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyNotesFromInput();
    }
  });

  noteInput.addEventListener("input", () => {
    noteInput.setCustomValidity("");
  });

  updateButtonState();
}

window.addEventListener("DOMContentLoaded", () => {
  init();
  window.addEventListener("resize", positionNotes);
});
