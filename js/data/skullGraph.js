// ============================================================================
// ANATOMLE — Skull Graph (22 bones)
// Includes paired left/right bones for full anatomical accuracy.
// Unpaired midline: Frontal, Occipital, Sphenoid, Ethmoid, Vomer, Mandible
// Paired: Parietal, Temporal, Nasal, Lacrimal, Zygomatic, Maxilla,
//         Palatine, Inferior Nasal Concha
// ============================================================================

const SKULL_GRAPH = {
    // ── MIDLINE UNPAIRED ─────────────────────────────────────────────────────
    'Frontal Bone': [
        'Left Parietal Bone', 'Right Parietal Bone',
        'Left Nasal Bone', 'Right Nasal Bone',
        'Left Lacrimal Bone', 'Right Lacrimal Bone',
        'Left Zygomatic Bone', 'Right Zygomatic Bone',
        'Left Maxilla', 'Right Maxilla',
        'Sphenoid Bone', 'Ethmoid Bone',
    ],
    'Occipital Bone': [
        'Left Parietal Bone', 'Right Parietal Bone',
        'Left Temporal Bone', 'Right Temporal Bone',
        'Sphenoid Bone',
    ],
    'Sphenoid Bone': [
        'Frontal Bone', 'Occipital Bone', 'Ethmoid Bone', 'Vomer',
        'Left Parietal Bone', 'Right Parietal Bone',
        'Left Temporal Bone', 'Right Temporal Bone',
        'Left Zygomatic Bone', 'Right Zygomatic Bone',
        'Left Palatine Bone', 'Right Palatine Bone',
    ],
    'Ethmoid Bone': [
        'Frontal Bone', 'Sphenoid Bone', 'Vomer',
        'Left Nasal Bone', 'Right Nasal Bone',
        'Left Lacrimal Bone', 'Right Lacrimal Bone',
        'Left Maxilla', 'Right Maxilla',
        'Left Palatine Bone', 'Right Palatine Bone',
        'Left Inferior Nasal Concha', 'Right Inferior Nasal Concha',
    ],
    'Vomer': [
        'Sphenoid Bone', 'Ethmoid Bone',
        'Left Maxilla', 'Right Maxilla',
        'Left Palatine Bone', 'Right Palatine Bone',
    ],
    'Mandible': [
        'Left Temporal Bone', 'Right Temporal Bone',
        'Left Maxilla', 'Right Maxilla',
    ],

    // ── PAIRED — LEFT ────────────────────────────────────────────────────────
    'Left Parietal Bone': [
        'Right Parietal Bone',
        'Frontal Bone', 'Occipital Bone', 'Sphenoid Bone',
        'Left Temporal Bone',
    ],
    'Left Temporal Bone': [
        'Left Parietal Bone', 'Occipital Bone', 'Sphenoid Bone',
        'Left Zygomatic Bone', 'Mandible',
    ],
    'Left Nasal Bone': [
        'Right Nasal Bone',
        'Frontal Bone', 'Ethmoid Bone',
        'Left Maxilla', 'Left Lacrimal Bone',
    ],
    'Left Lacrimal Bone': [
        'Frontal Bone', 'Ethmoid Bone',
        'Left Nasal Bone', 'Left Maxilla',
        'Left Inferior Nasal Concha',
    ],
    'Left Zygomatic Bone': [
        'Frontal Bone', 'Sphenoid Bone',
        'Left Temporal Bone', 'Left Maxilla',
    ],
    'Left Maxilla': [
        'Right Maxilla',
        'Frontal Bone', 'Ethmoid Bone', 'Vomer', 'Mandible',
        'Left Nasal Bone', 'Left Lacrimal Bone', 'Left Zygomatic Bone',
        'Left Palatine Bone', 'Left Inferior Nasal Concha',
    ],
    'Left Palatine Bone': [
        'Right Palatine Bone',
        'Sphenoid Bone', 'Ethmoid Bone', 'Vomer',
        'Left Maxilla', 'Left Inferior Nasal Concha',
    ],
    'Left Inferior Nasal Concha': [
        'Ethmoid Bone',
        'Left Lacrimal Bone', 'Left Maxilla', 'Left Palatine Bone',
    ],

    // ── PAIRED — RIGHT ───────────────────────────────────────────────────────
    'Right Parietal Bone': [
        'Left Parietal Bone',
        'Frontal Bone', 'Occipital Bone', 'Sphenoid Bone',
        'Right Temporal Bone',
    ],
    'Right Temporal Bone': [
        'Right Parietal Bone', 'Occipital Bone', 'Sphenoid Bone',
        'Right Zygomatic Bone', 'Mandible',
    ],
    'Right Nasal Bone': [
        'Left Nasal Bone',
        'Frontal Bone', 'Ethmoid Bone',
        'Right Maxilla', 'Right Lacrimal Bone',
    ],
    'Right Lacrimal Bone': [
        'Frontal Bone', 'Ethmoid Bone',
        'Right Nasal Bone', 'Right Maxilla',
        'Right Inferior Nasal Concha',
    ],
    'Right Zygomatic Bone': [
        'Frontal Bone', 'Sphenoid Bone',
        'Right Temporal Bone', 'Right Maxilla',
    ],
    'Right Maxilla': [
        'Left Maxilla',
        'Frontal Bone', 'Ethmoid Bone', 'Vomer', 'Mandible',
        'Right Nasal Bone', 'Right Lacrimal Bone', 'Right Zygomatic Bone',
        'Right Palatine Bone', 'Right Inferior Nasal Concha',
    ],
    'Right Palatine Bone': [
        'Left Palatine Bone',
        'Sphenoid Bone', 'Ethmoid Bone', 'Vomer',
        'Right Maxilla', 'Right Inferior Nasal Concha',
    ],
    'Right Inferior Nasal Concha': [
        'Ethmoid Bone',
        'Right Lacrimal Bone', 'Right Maxilla', 'Right Palatine Bone',
    ],
};
