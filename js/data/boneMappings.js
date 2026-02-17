// ====================================
// ANATOMLE - Bone to 3D Model Mappings
// ====================================
// Values are partial strings matched against GLB mesh names via node.name.includes(key)
// Internal mesh names verified from Blender scene data (left column = mesh name)
// Special cases: Hip Bone, True Ribs, False Ribs handled in update3D

const BONE_TO_3D_MODEL = {
    // Skull
    "Frontal Bone":           "Frontal",
    "Parietal Bone":          "Parietal",
    "Occipital Bone":         "Occipital",
    "Temporal Bone":          "Temporal",
    "Sphenoid Bone":          "Sphenoid",
    "Ethmoid Bone":           "Ethmoid",
    "Nasal Bone":             "Nasal_boner",
    "Lacrimal Bone":          "Lacrimal_boner",
    "Zygomatic Bone":         "Zygomatic",
    "Maxilla":                "Maxilla",
    "Palatine Bone":          "Palatine",
    "Vomer":                  "Vomer",
    "Inferior Nasal Concha":  "Inferior_nasal_concha_boner",
    "Mandible":               "Mandible",

    // Spine
    "Atlas (C1)":             "Atlas",
    "Axis (C2)":              "Axis",
    "Cervical Vertebrae":     "Cervical",
    "Thoracic Vertebrae":     "Thoracic",
    "Lumbar Vertebrae":       "Lumbar",
    "Sacrum":                 "Sacrum",

    // Ribs & sternum — ribs handled by special case in update3D
    "True Ribs":              "__true_ribs__",
    "False Ribs":             "__false_ribs__",
    "Sternum":                "sternum",

    // Upper limb
    "Clavicle":               "Clavicler",
    "Scapula":                "Scapula",
    "Humerus":                "Humerusr",
    "Radius":                 "Radiusr",
    "Ulna":                   "Ulnar",

    // Hand carpals
    "Scaphoid":               "Scaphoid",
    "Lunate":                 "Lunate",
    "Triquetrum":             "Triquetrum",
    "Pisiform":               "Pisiform",
    "Trapezium":              "Trapezium",
    "Trapezoid":              "Trapezoid",
    "Capitate":               "Capitater",
    "Hamate":                 "Hamater",

    // Hand metacarpals
    "Metacarpal I":           "1st_metacarpal_boner",
    "Metacarpal II":          "2nd_metacarpal_boner",
    "Metacarpal III":         "3rd_metacarpal_boner",
    "Metacarpal IV":          "4th_metacarpal_boner",
    "Metacarpal V":           "5th_metacarpal_boner",

    // Hand phalanges
    "Proximal Phalanx I":     "phalanx_of_1st_fingerr",
    "Distal Phalanx I":       "phalanx_of_1st_fingerr",
    "Proximal Phalanx II":    "phalanx_of_2d_fingerr",
    "Middle Phalanx II":      "phalanx_of_2d_fingerr",
    "Distal Phalanx II":      "phalanx_of_2d_fingerr",
    "Proximal Phalanx III":   "phalanx_of_3d_fingerr",
    "Middle Phalanx III":     "phalanx_of_3d_fingerr",
    "Distal Phalanx III":     "phalanx_of_3d_fingerr",
    "Proximal Phalanx IV":    "phalanx_of_4th_fingerr",
    "Middle Phalanx IV":      "phalanx_of_4th_fingerr",
    "Distal Phalanx IV":      "phalanx_of_4th_fingerr",
    "Proximal Phalanx V":     "phalanx_of_5th_fingerr",
    "Middle Phalanx V":       "phalanx_of_5th_fingerr",
    "Distal Phalanx V":       "phalanx_of_5th_fingerr",

    // Pelvis — handled by special case in update3D
    "Hip Bone":               "__hip_bone__",

    // Lower limb
    "Femur":                  "Femurr",
    "Patella":                "Patellar",
    "Tibia":                  "Tibiar",
    "Fibula":                 "Fibular",

    // Foot tarsals
    "Talus":                  "Talusr",
    "Calcaneus":              "Calcaneusr",
    "Navicular":              "Navicular_boner",
    "Cuboid":                 "Cuboid_boner",
    "Medial Cuneiform":       "Medial_cuneiform_boner",
    "Intermediate Cuneiform": "Intermediate_cuneiform_boner",
    "Lateral Cuneiform":      "Lateral_cuneiform_boner",

    // Foot metatarsals
    "Metatarsal I":           "First_metatarsal_boner",
    "Metatarsal II":          "Second_metatarsal_boner",
    "Metatarsal III":         "Third_metatarsal_boner",
    "Metatarsal IV":          "Fourth_metatarsal_boner",
    "Metatarsal V":           "Fifth_metatarsal_boner",

    // Foot phalanges
    "Proximal Phalanx I (Foot)":    "phalanx_of_first_finger_of_footr",
    "Distal Phalanx I (Foot)":      "phalanx_of_first_finger_of_footr",
    "Proximal Phalanx II (Foot)":   "phalanx_of_second_finger_of_footr",
    "Middle Phalanx II (Foot)":     "phalanx_of_second_finger_of_footr",
    "Distal Phalanx II (Foot)":     "phalanx_of_second_finger_of_footr",
    "Proximal Phalanx III (Foot)":  "phalanx_of_third_finger_of_footr",
    "Middle Phalanx III (Foot)":    "phalanx_of_third_finger_of_footr",
    "Distal Phalanx III (Foot)":    "phalanx_of_third_finger_of_footr",
    "Proximal Phalanx IV (Foot)":   "phalanx_of_fourth_finger_of_footr",
    "Middle Phalanx IV (Foot)":     "phalanx_of_fourth_finger_of_footr",
    "Distal Phalanx IV (Foot)":     "phalanx_of_fourth_finger_of_footr",
    "Proximal Phalanx V (Foot)":    "phalanx_of_fifth_finger_of_footr",
    "Middle Phalanx V (Foot)":      "phalanx_of_fifth_finger_of_footr",
    "Distal Phalanx V (Foot)":      "phalanx_of_fifth_finger_of_footr"
};

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
