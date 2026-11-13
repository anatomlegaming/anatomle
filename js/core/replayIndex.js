// ============================================================================
// ANATOMLE — Replay Index
// Maps bone names to compact integer indices per game, for URL encoding.
// Game codes: fs=full-skeleton, ul=upper-limb muscles
// ============================================================================

var REPLAY_INDEX = {
    fs: {
        toIdx:  {"Frontal Bone": 0, "Parietal Bone": 1, "Occipital Bone": 2, "Temporal Bone": 3, "Sphenoid Bone": 4, "Ethmoid Bone": 5, "Nasal Bone": 6, "Lacrimal Bone": 7, "Zygomatic Bone": 8, "Maxilla": 9, "Palatine Bone": 10, "Vomer": 11, "Inferior Nasal Concha": 12, "Mandible": 13, "Atlas (C1)": 14, "Axis (C2)": 15, "Cervical Vertebrae": 16, "Thoracic Vertebrae": 17, "Lumbar Vertebrae": 18, "Sacrum": 19, "Coccyx": 20, "True Ribs (1-7)": 21, "False Ribs (8-10)": 22, "Floating Ribs (11-12)": 23, "Costal Cartilage (1-7)": 24, "Costal Cartilage (8-10)": 25, "Sternum": 26, "Clavicle": 27, "Scapula": 28, "Humerus": 29, "Radius": 30, "Ulna": 31, "Scaphoid": 32, "Lunate": 33, "Triquetrum": 34, "Pisiform": 35, "Trapezium": 36, "Trapezoid": 37, "Capitate": 38, "Hamate": 39, "Metacarpal I": 40, "Metacarpal II": 41, "Metacarpal III": 42, "Metacarpal IV": 43, "Metacarpal V": 44, "Proximal Phalanx (Hand)": 45, "Middle Phalanx (Hand)": 46, "Distal Phalanx (Hand)": 47, "Hip Bone": 48, "Femur": 49, "Patella": 50, "Tibia": 51, "Fibula": 52, "Talus": 53, "Calcaneus": 54, "Navicular": 55, "Medial Cuneiform": 56, "Intermediate Cuneiform": 57, "Lateral Cuneiform": 58, "Cuboid": 59, "Metatarsal I": 60, "Metatarsal II": 61, "Metatarsal III": 62, "Metatarsal IV": 63, "Metatarsal V": 64, "Proximal Phalanx (Foot)": 65, "Middle Phalanx (Foot)": 66, "Distal Phalanx (Foot)": 67},
        toBone: {"0": "Frontal Bone", "1": "Parietal Bone", "2": "Occipital Bone", "3": "Temporal Bone", "4": "Sphenoid Bone", "5": "Ethmoid Bone", "6": "Nasal Bone", "7": "Lacrimal Bone", "8": "Zygomatic Bone", "9": "Maxilla", "10": "Palatine Bone", "11": "Vomer", "12": "Inferior Nasal Concha", "13": "Mandible", "14": "Atlas (C1)", "15": "Axis (C2)", "16": "Cervical Vertebrae", "17": "Thoracic Vertebrae", "18": "Lumbar Vertebrae", "19": "Sacrum", "20": "Coccyx", "21": "True Ribs (1-7)", "22": "False Ribs (8-10)", "23": "Floating Ribs (11-12)", "24": "Costal Cartilage (1-7)", "25": "Costal Cartilage (8-10)", "26": "Sternum", "27": "Clavicle", "28": "Scapula", "29": "Humerus", "30": "Radius", "31": "Ulna", "32": "Scaphoid", "33": "Lunate", "34": "Triquetrum", "35": "Pisiform", "36": "Trapezium", "37": "Trapezoid", "38": "Capitate", "39": "Hamate", "40": "Metacarpal I", "41": "Metacarpal II", "42": "Metacarpal III", "43": "Metacarpal IV", "44": "Metacarpal V", "45": "Proximal Phalanx (Hand)", "46": "Middle Phalanx (Hand)", "47": "Distal Phalanx (Hand)", "48": "Hip Bone", "49": "Femur", "50": "Patella", "51": "Tibia", "52": "Fibula", "53": "Talus", "54": "Calcaneus", "55": "Navicular", "56": "Medial Cuneiform", "57": "Intermediate Cuneiform", "58": "Lateral Cuneiform", "59": "Cuboid", "60": "Metatarsal I", "61": "Metatarsal II", "62": "Metatarsal III", "63": "Metatarsal IV", "64": "Metatarsal V", "65": "Proximal Phalanx (Foot)", "66": "Middle Phalanx (Foot)", "67": "Distal Phalanx (Foot)"},
    },
};

// Upper-limb muscle index. Append new muscles
// to the END of this list so existing replay links keep decoding correctly.
(function() {
    var muscles = ["Trapezius", "Levator Scapulae", "Rhomboid Minor", "Rhomboid Major", "Serratus Anterior", "Subclavius", "Pectoralis Minor", "Pectoralis Major", "Subscapularis", "Supraspinatus", "Infraspinatus", "Teres Minor", "Teres Major", "Deltoid", "Latissimus Dorsi", "Coracobrachialis", "Biceps Brachii", "Brachialis", "Triceps Brachii", "Anconeus", "Brachioradialis", "Extensor Carpi Radialis Longus", "Extensor Carpi Radialis Brevis", "Extensor Digitorum", "Extensor Digiti Minimi", "Extensor Carpi Ulnaris", "Supinator", "Abductor Pollicis Longus", "Extensor Pollicis Brevis", "Extensor Pollicis Longus", "Extensor Indicis", "Pronator Teres", "Flexor Carpi Radialis", "Palmaris Longus", "Flexor Digitorum Superficialis", "Flexor Digitorum Profundus", "Flexor Pollicis Longus", "Pronator Quadratus", "Flexor Carpi Ulnaris", "Abductor Pollicis Brevis", "Flexor Pollicis Brevis", "Opponens Pollicis", "Adductor Pollicis", "Palmaris Brevis", "Abductor Digiti Minimi", "Flexor Digiti Minimi Brevis", "Opponens Digiti Minimi", "Lumbrical I", "Lumbrical II", "Lumbrical III", "Lumbrical IV", "Dorsal Interosseous I", "Dorsal Interosseous II", "Dorsal Interosseous III", "Dorsal Interosseous IV", "Palmar Interosseous I", "Palmar Interosseous II", "Palmar Interosseous III"];
    var toIdx = {}, toBone = {};
    muscles.forEach(function(m, i) { toIdx[m] = i; toBone[String(i)] = m; });
    REPLAY_INDEX.ul = { toIdx: toIdx, toBone: toBone };
})();

// Encode a replay into a compact URL query string
window.encodeReplay = function(game, start, end, path, guessOrder, detours, bad) {
    var idx = REPLAY_INDEX[game];
    if (!idx) return null;
    var s  = idx.toIdx[start];
    var e  = idx.toIdx[end];
    var p  = path.map(function(b) { return idx.toIdx[b]; }).join(',');
    var gs = guessOrder.map(function(b) {
        var t = bad.includes(b) ? 'b' : detours.includes(b) ? 'd' : 'o';
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