// ====================================
// ANATOMLE - Full Skeleton Graph
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
    'Thoracic Vertebrae': ['Cervical Vertebrae', 'Lumbar Vertebrae', 'True Ribs', 'False Ribs'],
    'Lumbar Vertebrae': ['Thoracic Vertebrae', 'Sacrum'],
    'Sacrum': ['Lumbar Vertebrae', 'Hip Bone'],

    // ===== RIBS & STERNUM =====
    'True Ribs': ['Thoracic Vertebrae', 'Sternum'],
    'False Ribs': ['Thoracic Vertebrae'],
    'Sternum': ['True Ribs', 'Clavicle'],

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
    'Metacarpal I': ['Trapezium', 'Proximal Phalanx I'],
    'Metacarpal II': ['Trapezoid', 'Capitate', 'Proximal Phalanx II'],
    'Metacarpal III': ['Capitate', 'Proximal Phalanx III'],
    'Metacarpal IV': ['Hamate', 'Proximal Phalanx IV'],
    'Metacarpal V': ['Hamate', 'Proximal Phalanx V'],

    // ===== HAND - PHALANGES (Thumb has 2, Fingers have 3 each) =====
    'Proximal Phalanx I': ['Metacarpal I', 'Distal Phalanx I'],
    'Distal Phalanx I': ['Proximal Phalanx I'],
    'Proximal Phalanx II': ['Metacarpal II', 'Middle Phalanx II'],
    'Middle Phalanx II': ['Proximal Phalanx II', 'Distal Phalanx II'],
    'Distal Phalanx II': ['Middle Phalanx II'],
    'Proximal Phalanx III': ['Metacarpal III', 'Middle Phalanx III'],
    'Middle Phalanx III': ['Proximal Phalanx III', 'Distal Phalanx III'],
    'Distal Phalanx III': ['Middle Phalanx III'],
    'Proximal Phalanx IV': ['Metacarpal IV', 'Middle Phalanx IV'],
    'Middle Phalanx IV': ['Proximal Phalanx IV', 'Distal Phalanx IV'],
    'Distal Phalanx IV': ['Middle Phalanx IV'],
    'Proximal Phalanx V': ['Metacarpal V', 'Middle Phalanx V'],
    'Middle Phalanx V': ['Proximal Phalanx V', 'Distal Phalanx V'],
    'Distal Phalanx V': ['Middle Phalanx V'],

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
    'Metatarsal I': ['Medial Cuneiform', 'Proximal Phalanx I (Foot)'],
    'Metatarsal II': ['Medial Cuneiform', 'Intermediate Cuneiform', 'Proximal Phalanx II (Foot)'],
    'Metatarsal III': ['Lateral Cuneiform', 'Proximal Phalanx III (Foot)'],
    'Metatarsal IV': ['Lateral Cuneiform', 'Cuboid', 'Proximal Phalanx IV (Foot)'],
    'Metatarsal V': ['Cuboid', 'Proximal Phalanx V (Foot)'],

    // ===== FOOT - PHALANGES (Big toe has 2, other toes have 3 each) =====
    'Proximal Phalanx I (Foot)': ['Metatarsal I', 'Distal Phalanx I (Foot)'],
    'Distal Phalanx I (Foot)': ['Proximal Phalanx I (Foot)'],
    'Proximal Phalanx II (Foot)': ['Metatarsal II', 'Middle Phalanx II (Foot)'],
    'Middle Phalanx II (Foot)': ['Proximal Phalanx II (Foot)', 'Distal Phalanx II (Foot)'],
    'Distal Phalanx II (Foot)': ['Middle Phalanx II (Foot)'],
    'Proximal Phalanx III (Foot)': ['Metatarsal III', 'Middle Phalanx III (Foot)'],
    'Middle Phalanx III (Foot)': ['Proximal Phalanx III (Foot)', 'Distal Phalanx III (Foot)'],
    'Distal Phalanx III (Foot)': ['Middle Phalanx III (Foot)'],
    'Proximal Phalanx IV (Foot)': ['Metatarsal IV', 'Middle Phalanx IV (Foot)'],
    'Middle Phalanx IV (Foot)': ['Proximal Phalanx IV (Foot)', 'Distal Phalanx IV (Foot)'],
    'Distal Phalanx IV (Foot)': ['Middle Phalanx IV (Foot)'],
    'Proximal Phalanx V (Foot)': ['Metatarsal V', 'Middle Phalanx V (Foot)'],
    'Middle Phalanx V (Foot)': ['Proximal Phalanx V (Foot)', 'Distal Phalanx V (Foot)'],
    'Distal Phalanx V (Foot)': ['Middle Phalanx V (Foot)']
};
