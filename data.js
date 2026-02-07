const notesData = [
  { pitch: 0, label: "1" },
  { pitch: 1, label: "♭2" },
  { pitch: 2, label: "2" },
  { pitch: 3, label: "♯2/♭3" },
  { pitch: 4, label: "3" },
  { pitch: 5, label: "4" },
  { pitch: 6, label: "♯4/♭5" },
  { pitch: 7, label: "5" },
  { pitch: 8, label: "♯5/♭6" },
  { pitch: 9, label: "6" },
  { pitch: 10, label: "♭7" },
  { pitch: 11, label: "7" }
];

const scalesData = [
  {
    className: "major",
    label: "1 of Major: Ionian",
    degrees: ["1", "", "2", "", "3", "4", "", "5", "", "6", "", "7"]
  },
  {
    className: "dorian",
    label: "2 of Major: Dorian",
    degrees: ["1", "", "2", "♭3", "", "4", "", "5", "", "6", "♭7", ""]
  },
  {
    className: "phrygian",
    label: "3 of Major: Phrygian",
    degrees: ["1", "♭2", "", "♭3", "", "4", "", "5", "♭6", "", "♭7", ""]
  },
  {
    className: "lydian",
    label: "4 of Major: Lydian",
    degrees: ["1", "", "2", "", "3", "", "♯4", "5", "", "6", "", "7"]
  },
  {
    className: "mixolydian",
    label: "5 of Major: Mixolydian",
    degrees: ["1", "", "2", "", "3", "4", "", "5", "", "6", "♭7", ""]
  },
  {
    className: "aeolian",
    label: "6 of Major: Aeolian",
    degrees: ["1", "", "2", "♭3", "", "4", "", "5", "♭6", "", "♭7", ""]
  },
  {
    className: "aeolian",
    label: "7 of Major: Locrian",
    degrees: ["1", "♭2", "", "♭3", "", "4", "♭5", "", "♭6", "", "♭7", ""]
  },
  {
    className: "harmonicminor1",
    label: "1 of Harmonic Minor: Harmonic Minor",
    degrees: ["1", "", "2", "♭3", "", "4", "", "5", "♭6", "", "", "7"]
  },
  {
    className: "harmonicminor2",
    label: "2 of Harmonic Minor: Locrian ♮6",
    degrees: ["1", "♭2", "", "♭3", "", "4", "♭5", "", "", "6", "♭7", ""]
  },
  {
    className: "harmonicminor3",
    label: "3 of Harmonic Minor: Ionian ♯5",
    degrees: ["1", "", "2", "", "3", "4", "", "", "♯5", "6", "", "7"]
  },
  {
    className: "harmonicminor4",
    label: "4 of Harmonic Minor: Dorian ♯4",
    degrees: ["1", "", "2", "♭3", "", "", "♯4", "5", "", "6", "♭7", ""]
  },
  {
    className: "harmonicminor5",
    label: "5 of Harmonic Minor: Phrygian-Dominant",
    degrees: ["1", "♭2", "", "", "3", "4", "", "5", "♭6", "", "♭7", ""]
  },
  {
    className: "harmonicminor6",
    label: "6 of Harmonic Minor: Lydian ♯9",
    degrees: ["1", "", "", "♯2", "3", "", "♯4", "5", "", "6", "", "7"]
  },
  {
    className: "harmonicminor7",
    label: "7 of Harmonic Minor: Altered °7/Ultralocrian",
    degrees: ["1", "♭2", "", "♭3", "♭4", "", "♭5", "", "♭6", "°7", "", ""]
  },
  {
    className: "melodicminor1",
    label: "1 of Melodic Minor: Melodic Minor",
    degrees: ["1", "", "2", "♭3", "", "4", "", "5", "", "6", "", "7"]
  },
  {
    className: "melodicminor2",
    label: "2 of Melodic Minor: Phrygian ♮6 / Dorian ♭2",
    degrees: ["1", "♭2", "", "♭3", "", "4", "", "5", "", "6", "♭7", ""]
  },
  {
    className: "melodicminor3",
    label: "3 of Melodic Minor: Lydian-Augmented",
    degrees: ["1", "", "2", "", "3", "", "♯4", "", "♯5", "6", "", "7"]
  },
  {
    className: "melodicminor4",
    label: "4 of Melodic Minor: Lydian-Dominant",
    degrees: ["1", "", "2", "", "3", "", "♯4", "5", "", "6", "♭7", ""]
  },
  {
    className: "melodicminor5",
    label: "5 of Melodic Minor: Mixolydian ♭6/Aeolian-Major",
    degrees: ["1", "", "2", "", "3", "4", "", "5", "♭6", "", "♭7", ""]
  },
  {
    className: "melodicminor6",
    label: "6 of Melodic Minor: Locrian ♮2",
    degrees: ["1", "", "2", "♭3", "", "4", "♭5", "", "♭6", "", "♭7", ""]
  },
  {
    className: "melodicminor7",
    label: "7 of Melodic Minor: Altered/Super-Locrian",
    degrees: ["1", "♭2", "", "♭3", "♭4", "", "♭5", "", "♭6", "", "♭7", ""]
  },
  {
    className: "harmonicmajor1",
    label: "1 of Harmonic Major: Harmonic-Major",
    degrees: ["1", "", "2", "", "3", "4", "", "5", "♭6", "", "", "7"]
  },
  {
    className: "harmonicmajor2",
    label: "2 of Harmonic Major: Locrian ♮2 ♮6",
    degrees: ["1", "", "2", "♭3", "", "4", "♭5", "", "", "6", "♭7", ""]
  },
  {
    className: "harmonicmajor3",
    label: "3 of Harmonic Major: Altered ♮5",
    degrees: ["1", "♭2", "", "♭3", "♭4", "", "", "5", "♭6", "", "♭7", ""]
  },
  {
    className: "harmonicmajor4",
    label: "4 of Harmonic Major: Lydian-Minor/Melodic Min ♯4",
    degrees: ["1", "", "2", "♭3", "", "", "♯4", "5", "", "6", "", "7"]
  },
  {
    className: "harmonicmajor5",
    label: "5 of Harmonic Major: Mixolydian ♭2",
    degrees: ["1", "♭2", "", "", "3", "4", "", "5", "", "6", "♭7", ""]
  },
  {
    className: "harmonicmajor6",
    label: "6 of Harmonic Major: Lydian-Aug ♯2",
    degrees: ["1", "", "", "♯2", "3", "", "♯4", "", "♯5", "6", "", "7"]
  },
  {
    className: "harmonicmajor7",
    label: "7 of Harmonic Major: Locrian °7",
    degrees: ["1", "♭2", "", "♭3", "", "4", "♭5", "", "♭6", "°7", "", ""]
  },
  {
    className: "hungarianminor1",
    label: "1 of Hungarian Minor: Dbl. Harmonic Minor",
    degrees: ["1", "", "2", "♭3", "", "", "♯4", "5", "♭6", "", "", "7"]
  },
  {
    className: "hungarianminor2",
    label: "2 of Hungarian Minor: Mixolydian ♭5 ♭2",
    degrees: ["1", "♭2", "", "", "3", "4", "♭5", "", "", "6", "♭7", ""]
  },
  {
    className: "hungarianminor3",
    label: "3 of Hungarian Minor: Ionian ♯5 ♯2",
    degrees: ["1", "", "", "♯2", "3", "4", "", "", "♯5", "6", "", "7"]
  },
  {
    className: "hungarianminor4",
    label: "4 of Hungarian Minor: Locrian °3 °7",
    degrees: ["1", "♭2", "°3", "", "", "4", "♭5", "", "♭6", "°7", "", ""]
  },
  {
    className: "hungarianminor5",
    label: "5 of Hungarian Minor: Dbl. Harmonic Major",
    degrees: ["1", "♭2", "", "", "3", "4", "", "5", "♭6", "", "", "7"]
  },
  {
    className: "hungarianminor6",
    label: "6 of Hungarian Minor: Lydian ♯2 ♯6",
    degrees: ["1", "", "", "♯2", "3", "", "♯4", "5", "", "", "♯6", "7"]
  },
  {
    className: "hungarianminor7",
    label: "7 of Hungarian Minor: Ultralocrian ♮5",
    degrees: ["1", "♭2", "", "♭3", "♭4", "", "", "5", "♭6", "°7", "", ""]
  },
  {
    className: "wholehalfdiminished",
    label: "Whole-Half Diminished",
    degrees: ["1", "", "2", "♭3", "", "4", "♭5", "", "♭6", "°7", "", "7"]
  },
  {
    className: "halfwholediminished",
    label: "Half-Whole Diminished",
    degrees: ["1", "♭2", "", "♯2", "3", "", "♯4", "5", "", "6", "♭7", ""]
  },
  {
    className: "wholetone",
    label: "Whole Tone",
    degrees: ["1", "", "2", "", "3", "", "♯4", "", "♯5", "", "♭7", ""]
  },
  {
    className: "augmentedmode1",
    label: "Augmented Scale (starting with ♯2)",
    degrees: ["1", "", "", "♯2", "3", "", "", "5", "♭6", "", "", "7"]
  },
  {
    className: "augmentedmode2",
    label: "Augmented Scale (starting with ♭2)",
    degrees: ["1", "♭2", "", "", "3", "4", "", "", "♯5", "6", "", ""]
  },
  {
    className: "tritonescale",
    label: "Tritone Scale",
    degrees: ["1", "♭2", "", "", "3", "", "♯4", "5", "", "", "♭7", ""]
  },
  {
    className: "tritonemode2",
    label: "Tritone Scale (mode 2-“Petrushka”)",
    degrees: ["1", "", "", "♯2", "", "4", "♭5", "", "", "6", "", "7"]
  },
  {
    className: "tritonemode3",
    label: "Tritone Scale (mode 3)",
    degrees: ["1", "", "2", "♭3", "", "", "♯4", "", "♯5", "6", "", ""]
  },
  {
    className: "minorpentatonic",
    label: "Minor Pentatonic Scale",
    degrees: ["1", "", "", "♭3", "", "4", "", "5", "", "", "♭7", ""]
  },
  {
    className: "majorpentatonic",
    label: "Major Pentatonic Scale",
    degrees: ["1", "", "2", "", "3", "", "", "5", "", "6", "", ""]
  },
  {
    className: "minorblues",
    label: "Minor Blues Scale",
    degrees: ["1", "", "", "♭3", "", "4", "♭5", "5", "", "", "♭7", ""]
  },
  {
    className: "majorblues",
    label: "Major Blues Scale",
    degrees: ["1", "", "2", "♭3", "3", "", "", "5", "", "6", "", ""]
  },
  {
    className: "hybridblues",
    label: "Hybrid Blues Scale (Major + Minor)",
    degrees: ["1", "", "2", "♭3", "3", "4", "♭5", "5", "", "6", "♭7", ""]
  }
];
