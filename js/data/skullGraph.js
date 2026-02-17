// ====================================
// ANATOMLE - Skull Graph
// ====================================
// Only the 14 skull bones and their articulations

const SKULL_GRAPH = {
    'Frontal Bone':          ['Parietal Bone', 'Ethmoid Bone', 'Sphenoid Bone', 'Nasal Bone', 'Maxilla', 'Zygomatic Bone', 'Lacrimal Bone'],
    'Parietal Bone':         ['Frontal Bone', 'Temporal Bone', 'Occipital Bone', 'Sphenoid Bone'],
    'Occipital Bone':        ['Parietal Bone', 'Temporal Bone', 'Sphenoid Bone'],
    'Temporal Bone':         ['Parietal Bone', 'Occipital Bone', 'Sphenoid Bone', 'Zygomatic Bone', 'Mandible'],
    'Sphenoid Bone':         ['Frontal Bone', 'Parietal Bone', 'Temporal Bone', 'Occipital Bone', 'Ethmoid Bone', 'Zygomatic Bone', 'Palatine Bone', 'Vomer'],
    'Ethmoid Bone':          ['Frontal Bone', 'Sphenoid Bone', 'Nasal Bone', 'Lacrimal Bone', 'Palatine Bone', 'Vomer', 'Inferior Nasal Concha'],
    'Nasal Bone':            ['Frontal Bone', 'Ethmoid Bone', 'Maxilla', 'Lacrimal Bone'],
    'Lacrimal Bone':         ['Frontal Bone', 'Ethmoid Bone', 'Nasal Bone', 'Maxilla', 'Inferior Nasal Concha'],
    'Zygomatic Bone':        ['Frontal Bone', 'Temporal Bone', 'Sphenoid Bone', 'Maxilla'],
    'Maxilla':               ['Frontal Bone', 'Nasal Bone', 'Zygomatic Bone', 'Lacrimal Bone', 'Palatine Bone', 'Mandible', 'Vomer', 'Inferior Nasal Concha'],
    'Palatine Bone':         ['Sphenoid Bone', 'Ethmoid Bone', 'Maxilla', 'Vomer', 'Inferior Nasal Concha'],
    'Vomer':                 ['Sphenoid Bone', 'Ethmoid Bone', 'Maxilla', 'Palatine Bone'],
    'Inferior Nasal Concha': ['Ethmoid Bone', 'Lacrimal Bone', 'Maxilla', 'Palatine Bone'],
    'Mandible':              ['Temporal Bone', 'Maxilla'],
};
