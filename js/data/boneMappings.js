// ====================================
// ANATOMLE - Bone to 3D Model Mappingsa
// ====================================
// Maps game bone names to 3D model node names

const BONE_TO_3D_MODEL = {
    // Skull bones
    "Frontal Bone": "Frontal",
    "Parietal Bone": "Parietal",
    "Occipital Bone": "Occipital",
    "Temporal Bone": "Temporal",
    "Sphenoid Bone": "Sphenoid",
    "Ethmoid Bone": "Ethmoid",
    "Nasal Bone": "Nasal",
    "Lacrimal Bone": "Lacrimal",
    "Zygomatic Bone": "Zygomatic",
    "Maxilla": "Maxilla",
    "Palatine Bone": "Palatine",
    "Vomer": "Vomer",
    "Inferior Nasal Concha": "Concha",
    "Mandible": "Mandible",

    // Spine
    "Atlas (C1)": "Atlas",
    "Axis (C2)": "Axis",
    "Cervical Vertebrae": "Cervical",
    "Thoracic Vertebrae": "Thoracic",
    "Lumbar Vertebrae": "Lumbar",
    "Sacrum": "Sacrum",

    // Ribs & sternum — handled by special-case logic in update3D, keys unused
    "True Ribs": "__true_ribs__",
    "False Ribs": "__false_ribs__",
    "Sternum": "sternum",

    // Upper limb
    "Clavicle": "Clavicl",
    "Scapula": "Scapula",
    "Humerus": "Humerus",
    "Radius": "Radius",
    "Ulna": "Ulna",

    // Hand - carpals
    "Scaphoid": "Scaphoid",
    "Lunate": "Lunate",
    "Triquetrum": "Triquetrum",
    "Pisiform": "Pisiform",
    "Trapezium": "Trapezium",
    "Trapezoid": "Trapezoid",
    "Capitate": "Capitate",
    "Hamate": "Hamate",

    // Hand - metacarpals
    "Metacarpal I": "1st_metacarpal",
    "Metacarpal II": "2nd_metacarpal",
    "Metacarpal III": "3rd_metacarpal",
    "Metacarpal IV": "4th_metacarpal",
    "Metacarpal V": "5th_metacarpal",

    // Hand - phalanges
    "Proximal Phalanx I": "phalanx_of_1st_finger",
    "Distal Phalanx I": "phalanx_of_1st_finger",
    "Proximal Phalanx II": "phalanx_of_2d_finger",
    "Middle Phalanx II": "phalanx_of_2d_finger",
    "Distal Phalanx II": "phalanx_of_2d_finger",
    "Proximal Phalanx III": "phalanx_of_3d_finger",
    "Middle Phalanx III": "phalanx_of_3d_finger",
    "Distal Phalanx III": "phalanx_of_3d_finger",
    "Proximal Phalanx IV": "phalanx_of_4th_finger",
    "Middle Phalanx IV": "phalanx_of_4th_finger",
    "Distal Phalanx IV": "phalanx_of_4th_finger",
    "Proximal Phalanx V": "phalanx_of_5th_finger",
    "Middle Phalanx V": "phalanx_of_5th_finger",
    "Distal Phalanx V": "phalanx_of_5th_finger",

    // Pelvis — handled by special-case logic in update3D, key unused
    "Hip Bone": "__hip_bone__",

    // Lower limb
    "Femur": "Femur",
    "Patella": "Patellar",
    "Tibia": "Tibia",
    "Fibula": "Fibula",

    // Foot - tarsals
    "Talus": "Talus",
    "Calcaneus": "Calcaneus",
    "Navicular": "Navicular_boner",
    "Cuboid": "Cuboid_boner",
    "Medial Cuneiform": "Medial_cuneiform",
    "Intermediate Cuneiform": "Intermediate_cuneiform",
    "Lateral Cuneiform": "Lateral_cuneiform",

    // Foot - metatarsals
    "Metatarsal I": "First_metatarsal",
    "Metatarsal II": "Second_metatarsal",
    "Metatarsal III": "Third_metatarsal",
    "Metatarsal IV": "Fourth_metatarsal",
    "Metatarsal V": "Fifth_metatarsal",

    // Foot - phalanges
    "Proximal Phalanx I (Foot)": "first_finger_of_foot",
    "Distal Phalanx I (Foot)": "first_finger_of_foot",
    "Proximal Phalanx II (Foot)": "second_finger_of_foot",
    "Middle Phalanx II (Foot)": "second_finger_of_foot",
    "Distal Phalanx II (Foot)": "second_finger_of_foot",
    "Proximal Phalanx III (Foot)": "third_finger_of_foot",
    "Middle Phalanx III (Foot)": "third_finger_of_foot",
    "Distal Phalanx III (Foot)": "third_finger_of_foot",
    "Proximal Phalanx IV (Foot)": "fourth_finger_of_foot",
    "Middle Phalanx IV (Foot)": "fourth_finger_of_foot",
    "Distal Phalanx IV (Foot)": "fourth_finger_of_foot",
    "Proximal Phalanx V (Foot)": "fifth_finger_of_foot",
    "Middle Phalanx V (Foot)": "fifth_finger_of_foot",
    "Distal Phalanx V (Foot)": "fifth_finger_of_foot"
};

// Anatomically paired bones that display side by side in UI
const TWIN_BONES = {
    'Radius': 'Ulna',
    'Ulna': 'Radius',
    'Tibia': 'Fibula',
    'Fibula': 'Tibia',
    'Talus': 'Calcaneus',
    'Calcaneus': 'Talus'
};

function areTwins(bone1, bone2) {
    return TWIN_BONES[bone1] === bone2 || TWIN_BONES[bone2] === bone1;
}
