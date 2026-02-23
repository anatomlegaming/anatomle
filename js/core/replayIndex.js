// ============================================================================
// ANATOMLE — Replay Index
// Maps bone names to compact integer indices per game, for URL encoding.
// Game codes: fs=full-skeleton, h=hand, f=foot, sk=skull
// ============================================================================

var REPLAY_INDEX = {
    fs: {
        toIdx:  {"Frontal Bone": 0, "Parietal Bone": 1, "Occipital Bone": 2, "Temporal Bone": 3, "Sphenoid Bone": 4, "Ethmoid Bone": 5, "Nasal Bone": 6, "Lacrimal Bone": 7, "Zygomatic Bone": 8, "Maxilla": 9, "Palatine Bone": 10, "Vomer": 11, "Inferior Nasal Concha": 12, "Mandible": 13, "Atlas (C1)": 14, "Axis (C2)": 15, "Cervical Vertebrae": 16, "Thoracic Vertebrae": 17, "Lumbar Vertebrae": 18, "Sacrum": 19, "Coccyx": 20, "True Ribs (1-7)": 21, "False Ribs (8-10)": 22, "Floating Ribs (11-12)": 23, "Costal Cartilage (1-7)": 24, "Costal Cartilage (8-10)": 25, "Sternum": 26, "Clavicle": 27, "Scapula": 28, "Humerus": 29, "Radius": 30, "Ulna": 31, "Scaphoid": 32, "Lunate": 33, "Triquetrum": 34, "Pisiform": 35, "Trapezium": 36, "Trapezoid": 37, "Capitate": 38, "Hamate": 39, "Metacarpal I": 40, "Metacarpal II": 41, "Metacarpal III": 42, "Metacarpal IV": 43, "Metacarpal V": 44, "Proximal Phalanx (Hand)": 45, "Middle Phalanx (Hand)": 46, "Distal Phalanx (Hand)": 47, "Hip Bone": 48, "Femur": 49, "Patella": 50, "Tibia": 51, "Fibula": 52, "Talus": 53, "Calcaneus": 54, "Navicular": 55, "Medial Cuneiform": 56, "Intermediate Cuneiform": 57, "Lateral Cuneiform": 58, "Cuboid": 59, "Metatarsal I": 60, "Metatarsal II": 61, "Metatarsal III": 62, "Metatarsal IV": 63, "Metatarsal V": 64, "Proximal Phalanx (Foot)": 65, "Middle Phalanx (Foot)": 66, "Distal Phalanx (Foot)": 67},
        toBone: {"0": "Frontal Bone", "1": "Parietal Bone", "2": "Occipital Bone", "3": "Temporal Bone", "4": "Sphenoid Bone", "5": "Ethmoid Bone", "6": "Nasal Bone", "7": "Lacrimal Bone", "8": "Zygomatic Bone", "9": "Maxilla", "10": "Palatine Bone", "11": "Vomer", "12": "Inferior Nasal Concha", "13": "Mandible", "14": "Atlas (C1)", "15": "Axis (C2)", "16": "Cervical Vertebrae", "17": "Thoracic Vertebrae", "18": "Lumbar Vertebrae", "19": "Sacrum", "20": "Coccyx", "21": "True Ribs (1-7)", "22": "False Ribs (8-10)", "23": "Floating Ribs (11-12)", "24": "Costal Cartilage (1-7)", "25": "Costal Cartilage (8-10)", "26": "Sternum", "27": "Clavicle", "28": "Scapula", "29": "Humerus", "30": "Radius", "31": "Ulna", "32": "Scaphoid", "33": "Lunate", "34": "Triquetrum", "35": "Pisiform", "36": "Trapezium", "37": "Trapezoid", "38": "Capitate", "39": "Hamate", "40": "Metacarpal I", "41": "Metacarpal II", "42": "Metacarpal III", "43": "Metacarpal IV", "44": "Metacarpal V", "45": "Proximal Phalanx (Hand)", "46": "Middle Phalanx (Hand)", "47": "Distal Phalanx (Hand)", "48": "Hip Bone", "49": "Femur", "50": "Patella", "51": "Tibia", "52": "Fibula", "53": "Talus", "54": "Calcaneus", "55": "Navicular", "56": "Medial Cuneiform", "57": "Intermediate Cuneiform", "58": "Lateral Cuneiform", "59": "Cuboid", "60": "Metatarsal I", "61": "Metatarsal II", "62": "Metatarsal III", "63": "Metatarsal IV", "64": "Metatarsal V", "65": "Proximal Phalanx (Foot)", "66": "Middle Phalanx (Foot)", "67": "Distal Phalanx (Foot)"},
    },
    h: {
        toIdx:  {"Radius": 0, "Ulna": 1, "Scaphoid": 2, "Lunate": 3, "Triquetrum": 4, "Pisiform": 5, "Trapezium": 6, "Trapezoid": 7, "Capitate": 8, "Hamate": 9, "Metacarpal I": 10, "Metacarpal II": 11, "Metacarpal III": 12, "Metacarpal IV": 13, "Metacarpal V": 14, "Proximal Phalanx I": 15, "Distal Phalanx I": 16, "Proximal Phalanx II": 17, "Middle Phalanx II": 18, "Distal Phalanx II": 19, "Proximal Phalanx III": 20, "Middle Phalanx III": 21, "Distal Phalanx III": 22, "Proximal Phalanx IV": 23, "Middle Phalanx IV": 24, "Distal Phalanx IV": 25, "Proximal Phalanx V": 26, "Middle Phalanx V": 27, "Distal Phalanx V": 28},
        toBone: {"0": "Radius", "1": "Ulna", "2": "Scaphoid", "3": "Lunate", "4": "Triquetrum", "5": "Pisiform", "6": "Trapezium", "7": "Trapezoid", "8": "Capitate", "9": "Hamate", "10": "Metacarpal I", "11": "Metacarpal II", "12": "Metacarpal III", "13": "Metacarpal IV", "14": "Metacarpal V", "15": "Proximal Phalanx I", "16": "Distal Phalanx I", "17": "Proximal Phalanx II", "18": "Middle Phalanx II", "19": "Distal Phalanx II", "20": "Proximal Phalanx III", "21": "Middle Phalanx III", "22": "Distal Phalanx III", "23": "Proximal Phalanx IV", "24": "Middle Phalanx IV", "25": "Distal Phalanx IV", "26": "Proximal Phalanx V", "27": "Middle Phalanx V", "28": "Distal Phalanx V"},
    },
    f: {
        toIdx:  {"Tibia": 0, "Fibula": 1, "Talus": 2, "Calcaneus": 3, "Navicular": 4, "Cuboid": 5, "Medial Cuneiform": 6, "Intermediate Cuneiform": 7, "Lateral Cuneiform": 8, "Metatarsal I": 9, "Metatarsal II": 10, "Metatarsal III": 11, "Metatarsal IV": 12, "Metatarsal V": 13, "Proximal Phalanx I (Foot)": 14, "Distal Phalanx I (Foot)": 15, "Proximal Phalanx II (Foot)": 16, "Middle Phalanx II (Foot)": 17, "Distal Phalanx II (Foot)": 18, "Proximal Phalanx III (Foot)": 19, "Middle Phalanx III (Foot)": 20, "Distal Phalanx III (Foot)": 21, "Proximal Phalanx IV (Foot)": 22, "Middle Phalanx IV (Foot)": 23, "Distal Phalanx IV (Foot)": 24, "Proximal Phalanx V (Foot)": 25, "Middle Phalanx V (Foot)": 26, "Distal Phalanx V (Foot)": 27},
        toBone: {"0": "Tibia", "1": "Fibula", "2": "Talus", "3": "Calcaneus", "4": "Navicular", "5": "Cuboid", "6": "Medial Cuneiform", "7": "Intermediate Cuneiform", "8": "Lateral Cuneiform", "9": "Metatarsal I", "10": "Metatarsal II", "11": "Metatarsal III", "12": "Metatarsal IV", "13": "Metatarsal V", "14": "Proximal Phalanx I (Foot)", "15": "Distal Phalanx I (Foot)", "16": "Proximal Phalanx II (Foot)", "17": "Middle Phalanx II (Foot)", "18": "Distal Phalanx II (Foot)", "19": "Proximal Phalanx III (Foot)", "20": "Middle Phalanx III (Foot)", "21": "Distal Phalanx III (Foot)", "22": "Proximal Phalanx IV (Foot)", "23": "Middle Phalanx IV (Foot)", "24": "Distal Phalanx IV (Foot)", "25": "Proximal Phalanx V (Foot)", "26": "Middle Phalanx V (Foot)", "27": "Distal Phalanx V (Foot)"},
    },
    sk: {
        toIdx:  {"Frontal Bone": 0, "Parietal Bone": 1, "Occipital Bone": 2, "Temporal Bone": 3, "Sphenoid Bone": 4, "Ethmoid Bone": 5, "Nasal Bone": 6, "Lacrimal Bone": 7, "Zygomatic Bone": 8, "Maxilla": 9, "Palatine Bone": 10, "Vomer": 11, "Inferior Nasal Concha": 12, "Mandible": 13},
        toBone: {"0": "Frontal Bone", "1": "Parietal Bone", "2": "Occipital Bone", "3": "Temporal Bone", "4": "Sphenoid Bone", "5": "Ethmoid Bone", "6": "Nasal Bone", "7": "Lacrimal Bone", "8": "Zygomatic Bone", "9": "Maxilla", "10": "Palatine Bone", "11": "Vomer", "12": "Inferior Nasal Concha", "13": "Mandible"},
    },
};

// Encode a replay into a compact URL query string
window.encodeReplay = function(game, start, end, path, guessOrder, detours, bad) {
    var idx = REPLAY_INDEX[game];
    if (!idx) return null;
    var s  = idx.toIdx[start];
    var e  = idx.toIdx[end];
    var p  = path.map(function(b) { return idx.toIdx[b]; }).join(',');
    var gs = guessOrder.map(function(b) {
        var t = path.includes(b) ? 'o' : detours.includes(b) ? 'd' : 'b';
        return idx.toIdx[b] + ':' + t;
    }).join(',');
    return 'gm=' + game + '&s=' + s + '&e=' + e + '&p=' + p + '&gs=' + encodeURIComponent(gs);
};

// Decode a replay from URL search params
window.decodeReplay = function(search) {
    var p    = new URLSearchParams(search);
    var game = p.get('gm');
    var idx  = REPLAY_INDEX[game];
    if (!idx) return null;
    var start  = idx.toBone[p.get('s')];
    var end    = idx.toBone[p.get('e')];
    var path   = p.get('p').split(',').map(function(i) { return idx.toBone[i]; });
    var gsRaw  = decodeURIComponent(p.get('gs') || '').split(',').filter(Boolean);
    var guesses = gsRaw.map(function(g) {
        var parts = g.split(':');
        return { bone: idx.toBone[parts[0]], type: parts[1] };
    });
    if (!start || !end || !path[0]) return null;
    return { game: game, start: start, end: end, path: path, guesses: guesses };
};