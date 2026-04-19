export const ONE_PIECE_EPISODE_COUNT = 1125;

export const ONE_PIECE_ARCS = [
  { key: "east-blue", label: "East Blue", start: 1, end: 61 },
  { key: "reverse-mountain", label: "Reverse Mountain", start: 62, end: 63 },
  { key: "whiskey-peak", label: "Whiskey Peak", start: 64, end: 67 },
  { key: "little-garden", label: "Little Garden", start: 70, end: 77 },
  { key: "drum-island", label: "Drum Island", start: 78, end: 91 },
  { key: "alabasta", label: "Alabasta", start: 92, end: 130 },
  { key: "jaya", label: "Jaya", start: 144, end: 152 },
  { key: "skypiea", label: "Skypiea", start: 153, end: 195 },
  { key: "water-7", label: "Water 7", start: 229, end: 263 },
  { key: "enies-lobby", label: "Enies Lobby", start: 264, end: 312 },
  { key: "post-enies-lobby", label: "Post-Enies Lobby", start: 313, end: 325 },
  { key: "thriller-bark", label: "Thriller Bark", start: 337, end: 381 },
  { key: "sabaody", label: "Sabaody Archipelago", start: 385, end: 405 },
  { key: "amazon-lily", label: "Amazon Lily", start: 408, end: 421 },
  { key: "impel-down", label: "Impel Down", start: 422, end: 458 },
  { key: "marineford", label: "Marineford", start: 459, end: 489 },
  { key: "post-war", label: "Post-War", start: 490, end: 516 },
  { key: "fish-man-island", label: "Fish-Man Island", start: 517, end: 574 },
  { key: "punk-hazard", label: "Punk Hazard", start: 579, end: 625 },
  { key: "dressrosa", label: "Dressrosa", start: 629, end: 746 },
  { key: "zou", label: "Zou", start: 751, end: 779 },
  { key: "whole-cake-island", label: "Whole Cake Island", start: 783, end: 877 },
  { key: "reverie", label: "Reverie", start: 878, end: 889 },
  { key: "wano", label: "Wano Country", start: 890, end: 1085 },
  { key: "egghead", label: "Egghead", start: 1086, end: ONE_PIECE_EPISODE_COUNT }
];

export const ONE_PIECE_SOURCES = [
  {
    key: "subbed",
    label: "Subbed",
    querySuffix: "subbed"
  },
  {
    key: "english",
    label: "English",
    querySuffix: "english"
  }
];

export const ONE_PIECE_PROVIDERS = [
  {
    key: "netflix",
    label: "Netflix",
    embeddable: false,
    buildUrl: (query) => `https://www.netflix.com/search?q=${encodeURIComponent(query)}`
  }
];
