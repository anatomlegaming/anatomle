// ============================================================================
// ANATOMLE — BONE INFO
// Single source of truth for Wikipedia lookups and fallback descriptions.
//
// BONE_WIKI_TITLE: overrides where the display name ≠ Wikipedia article title.
//   If a bone is NOT listed here, the display name is used directly as the title.
//
// BONE_FALLBACK_DESC: used when the Wikipedia API returns a stub (< 80 chars)
//   or fails entirely. Keeps the UI looking good regardless.
// ============================================================================

const BONE_WIKI_TITLE = {
    // Skull
    "Frontal Bone":            "Frontal bone",
    "Parietal Bone":           "Parietal bone",
    "Occipital Bone":          "Occipital bone",
    "Temporal Bone":           "Temporal bone",
    "Sphenoid Bone":           "Sphenoid bone",
    "Ethmoid Bone":            "Ethmoid bone",
    "Nasal Bone":              "Nasal bone",
    "Lacrimal Bone":           "Lacrimal bone",
    "Zygomatic Bone":          "Zygomatic bone",
    "Palatine Bone":           "Palatine bone",
    "Inferior Nasal Concha":   "Inferior nasal concha",

    // Vertebrae — point to specific articles
    "Atlas (C1)":              "Atlas (anatomy)",
    "Axis (C2)":               "Axis (anatomy)",
    "Cervical Vertebrae":      "Cervical vertebrae",
    "Thoracic Vertebrae":      "Thoracic vertebrae",
    "Lumbar Vertebrae":        "Lumbar vertebrae",

    // Ribs — grouped display names → general article
    "True Ribs (1-7)":         "Rib",
    "False Ribs (8-10)":       "Rib",
    "Floating Ribs (11-12)":   "Floating rib",
    "Costal Cartilage (1-7)":  "Costal cartilage",
    "Costal Cartilage (8-10)": "Costal cartilage",

    // Pelvis
    "Hip Bone":                "Hip bone",

    // Hand phalanges — grouped display names → general article
    "Proximal Phalanx (Hand)": "Phalanx bone",
    "Middle Phalanx (Hand)":   "Phalanx bone",
    "Distal Phalanx (Hand)":   "Phalanx bone",

    // Foot phalanges
    "Proximal Phalanx (Foot)": "Phalanx bone",
    "Middle Phalanx (Foot)":   "Phalanx bone",
    "Distal Phalanx (Foot)":   "Phalanx bone",

    // Forearm bones
    "Radius":                  "Radius (bone)",

    // Carpal bones with ambiguous names
    "Trapezium":               "Trapezium (bone)",

    // Foot tarsals with awkward names
    "Cuboid":                  "Cuboid bone",
    "Talus":                   "Talus (bone)",
    "Lunate":                  "Lunate bone",
    "Trapezoid":               "Trapezoid bone",
    "Medial Cuneiform":        "Medial cuneiform bone",
    "Intermediate Cuneiform":  "Intermediate cuneiform bone",
    "Lateral Cuneiform":       "Lateral cuneiform bone",

    // Metacarpals and metatarsals → general articles
    "Metacarpal I":            "Metacarpal bones",
    "Metacarpal II":           "Metacarpal bones",
    "Metacarpal III":          "Metacarpal bones",
    "Metacarpal IV":           "Metacarpal bones",
    "Metacarpal V":            "Metacarpal bones",
    "Metatarsal I":            "Metatarsal bones",
    "Metatarsal II":           "Metatarsal bones",
    "Metatarsal III":          "Metatarsal bones",
    "Metatarsal IV":           "Metatarsal bones",
    "Metatarsal V":            "Metatarsal bones",
};


// ── BONE INFO LOOKUP ─────────────────────────────────────────────────────────
// Reads from the static BONE_DESCRIPTIONS (boneDescriptions.js).
// No live API calls — safe from vandalism, works offline.
// Wikipedia URL still generated for the "Read more" link.

async function fetchBoneInfo(displayName) {
    var wikiTitle = BONE_WIKI_TITLE[displayName] || displayName;
    var encoded   = encodeURIComponent(wikiTitle.replace(/ /g, '_'));
    var wikiUrl   = 'https://en.wikipedia.org/wiki/' + encoded;

    // Primary: static descriptions (boneDescriptions.js)
    var desc = (typeof BONE_DESCRIPTIONS !== 'undefined' && BONE_DESCRIPTIONS[displayName])
        || 'No description available.';

    return {
        title:       displayName,
        description: desc,
        url:         wikiUrl,
    };
}

window.fetchBoneInfo = fetchBoneInfo;
window.BONE_WIKI_TITLE = BONE_WIKI_TITLE;
