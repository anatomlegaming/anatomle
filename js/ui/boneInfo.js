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

    // Foot tarsals with awkward names
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

const BONE_FALLBACK_DESC = {
    "True Ribs (1-7)":         "The true ribs (1st–7th) attach directly to the sternum via their own costal cartilage, forming the rigid anterior wall of the thorax.",
    "False Ribs (8-10)":       "The false ribs (8th–10th) connect to the sternum indirectly, sharing costal cartilage with the 7th rib rather than attaching independently.",
    "Floating Ribs (11-12)":   "The floating ribs (11th–12th) have no anterior attachment at all — they are anchored only at the thoracic vertebrae, giving them freedom of movement.",
    "Costal Cartilage (1-7)":  "Costal cartilages are bars of hyaline cartilage that connect the ribs to the sternum, providing flexible yet strong support for the thoracic cage.",
    "Costal Cartilage (8-10)": "The false rib costal cartilages fuse together and join the 7th costal cartilage rather than attaching directly to the sternum.",
    "Proximal Phalanx (Hand)": "The proximal phalanges are the first (and largest) set of finger bones, articulating with the metacarpals at the knuckle joints.",
    "Middle Phalanx (Hand)":   "The middle phalanges are the intermediate finger bones, absent in the thumb, sitting between the proximal and distal phalanges.",
    "Distal Phalanx (Hand)":   "The distal phalanges are the terminal finger bones, forming the bony support for the fingertips and nail beds.",
    "Proximal Phalanx (Foot)": "The proximal phalanges of the foot are the largest toe bones, articulating with the metatarsals at the metatarsophalangeal joints.",
    "Middle Phalanx (Foot)":   "The middle phalanges of the foot are absent in the great toe and present in the lesser toes, forming the mid-section of each digit.",
    "Distal Phalanx (Foot)":   "The distal phalanges are the terminal bones of the toes, providing structural support beneath each toenail.",
    "Metacarpal I":            "The first metacarpal supports the thumb and is the shortest and most robust of the five metacarpals, allowing the wide range of thumb motion.",
    "Metacarpal II":           "The second metacarpal, the longest, anchors the index finger and forms a key part of the rigid central column of the hand.",
    "Metacarpal III":          "The third metacarpal supports the middle finger and features a distinctive styloid process at its base.",
    "Metacarpal IV":           "The fourth metacarpal supports the ring finger and is closely associated with the hamate bone at the wrist.",
    "Metacarpal V":            "The fifth metacarpal supports the little finger and is a common site of fracture ('boxer's fracture') from direct impact.",
    "Metatarsal I":            "The first metatarsal is the shortest and thickest, bearing significant weight during the push-off phase of walking.",
    "Metatarsal II":           "The second metatarsal is the longest and most commonly stressed during running, making it prone to stress fractures.",
    "Metatarsal III":          "The third metatarsal sits centrally in the foot and transmits forces between the cuneiform bones and the middle toe.",
    "Metatarsal IV":           "The fourth metatarsal articulates with the cuboid and lateral cuneiform, contributing to the lateral arch of the foot.",
    "Metatarsal V":            "The fifth metatarsal has a prominent tuberosity at its base where the peroneus brevis muscle inserts — a common site of avulsion fracture.",
    "Hip Bone":                "The hip bone (os coxae) is formed by the fusion of the ilium, ischium and pubis. Together, the paired hip bones and sacrum form the pelvis.",
    "Atlas (C1)":              "The atlas is the first cervical vertebra, forming the atlanto-occipital joint with the skull. Uniquely, it has no vertebral body, functioning as a ring that supports the head.",
    "Axis (C2)":               "The axis is the second cervical vertebra, distinguished by its dens (odontoid process) — a tooth-like projection around which the atlas rotates to allow head turning.",
};

// ── WIKIPEDIA API FETCH ───────────────────────────────────────────────────────
// Returns { title, description, url } or null on failure.
// Caches results in memory to avoid duplicate requests.
var _wikiCache = {};

async function fetchBoneInfo(displayName) {
    if (_wikiCache[displayName]) return _wikiCache[displayName];

    var wikiTitle = BONE_WIKI_TITLE[displayName] || displayName;
    var encoded   = encodeURIComponent(wikiTitle.replace(/ /g, '_'));
    var url       = 'https://en.wikipedia.org/api/rest_v1/summary/' + encoded;

    try {
        var res  = await fetch(url, {
            headers: { 'User-Agent': 'Anatomle/1.0 (anatomle.com; educational anatomy game)' }
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        var data = await res.json();

        var desc = data.extract || '';
        // Trim to first 2 sentences max for the card
        var sentences = desc.match(/[^.!?]+[.!?]+/g) || [desc];
        var trimmed   = sentences.slice(0, 2).join(' ').trim();

        // Fall back to our curated text if Wikipedia's summary is too short
        if (trimmed.length < 60 && BONE_FALLBACK_DESC[displayName]) {
            trimmed = BONE_FALLBACK_DESC[displayName];
        }

        var result = {
            title:       data.title || displayName,
            description: trimmed || BONE_FALLBACK_DESC[displayName] || 'No description available.',
            url:         data.content_urls && data.content_urls.desktop
                             ? data.content_urls.desktop.page
                             : 'https://en.wikipedia.org/wiki/' + encoded,
        };
        _wikiCache[displayName] = result;
        return result;
    } catch (err) {
        // Network failure or title mismatch — use fallback
        var fallback = {
            title:       displayName,
            description: BONE_FALLBACK_DESC[displayName] || 'No description available.',
            url:         'https://en.wikipedia.org/wiki/' + encoded,
        };
        _wikiCache[displayName] = fallback;
        return fallback;
    }
}

window.fetchBoneInfo = fetchBoneInfo;
window.BONE_WIKI_TITLE = BONE_WIKI_TITLE;
