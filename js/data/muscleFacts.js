// ============================================================================
// ANATOMLE - Muscle facts for the back of the muscle flash cards
// ============================================================================
// One entry per muscle in UPPER_LIMB_MUSCLES, keyed by the same name:
//   o  origin (proximal attachment)
//   i  insertion (distal attachment)
//   a  action
//   x  main antagonist (left out where no single muscle opposes it)
// Kept short so a card stays readable on a phone. Standard textbook
// attachments (Gray's, Moore); where sources differ the common one is used.
// ============================================================================

const MUSCLE_FACTS = {
    // ── Shoulder girdle ──────────────────────────────────────────────────────
    'Trapezius': { o: 'Occipital bone, ligamentum nuchae, spinous processes C7 to T12', i: 'Outer third of the clavicle, acromion and spine of the scapula', a: 'Upper fibers elevate, middle fibers retract, lower fibers depress the scapula; upper and lower together rotate it upward', x: 'Pectoralis minor (elevation), serratus anterior (retraction)' },
    'Levator Scapulae': { o: 'Transverse processes of C1 to C4', i: 'Medial border of the scapula, from the superior angle to the spine', a: 'Elevates the scapula and rotates it downward', x: 'Lower trapezius' },
    'Rhomboid Minor': { o: 'Spinous processes of C7 and T1', i: 'Medial border of the scapula, level with the spine', a: 'Retracts the scapula and rotates it downward', x: 'Serratus anterior' },
    'Rhomboid Major': { o: 'Spinous processes of T2 to T5', i: 'Medial border of the scapula, below the spine', a: 'Retracts the scapula and rotates it downward', x: 'Serratus anterior' },
    'Serratus Anterior': { o: 'Outer surfaces of ribs 1 to 8', i: 'Front of the medial border of the scapula', a: 'Protracts the scapula, rotates it upward and holds it against the chest wall', x: 'Rhomboids' },
    'Subclavius': { o: 'First rib and its costal cartilage', i: 'Underside of the middle third of the clavicle', a: 'Anchors and depresses the clavicle' },
    'Pectoralis Minor': { o: 'Ribs 3 to 5', i: 'Coracoid process of the scapula', a: 'Depresses and protracts the scapula', x: 'Upper trapezius' },
    'Pectoralis Major': { o: 'Clavicular head: medial clavicle. Sternocostal head: sternum and costal cartilages 1 to 6', i: 'Lateral lip of the intertubercular groove of the humerus', a: 'Adducts and medially rotates the arm; the clavicular head flexes it', x: 'Latissimus dorsi (flexion), deltoid (adduction)' },

    // ── Shoulder ─────────────────────────────────────────────────────────────
    'Subscapularis': { o: 'Subscapular fossa on the front of the scapula', i: 'Lesser tubercle of the humerus', a: 'Medially rotates the arm; rotator cuff', x: 'Infraspinatus and teres minor' },
    'Supraspinatus': { o: 'Supraspinous fossa of the scapula', i: 'Top of the greater tubercle of the humerus', a: 'Starts abduction of the arm (first 15°); rotator cuff', x: 'Latissimus dorsi' },
    'Infraspinatus': { o: 'Infraspinous fossa of the scapula', i: 'Middle of the greater tubercle of the humerus', a: 'Laterally rotates the arm; rotator cuff', x: 'Subscapularis' },
    'Teres Minor': { o: 'Upper lateral border of the scapula', i: 'Lowest facet of the greater tubercle of the humerus', a: 'Laterally rotates the arm; rotator cuff', x: 'Subscapularis' },
    'Teres Major': { o: 'Inferior angle of the scapula', i: 'Medial lip of the intertubercular groove of the humerus', a: 'Adducts, extends and medially rotates the arm', x: 'Deltoid' },
    'Deltoid': { o: 'Lateral third of the clavicle, acromion and spine of the scapula', i: 'Deltoid tuberosity of the humerus', a: 'Abducts the arm after the first 15°; front fibers flex it, back fibers extend it', x: 'Latissimus dorsi and pectoralis major' },
    'Latissimus Dorsi': { o: 'Spinous processes of T7 to T12, thoracolumbar fascia, iliac crest and lower ribs', i: 'Floor of the intertubercular groove of the humerus', a: 'Extends, adducts and medially rotates the arm', x: 'Deltoid' },

    // ── Arm ──────────────────────────────────────────────────────────────────
    'Coracobrachialis': { o: 'Tip of the coracoid process', i: 'Middle of the medial shaft of the humerus', a: 'Flexes and adducts the arm' },
    'Biceps Brachii': { o: 'Long head: supraglenoid tubercle. Short head: coracoid process', i: 'Radial tuberosity and bicipital aponeurosis', a: 'Supinates the forearm and flexes the elbow', x: 'Triceps brachii (flexion), pronator teres (supination)' },
    'Brachialis': { o: 'Lower half of the front of the humerus', i: 'Coronoid process and tuberosity of the ulna', a: 'Flexes the elbow in any forearm position', x: 'Triceps brachii' },
    'Triceps Brachii': { o: 'Long head: infraglenoid tubercle. Lateral and medial heads: back of the humerus', i: 'Olecranon of the ulna', a: 'Extends the elbow; the long head also extends the arm', x: 'Biceps brachii and brachialis' },
    'Anconeus': { o: 'Lateral epicondyle of the humerus', i: 'Lateral side of the olecranon and upper ulna', a: 'Helps extend the elbow and steadies the joint', x: 'Brachialis' },

    // ── Forearm, back ────────────────────────────────────────────────────────
    'Brachioradialis': { o: 'Upper lateral supracondylar ridge of the humerus', i: 'Radius, just above the styloid process', a: 'Flexes the elbow, strongest with the forearm half turned', x: 'Triceps brachii' },
    'Extensor Carpi Radialis Longus': { o: 'Lower lateral supracondylar ridge of the humerus', i: 'Base of the second metacarpal', a: 'Extends and abducts the wrist', x: 'Flexor carpi radialis (extension)' },
    'Extensor Carpi Radialis Brevis': { o: 'Lateral epicondyle (common extensor origin)', i: 'Base of the third metacarpal', a: 'Extends and abducts the wrist', x: 'Flexor carpi radialis (extension)' },
    'Extensor Digitorum': { o: 'Lateral epicondyle (common extensor origin)', i: 'Extensor expansions of the four fingers', a: 'Extends the fingers and helps extend the wrist', x: 'Flexor digitorum superficialis and profundus' },
    'Extensor Digiti Minimi': { o: 'Lateral epicondyle (common extensor origin)', i: 'Extensor expansion of the little finger', a: 'Extends the little finger', x: 'Flexor digiti minimi brevis' },
    'Extensor Carpi Ulnaris': { o: 'Lateral epicondyle and back of the ulna', i: 'Base of the fifth metacarpal', a: 'Extends and adducts the wrist', x: 'Flexor carpi ulnaris (extension)' },
    'Supinator': { o: 'Lateral epicondyle, ligaments of the elbow and supinator crest of the ulna', i: 'Lateral surface of the upper third of the radius', a: 'Supinates the forearm', x: 'Pronator teres and pronator quadratus' },
    'Abductor Pollicis Longus': { o: 'Back of the ulna, radius and interosseous membrane', i: 'Base of the first metacarpal', a: 'Abducts and extends the thumb at its base', x: 'Adductor pollicis' },
    'Extensor Pollicis Brevis': { o: 'Back of the radius and interosseous membrane', i: 'Base of the proximal phalanx of the thumb', a: 'Extends the thumb at its base and middle joints', x: 'Flexor pollicis brevis' },
    'Extensor Pollicis Longus': { o: 'Back of the middle third of the ulna and interosseous membrane', i: 'Base of the distal phalanx of the thumb', a: 'Extends all the joints of the thumb', x: 'Flexor pollicis longus' },
    'Extensor Indicis': { o: 'Back of the lower ulna and interosseous membrane', i: 'Extensor expansion of the index finger', a: 'Extends the index finger on its own', x: 'Flexor digitorum superficialis and profundus' },

    // ── Forearm, front ───────────────────────────────────────────────────────
    'Pronator Teres': { o: 'Humeral head: medial epicondyle. Ulnar head: coronoid process', i: 'Middle of the lateral surface of the radius', a: 'Pronates the forearm and helps flex the elbow', x: 'Supinator and biceps brachii' },
    'Flexor Carpi Radialis': { o: 'Medial epicondyle (common flexor origin)', i: 'Base of the second metacarpal', a: 'Flexes and abducts the wrist', x: 'Extensor carpi radialis longus and brevis (flexion)' },
    'Palmaris Longus': { o: 'Medial epicondyle (common flexor origin)', i: 'Flexor retinaculum and palmar aponeurosis', a: 'Weakly flexes the wrist; missing in about one in seven people' },
    'Flexor Digitorum Superficialis': { o: 'Medial epicondyle, coronoid process and front of the radius', i: 'Sides of the middle phalanges of the four fingers', a: 'Flexes the fingers at the middle and knuckle joints', x: 'Extensor digitorum' },
    'Flexor Digitorum Profundus': { o: 'Front and medial ulna and interosseous membrane', i: 'Bases of the distal phalanges of the four fingers', a: 'Flexes the fingertips, then the rest of the fingers', x: 'Extensor digitorum' },
    'Flexor Pollicis Longus': { o: 'Front of the radius and interosseous membrane', i: 'Base of the distal phalanx of the thumb', a: 'Flexes the thumb, mainly its tip', x: 'Extensor pollicis longus' },
    'Pronator Quadratus': { o: 'Front of the lower quarter of the ulna', i: 'Front of the lower quarter of the radius', a: 'Main pronator of the forearm', x: 'Supinator' },
    'Flexor Carpi Ulnaris': { o: 'Medial epicondyle, olecranon and back of the ulna', i: 'Pisiform, hook of hamate and base of the fifth metacarpal', a: 'Flexes and adducts the wrist', x: 'Extensor carpi ulnaris (flexion)' },

    // ── Hand ─────────────────────────────────────────────────────────────────
    'Abductor Pollicis Brevis': { o: 'Flexor retinaculum, scaphoid and trapezium', i: 'Base of the proximal phalanx of the thumb', a: 'Abducts the thumb', x: 'Adductor pollicis' },
    'Flexor Pollicis Brevis': { o: 'Flexor retinaculum and trapezium', i: 'Base of the proximal phalanx of the thumb', a: 'Flexes the thumb at its base', x: 'Extensor pollicis brevis' },
    'Opponens Pollicis': { o: 'Flexor retinaculum and trapezium', i: 'Lateral side of the first metacarpal', a: 'Brings the thumb across the palm to meet the fingertips (opposition)' },
    'Adductor Pollicis': { o: 'Oblique head: capitate and bases of metacarpals 2 and 3. Transverse head: third metacarpal', i: 'Base of the proximal phalanx of the thumb', a: 'Adducts the thumb; powers a pinch grip', x: 'Abductor pollicis longus and brevis' },
    'Palmaris Brevis': { o: 'Flexor retinaculum and palmar aponeurosis', i: 'Skin on the little-finger side of the palm', a: 'Wrinkles the skin of the palm and deepens its hollow' },
    'Abductor Digiti Minimi': { o: 'Pisiform', i: 'Base of the proximal phalanx of the little finger', a: 'Abducts the little finger', x: 'Third palmar interosseous' },
    'Flexor Digiti Minimi Brevis': { o: 'Hook of hamate and flexor retinaculum', i: 'Base of the proximal phalanx of the little finger', a: 'Flexes the little finger at its knuckle', x: 'Extensor digiti minimi' },
    'Opponens Digiti Minimi': { o: 'Hook of hamate and flexor retinaculum', i: 'Medial side of the fifth metacarpal', a: 'Brings the fifth metacarpal forward to meet the thumb' },
    'Lumbrical I': { o: 'Profundus tendon to the index finger', i: 'Extensor expansion of the index finger', a: 'Flexes the knuckle and extends the finger joints beyond it' },
    'Lumbrical II': { o: 'Profundus tendon to the middle finger', i: 'Extensor expansion of the middle finger', a: 'Flexes the knuckle and extends the finger joints beyond it' },
    'Lumbrical III': { o: 'Profundus tendons to the middle and ring fingers', i: 'Extensor expansion of the ring finger', a: 'Flexes the knuckle and extends the finger joints beyond it' },
    'Lumbrical IV': { o: 'Profundus tendons to the ring and little fingers', i: 'Extensor expansion of the little finger', a: 'Flexes the knuckle and extends the finger joints beyond it' },
    'Dorsal Interosseous I': { o: 'Facing sides of metacarpals 1 and 2', i: 'Lateral side of the index finger (proximal phalanx and extensor expansion)', a: 'Abducts the index finger away from the middle finger', x: 'Palmar interosseous I' },
    'Dorsal Interosseous II': { o: 'Facing sides of metacarpals 2 and 3', i: 'Lateral side of the middle finger', a: 'Moves the middle finger toward the thumb side', x: 'Dorsal interosseous III' },
    'Dorsal Interosseous III': { o: 'Facing sides of metacarpals 3 and 4', i: 'Medial side of the middle finger', a: 'Moves the middle finger toward the little-finger side', x: 'Dorsal interosseous II' },
    'Dorsal Interosseous IV': { o: 'Facing sides of metacarpals 4 and 5', i: 'Medial side of the ring finger', a: 'Abducts the ring finger away from the middle finger', x: 'Palmar interosseous II' },
    'Palmar Interosseous I': { o: 'Medial side of the second metacarpal', i: 'Medial side of the index finger', a: 'Adducts the index finger toward the middle finger', x: 'Dorsal interosseous I' },
    'Palmar Interosseous II': { o: 'Lateral side of the fourth metacarpal', i: 'Lateral side of the ring finger', a: 'Adducts the ring finger toward the middle finger', x: 'Dorsal interosseous IV' },
    'Palmar Interosseous III': { o: 'Lateral side of the fifth metacarpal', i: 'Lateral side of the little finger', a: 'Adducts the little finger toward the middle finger', x: 'Abductor digiti minimi' },
};

// a top-level const is not a window property; flashcards.js reads this one
if (typeof window !== 'undefined') window.MUSCLE_FACTS_BY_NAME = MUSCLE_FACTS;
