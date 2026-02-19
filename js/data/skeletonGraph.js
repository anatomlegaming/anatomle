// ====================================
// ANATOMLE - Full Skeleton Grapha
// ====================================
// Complete human skeleton connections (~90 bones)

const SKELETON_GRAPH = {
    // ===== SKULL BONES =====
    'Frontal Bone': ['Parietal Bone', 'Ethmoid Bone', 'Sphenoid Bone', 'Nasal Bone', 'Maxilla', 'Zygomatic Bone'],
    'Parietal Bone': ['Frontal Bone', 'Temporal Bone', 'Occipital Bone', 'Sphenoid Bone'],
    'Occipital Bone': ['Parietal Bone', 'Temporal Bone', 'Atlas (C1)'],
    'Temporal Bone': ['Parietal Bone', 'Occipital Bone', 'Sphenoid Bone', 'Zygomatic Bone', 'Mandible'],
    'Sphenoid Bone': ['Frontal Bone', 'Parietal Bone', 'Temporal Bone', 'Ethmoid Bone', 'Zygomatic Bone', 'Palatine Bone'],
    'Ethmoid Bone': ['Frontal Bone', 'Sphenoid Bone', 'Nasal Bone', 'Lacrimal Bone'],
    'Nasal Bone': ['Frontal Bone', 'Ethmoid Bone', 'Maxilla'],
    'Lacrimal Bone': ['Ethmoid Bone', 'Maxilla'],
    'Zygomatic Bone': ['Frontal Bone', 'Temporal Bone', 'Sphenoid Bone', 'Maxilla'],
    'Maxilla': ['Frontal Bone', 'Nasal Bone', 'Zygomatic Bone', 'Lacrimal Bone', 'Palatine Bone', 'Mandible'],
    'Palatine Bone': ['Sphenoid Bone', 'Maxilla'],
    'Vomer': ['Sphenoid Bone', 'Ethmoid Bone', 'Maxilla'],
    'Inferior Nasal Concha': ['Ethmoid Bone', 'Maxilla'],
    'Mandible': ['Temporal Bone', 'Maxilla'],

    // ===== SPINE (GROUPED) =====
    'Atlas (C1)': ['Occipital Bone', 'Axis (C2)'],
    'Axis (C2)': ['Atlas (C1)', 'Cervical Vertebrae'],
    'Cervical Vertebrae': ['Axis (C2)', 'Thoracic Vertebrae'],
    'Thoracic Vertebrae': ['Cervical Vertebrae', 'Lumbar Vertebrae', 'True Ribs (1-7)', 'False Ribs (8-10)', 'Floating Ribs (11-12)'],
    'Lumbar Vertebrae': ['Thoracic Vertebrae', 'Sacrum'],
    'Sacrum': ['Lumbar Vertebrae', 'Hip Bone', 'Coccyx'],
    'Coccyx': ['Sacrum'],

    // ===== RIBS & STERNUM =====
    'True Ribs (1-7)':     ['Thoracic Vertebrae', 'Costal Cartilage (1-7)'],
    'False Ribs (8-10)':   ['Thoracic Vertebrae', 'Costal Cartilage (8-10)'],
    'Floating Ribs (11-12)': ['Thoracic Vertebrae'],
    'Costal Cartilage (1-7)':  ['True Ribs (1-7)', 'Sternum'],
    'Costal Cartilage (8-10)': ['False Ribs (8-10)', 'Costal Cartilage (1-7)'],
    'Sternum': ['Costal Cartilage (1-7)', 'Clavicle'],

    // ===== SHOULDER & ARM =====
    'Clavicle': ['Sternum', 'Scapula'],
    'Scapula': ['Clavicle', 'Humerus'],
    'Humerus': ['Scapula', 'Radius', 'Ulna'],
    'Radius': ['Humerus', 'Ulna', 'Scaphoid', 'Lunate'],
    'Ulna': ['Humerus', 'Radius', 'Triquetrum', 'Pisiform'],

    // ===== HAND - CARPALS =====
    'Scaphoid': ['Radius', 'Lunate', 'Capitate', 'Trapezium', 'Trapezoid'],
    'Lunate': ['Radius', 'Scaphoid', 'Triquetrum', 'Capitate', 'Hamate'],
    'Triquetrum': ['Ulna', 'Lunate', 'Pisiform', 'Hamate'],
    'Pisiform': ['Ulna', 'Triquetrum'],
    'Trapezium': ['Scaphoid', 'Trapezoid', 'Metacarpal I'],
    'Trapezoid': ['Scaphoid', 'Trapezium', 'Capitate', 'Metacarpal II'],
    'Capitate': ['Scaphoid', 'Lunate', 'Trapezoid', 'Hamate', 'Metacarpal II', 'Metacarpal III'],
    'Hamate': ['Lunate', 'Triquetrum', 'Capitate', 'Metacarpal IV', 'Metacarpal V'],

    // ===== HAND - METACARPALS =====
    'Metacarpal I': ['Trapezium', 'Proximal Phalanx (Hand)'],
    'Metacarpal II': ['Trapezoid', 'Capitate', 'Proximal Phalanx (Hand)'],
    'Metacarpal III': ['Capitate', 'Proximal Phalanx (Hand)'],
    'Metacarpal IV': ['Hamate', 'Proximal Phalanx (Hand)'],
    'Metacarpal V': ['Hamate', 'Proximal Phalanx (Hand)'],

    // ===== HAND - PHALANGES (grouped by row) =====
    'Proximal Phalanx (Hand)': ['Metacarpal I', 'Metacarpal II', 'Metacarpal III', 'Metacarpal IV', 'Metacarpal V', 'Middle Phalanx (Hand)'],
    'Middle Phalanx (Hand)': ['Proximal Phalanx (Hand)', 'Distal Phalanx (Hand)'],
    'Distal Phalanx (Hand)': ['Middle Phalanx (Hand)'],

    // ===== PELVIS =====
    'Hip Bone': ['Sacrum', 'Femur'],

    // ===== LEG =====
    'Femur': ['Hip Bone', 'Patella', 'Tibia'],
    'Patella': ['Femur', 'Tibia'],
    'Tibia': ['Femur', 'Patella', 'Fibula', 'Talus'],
    'Fibula': ['Tibia', 'Talus'],

    // ===== FOOT - TARSALS =====
    'Talus': ['Tibia', 'Fibula', 'Calcaneus', 'Navicular'],
    'Calcaneus': ['Talus', 'Cuboid'],
    'Navicular': ['Talus', 'Medial Cuneiform', 'Intermediate Cuneiform', 'Lateral Cuneiform'],
    'Medial Cuneiform': ['Navicular', 'Intermediate Cuneiform', 'Metatarsal I', 'Metatarsal II'],
    'Intermediate Cuneiform': ['Navicular', 'Medial Cuneiform', 'Lateral Cuneiform', 'Metatarsal II'],
    'Lateral Cuneiform': ['Navicular', 'Intermediate Cuneiform', 'Cuboid', 'Metatarsal III', 'Metatarsal IV'],
    'Cuboid': ['Calcaneus', 'Lateral Cuneiform', 'Metatarsal IV', 'Metatarsal V'],

    // ===== FOOT - METATARSALS =====
    'Metatarsal I': ['Medial Cuneiform', 'Proximal Phalanx (Foot)'],
    'Metatarsal II': ['Medial Cuneiform', 'Intermediate Cuneiform', 'Proximal Phalanx (Foot)'],
    'Metatarsal III': ['Lateral Cuneiform', 'Proximal Phalanx (Foot)'],
    'Metatarsal IV': ['Lateral Cuneiform', 'Cuboid', 'Proximal Phalanx (Foot)'],
    'Metatarsal V': ['Cuboid', 'Proximal Phalanx (Foot)'],

    // ===== FOOT - PHALANGES (grouped by row) =====
    'Proximal Phalanx (Foot)': ['Metatarsal I', 'Metatarsal II', 'Metatarsal III', 'Metatarsal IV', 'Metatarsal V', 'Middle Phalanx (Foot)'],
    'Middle Phalanx (Foot)': ['Proximal Phalanx (Foot)', 'Distal Phalanx (Foot)'],
    'Distal Phalanx (Foot)': ['Middle Phalanx (Foot)']
};
