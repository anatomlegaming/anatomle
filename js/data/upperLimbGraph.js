// ============================================================================
// ANATOMLE - Upper Limb Muscle Graph
// ============================================================================
// Each muscle node contains:
//   bone: [neighbours] — shared bony attachment (standard mode)
//   nerve: [neighbours] — shared nerve supply (challenge mode)
//   supply: string — nerve that innervates this muscle (for hint system)
//   meshes: [string] — GLB node name(s) to highlight (supports multi-mesh muscles)
//   nerveHint: string — GLB nerve mesh node to light up as hint
// ============================================================================

const UPPER_LIMB_MUSCLES = {

    // ── PECTORAL GIRDLE ──────────────────────────────────────────────────────

    'Trapezius': {
        bone:  ['Levator Scapulae', 'Rhomboid Minor', 'Rhomboid Major', 'Deltoid', 'Supraspinatus', 'Infraspinatus'],
        nerve: ['Levator Scapulae', 'Rhomboid Minor', 'Rhomboid Major', 'Deltoid', 'Supraspinatus'], // spinal accessory — connect via scapular muscles anatomically
        supply: 'Spinal Accessory',
        meshes: ['Trapezius_muscler','Ascending_part_of_Trapezius_muscler','Descending_part_of_Trapezius_muscler','Transverse_part_of_trapezius_muscler'],
        nerveHint: null // no mesh in model for spinal accessory
    },
    'Levator Scapulae': {
        bone:  ['Trapezius', 'Rhomboid Minor', 'Serratus Anterior'],
        nerve: ['Rhomboid Minor', 'Rhomboid Major', 'Serratus Anterior'],
        supply: 'Dorsal Scapular',
        meshes: ['Levator_scapulaer'],
        nerveHint: 'Dorsal_scapular_nerver'
    },
    'Rhomboid Minor': {
        bone:  ['Trapezius', 'Levator Scapulae', 'Rhomboid Major'],
        nerve: ['Levator Scapulae', 'Rhomboid Major', 'Serratus Anterior'],
        supply: 'Dorsal Scapular',
        meshes: ['Rhomboid_minor_muscler'],
        nerveHint: 'Dorsal_scapular_nerver'
    },
    'Rhomboid Major': {
        bone:  ['Rhomboid Minor', 'Trapezius', 'Serratus Anterior', 'Subscapularis'],
        nerve: ['Levator Scapulae', 'Rhomboid Minor', 'Serratus Anterior'],
        supply: 'Dorsal Scapular',
        meshes: ['Rhomboid_major_muscler'],
        nerveHint: 'Dorsal_scapular_nerver'
    },
    'Serratus Anterior': {
        bone:  ['Levator Scapulae', 'Rhomboid Major', 'Pectoralis Minor', 'Subscapularis', 'Subclavius'],
        nerve: ['Subclavius', 'Pectoralis Minor', 'Rhomboid Minor', 'Rhomboid Major', 'Levator Scapulae'],
        supply: 'Long Thoracic',
        meshes: ['Serratus_anterior_muscler'],
        nerveHint: 'Long_thoracic_nerver'
    },
    'Subclavius': {
        bone:  ['Pectoralis Major', 'Pectoralis Minor', 'Serratus Anterior'],
        nerve: ['Serratus Anterior', 'Pectoralis Minor'],
        supply: 'Subclavian',
        meshes: ['Subclavius_muscler'],
        nerveHint: 'Subclavian_nerver'
    },
    'Pectoralis Minor': {
        bone:  ['Subclavius', 'Pectoralis Major', 'Serratus Anterior', 'Coracobrachialis', 'Biceps Brachii'],
        nerve: ['Pectoralis Major', 'Pronator Teres', 'Serratus Anterior', 'Subclavius'],
        supply: 'Medial Pectoral',
        meshes: ['Pectoralis_minor_muscler'],
        nerveHint: 'Medial_pectoral_nerver'
    },
    'Pectoralis Major': {
        bone:  ['Subclavius', 'Pectoralis Minor', 'Deltoid', 'Coracobrachialis', 'Biceps Brachii', 'Latissimus Dorsi'],
        nerve: ['Pectoralis Minor', 'Pronator Teres'],
        supply: 'Lateral & Medial Pectoral',
        meshes: ['Pectoralis_majorr','Clavicular_head_of_pectoralis_major_muscler','Sternocostal_head_of_pectoralis_major_muscler','Abdominal_head_of_pectoralis_major_muscler'],
        nerveHint: 'Lateral_pectoral_nerver'
    },
    'Subscapularis': {
        bone:  ['Serratus Anterior', 'Rhomboid Major', 'Teres Major', 'Teres Minor', 'Coracobrachialis'],
        nerve: ['Teres Major', 'Teres Minor', 'Triceps Brachii'],
        supply: 'Upper & Lower Subscapular',
        meshes: ['Subscapularis_muscler'],
        nerveHint: 'Upper_subscapular_nerver'
    },
    'Supraspinatus': {
        bone:  ['Trapezius', 'Infraspinatus', 'Deltoid'],
        nerve: ['Infraspinatus', 'Deltoid', 'Trapezius'],
        supply: 'Suprascapular',
        meshes: ['Supraspinatus_muscler'],
        nerveHint: 'Suprascapular_nerver'
    },
    'Infraspinatus': {
        bone:  ['Trapezius', 'Supraspinatus', 'Teres Minor', 'Deltoid'],
        nerve: ['Supraspinatus', 'Deltoid'],
        supply: 'Suprascapular',
        meshes: ['Infraspinatus_muscler'],
        nerveHint: 'Suprascapular_nerver'
    },
    'Teres Minor': {
        bone:  ['Infraspinatus', 'Teres Major', 'Latissimus Dorsi', 'Deltoid', 'Subscapularis'],
        nerve: ['Deltoid', 'Subscapularis', 'Triceps Brachii'],
        supply: 'Axillary',
        meshes: ['Teres_minor_muscler'],
        nerveHint: 'Axillary_nerve_-_superior_lateral_br_cutaneous_nerver'
    },
    'Teres Major': {
        bone:  ['Subscapularis', 'Teres Minor', 'Latissimus Dorsi', 'Coracobrachialis', 'Triceps Brachii'],
        nerve: ['Subscapularis', 'Latissimus Dorsi', 'Triceps Brachii'],
        supply: 'Lower Subscapular',
        meshes: ['Teres_major_muscler'],
        nerveHint: 'Lower_subscapular_nerver'
    },
    'Deltoid': {
        bone:  ['Trapezius', 'Supraspinatus', 'Infraspinatus', 'Teres Minor', 'Pectoralis Major', 'Brachialis', 'Triceps Brachii'],
        nerve: ['Teres Minor', 'Triceps Brachii', 'Supraspinatus', 'Infraspinatus', 'Trapezius'],
        supply: 'Axillary',
        meshes: ['Deltoid_muscler','Acromial_part_of_deltoid_muscler','Clavicular_part_of_deltoid_muscler','Spinal_part_of_deltoid_muscler'],
        nerveHint: 'Axillary_nerve_-_superior_lateral_br_cutaneous_nerver'
    },
    'Latissimus Dorsi': {
        bone:  ['Teres Major', 'Teres Minor', 'Pectoralis Major', 'Triceps Brachii'],
        nerve: ['Teres Major', 'Triceps Brachii', 'Deltoid', 'Teres Minor'],
        supply: 'Thoracodorsal',
        meshes: ['Latissimus_dorsir'],
        nerveHint: null // thoracodorsal not in model
    },

    // ── ARM ──────────────────────────────────────────────────────────────────

    'Coracobrachialis': {
        bone:  ['Pectoralis Minor', 'Pectoralis Major', 'Subscapularis', 'Teres Major', 'Biceps Brachii', 'Brachialis'],
        nerve: ['Biceps Brachii', 'Brachialis', 'Pronator Teres'],
        supply: 'Musculocutaneous',
        meshes: ['Coracobrachialis_muscler'],
        nerveHint: 'Musculocutaneus_nerver'
    },
    'Biceps Brachii': {
        bone:  ['Pectoralis Minor', 'Pectoralis Major', 'Coracobrachialis', 'Brachialis', 'Supinator', 'Pronator Teres'],
        nerve: ['Coracobrachialis', 'Brachialis', 'Pronator Teres', 'Triceps Brachii'],
        supply: 'Musculocutaneous',
        meshes: ['Long_head_of_biceps_brachiir','Short_head_of_biceps_brachiir','Common_tendon_of_biceps_brachiir','Bicipital_aponeurosisr','Long_head_of_biceps_brachii_tendon_sheathr'],
        nerveHint: 'Musculocutaneus_nerver'
    },
    'Brachialis': {
        bone:  ['Deltoid', 'Coracobrachialis', 'Biceps Brachii', 'Triceps Brachii', 'Pronator Teres', 'Brachioradialis'],
        nerve: ['Coracobrachialis', 'Biceps Brachii', 'Pronator Teres'],
        supply: 'Musculocutaneous',
        meshes: ['Brachialis_muscler'],
        nerveHint: 'Musculocutaneus_nerver'
    },
    'Triceps Brachii': {
        bone:  ['Deltoid', 'Latissimus Dorsi', 'Teres Major', 'Brachialis', 'Anconeus', 'Brachioradialis', 'Extensor Carpi Radialis Longus'],
        nerve: ['Anconeus', 'Brachioradialis', 'Extensor Carpi Radialis Longus', 'Extensor Carpi Radialis Brevis', 'Extensor Digitorum', 'Extensor Digiti Minimi', 'Extensor Carpi Ulnaris', 'Supinator', 'Biceps Brachii', 'Deltoid', 'Teres Minor', 'Teres Major', 'Subscapularis', 'Latissimus Dorsi'],
        supply: 'Radial',
        meshes: ['Long_head_of_triceps_brachiir','Lateral_head_of_triceps_brachiir','Medial_head_of_triceps_brachiir','Common_tendon_of_triceps_brachiir'],
        nerveHint: 'Radial_nerver'
    },

    // ── FOREARM — POSTERIOR (RADIAL) COMPARTMENT ─────────────────────────────

    'Anconeus': {
        bone:  ['Triceps Brachii', 'Extensor Carpi Ulnaris', 'Supinator'],
        nerve: ['Triceps Brachii', 'Brachioradialis', 'Extensor Carpi Radialis Longus', 'Extensor Carpi Radialis Brevis', 'Extensor Digitorum', 'Extensor Digiti Minimi', 'Extensor Carpi Ulnaris', 'Supinator'],
        supply: 'Radial',
        meshes: ['Anconeus_muscler'],
        nerveHint: 'Radial_nerver'
    },
    'Brachioradialis': {
        bone:  ['Brachialis', 'Triceps Brachii', 'Extensor Carpi Radialis Longus', 'Pronator Teres'],
        nerve: ['Triceps Brachii', 'Anconeus', 'Extensor Carpi Radialis Longus', 'Extensor Carpi Radialis Brevis', 'Extensor Digitorum', 'Extensor Digiti Minimi', 'Extensor Carpi Ulnaris', 'Supinator'],
        supply: 'Radial',
        meshes: ['Brachioradialis_muscler'],
        nerveHint: 'Radial_nerver'
    },
    'Extensor Carpi Radialis Longus': {
        bone:  ['Triceps Brachii', 'Brachioradialis', 'Extensor Carpi Radialis Brevis', 'Pronator Teres'],
        nerve: ['Triceps Brachii', 'Anconeus', 'Brachioradialis', 'Extensor Carpi Radialis Brevis', 'Extensor Digitorum', 'Extensor Digiti Minimi', 'Extensor Carpi Ulnaris', 'Supinator'],
        supply: 'Radial',
        meshes: ['Extensor_carpi_radialis_longusr'],
        nerveHint: 'Radial_nerver'
    },
    'Extensor Carpi Radialis Brevis': {
        bone:  ['Extensor Carpi Radialis Longus', 'Extensor Digitorum', 'Supinator', 'Pronator Teres'],
        nerve: ['Triceps Brachii', 'Anconeus', 'Brachioradialis', 'Extensor Carpi Radialis Longus', 'Extensor Digitorum', 'Extensor Digiti Minimi', 'Extensor Carpi Ulnaris', 'Supinator'],
        supply: 'Radial (Deep)',
        meshes: ['Extensor_carpi_radialis_brevisr'],
        nerveHint: 'Radial_nerve_(deep_branch)r'
    },
    'Extensor Digitorum': {
        bone:  ['Extensor Carpi Radialis Brevis', 'Extensor Digiti Minimi', 'Extensor Carpi Ulnaris', 'Supinator'],
        nerve: ['Triceps Brachii', 'Anconeus', 'Brachioradialis', 'Extensor Carpi Radialis Longus', 'Extensor Carpi Radialis Brevis', 'Extensor Digiti Minimi', 'Extensor Carpi Ulnaris', 'Supinator', 'Abductor Pollicis Longus', 'Extensor Pollicis Brevis', 'Extensor Pollicis Longus', 'Extensor Indicis'],
        supply: 'Radial (Deep / PIN)',
        meshes: ['Extensor_digitorumr'],
        nerveHint: 'Radial_nerve_(posterior_interosseus_n)r'
    },
    'Extensor Digiti Minimi': {
        bone:  ['Extensor Digitorum', 'Extensor Carpi Ulnaris'],
        nerve: ['Triceps Brachii', 'Anconeus', 'Brachioradialis', 'Extensor Carpi Radialis Longus', 'Extensor Carpi Radialis Brevis', 'Extensor Digitorum', 'Extensor Carpi Ulnaris', 'Supinator', 'Abductor Pollicis Longus', 'Extensor Pollicis Brevis', 'Extensor Pollicis Longus', 'Extensor Indicis'],
        supply: 'Radial (Deep / PIN)',
        meshes: ['Extensor_digiti_minimir'],
        nerveHint: 'Radial_nerve_(posterior_interosseus_n)r'
    },
    'Extensor Carpi Ulnaris': {
        bone:  ['Anconeus', 'Extensor Digitorum', 'Extensor Digiti Minimi', 'Flexor Carpi Ulnaris'],
        nerve: ['Triceps Brachii', 'Anconeus', 'Brachioradialis', 'Extensor Carpi Radialis Longus', 'Extensor Carpi Radialis Brevis', 'Extensor Digitorum', 'Extensor Digiti Minimi', 'Supinator', 'Abductor Pollicis Longus', 'Extensor Pollicis Brevis', 'Extensor Pollicis Longus', 'Extensor Indicis'],
        supply: 'Radial (Deep / PIN)',
        meshes: ['Extensor_carpi_ulnarisr','Humeral_head_of_extensor_carpi_ulnarisr','Ulnar_head_of_extensor_carpi_ulnarisr','Common_tendon_of_extensor_carpi_ulnarisr'],
        nerveHint: 'Radial_nerve_(posterior_interosseus_n)r'
    },
    'Supinator': {
        bone:  ['Anconeus', 'Biceps Brachii', 'Extensor Carpi Radialis Brevis', 'Extensor Digitorum', 'Abductor Pollicis Longus', 'Pronator Teres'],
        nerve: ['Triceps Brachii', 'Anconeus', 'Brachioradialis', 'Extensor Carpi Radialis Longus', 'Extensor Carpi Radialis Brevis', 'Extensor Digitorum', 'Extensor Digiti Minimi', 'Extensor Carpi Ulnaris'],
        supply: 'Radial (Deep)',
        meshes: ['Supinatorr'],
        nerveHint: 'Radial_nerve_(deep_branch)r'
    },
    'Abductor Pollicis Longus': {
        bone:  ['Supinator', 'Extensor Pollicis Brevis', 'Extensor Pollicis Longus'],
        nerve: ['Extensor Digitorum', 'Extensor Digiti Minimi', 'Extensor Carpi Ulnaris', 'Extensor Pollicis Brevis', 'Extensor Pollicis Longus', 'Extensor Indicis'],
        supply: 'Radial (PIN)',
        meshes: ['Abductor_pollicis_longusr'],
        nerveHint: 'Radial_nerve_(posterior_interosseus_n)r'
    },
    'Extensor Pollicis Brevis': {
        bone:  ['Abductor Pollicis Longus', 'Extensor Pollicis Longus'],
        nerve: ['Extensor Digitorum', 'Extensor Digiti Minimi', 'Extensor Carpi Ulnaris', 'Abductor Pollicis Longus', 'Extensor Pollicis Longus', 'Extensor Indicis'],
        supply: 'Radial (PIN)',
        meshes: ['Extensor_pollicis_brevisr'],
        nerveHint: 'Radial_nerve_(posterior_interosseus_n)r'
    },
    'Extensor Pollicis Longus': {
        bone:  ['Abductor Pollicis Longus', 'Extensor Pollicis Brevis', 'Extensor Indicis'],
        nerve: ['Extensor Digitorum', 'Extensor Digiti Minimi', 'Extensor Carpi Ulnaris', 'Abductor Pollicis Longus', 'Extensor Pollicis Brevis', 'Extensor Indicis'],
        supply: 'Radial (PIN)',
        meshes: ['Extensor_pollicis_longusr'],
        nerveHint: 'Radial_nerve_(posterior_interosseus_n)r'
    },
    'Extensor Indicis': {
        bone:  ['Extensor Pollicis Longus', 'Flexor Digitorum Profundus'],
        nerve: ['Extensor Digitorum', 'Extensor Digiti Minimi', 'Extensor Carpi Ulnaris', 'Abductor Pollicis Longus', 'Extensor Pollicis Brevis', 'Extensor Pollicis Longus'],
        supply: 'Radial (PIN)',
        meshes: ['Extensor_indicisr'],
        nerveHint: 'Radial_nerve_(posterior_interosseus_n)r'
    },

    // ── FOREARM — ANTERIOR (MEDIAN) COMPARTMENT ──────────────────────────────

    'Pronator Teres': {
        bone:  ['Biceps Brachii', 'Brachialis', 'Brachioradialis', 'Flexor Carpi Radialis', 'Palmaris Longus', 'Flexor Digitorum Superficialis', 'Supinator', 'Extensor Carpi Radialis Longus', 'Extensor Carpi Radialis Brevis'],
        nerve: ['Flexor Carpi Radialis', 'Palmaris Longus', 'Flexor Digitorum Superficialis', 'Flexor Digitorum Profundus', 'Flexor Pollicis Longus', 'Pronator Quadratus', 'Biceps Brachii', 'Brachialis', 'Coracobrachialis', 'Pectoralis Major', 'Pectoralis Minor'],
        supply: 'Median',
        meshes: ['Humeral_head_of_pronator_teresr','Ulnar_head_of_pronator_teresr'],
        nerveHint: 'Median_nerver'
    },
    'Flexor Carpi Radialis': {
        bone:  ['Pronator Teres', 'Palmaris Longus', 'Flexor Digitorum Superficialis'],
        nerve: ['Pronator Teres', 'Palmaris Longus', 'Flexor Digitorum Superficialis', 'Flexor Digitorum Profundus', 'Flexor Pollicis Longus', 'Pronator Quadratus'],
        supply: 'Median',
        meshes: ['Flexor_carpi_radialisr'],
        nerveHint: 'Median_nerver'
    },
    'Palmaris Longus': {
        bone:  ['Pronator Teres', 'Flexor Carpi Radialis', 'Flexor Digitorum Superficialis', 'Abductor Pollicis Brevis'],
        nerve: ['Pronator Teres', 'Flexor Carpi Radialis', 'Flexor Digitorum Superficialis', 'Flexor Digitorum Profundus', 'Flexor Pollicis Longus', 'Pronator Quadratus'],
        supply: 'Median',
        meshes: ['Palmaris_longus_muscler'],
        nerveHint: 'Median_nerver'
    },
    'Flexor Digitorum Superficialis': {
        bone:  ['Pronator Teres', 'Flexor Carpi Radialis', 'Palmaris Longus', 'Flexor Carpi Ulnaris', 'Flexor Digitorum Profundus'],
        nerve: ['Pronator Teres', 'Flexor Carpi Radialis', 'Palmaris Longus', 'Flexor Digitorum Profundus', 'Flexor Pollicis Longus', 'Pronator Quadratus'],
        supply: 'Median',
        meshes: ['Flexor_digitorum_superficialis_humero-ulnar_headr','Flexor_digitorum_superficialis_radial_headr'],
        nerveHint: 'Median_nerver'
    },
    'Flexor Digitorum Profundus': {
        bone:  ['Flexor Digitorum Superficialis', 'Flexor Carpi Ulnaris', 'Flexor Pollicis Longus', 'Extensor Indicis', 'Pronator Quadratus', 'Lumbrical I', 'Lumbrical II', 'Lumbrical III', 'Lumbrical IV'],
        nerve: ['Pronator Teres', 'Flexor Carpi Radialis', 'Palmaris Longus', 'Flexor Digitorum Superficialis', 'Flexor Pollicis Longus', 'Pronator Quadratus', 'Lumbrical I', 'Lumbrical II', 'Flexor Carpi Ulnaris', 'Lumbrical III', 'Lumbrical IV', 'Abductor Digiti Minimi', 'Flexor Digiti Minimi Brevis', 'Opponens Digiti Minimi', 'Adductor Pollicis', 'Palmaris Brevis'],
        supply: 'Median (lat) & Ulnar (med)',
        meshes: ['Flexor_digitorum_profundusr'],
        nerveHint: 'Median_nerver'
    },
    'Flexor Pollicis Longus': {
        bone:  ['Flexor Digitorum Profundus', 'Pronator Quadratus', 'Flexor Pollicis Brevis', 'Abductor Pollicis Brevis', 'Opponens Pollicis'],
        nerve: ['Pronator Teres', 'Flexor Carpi Radialis', 'Palmaris Longus', 'Flexor Digitorum Superficialis', 'Flexor Digitorum Profundus', 'Pronator Quadratus'],
        supply: 'Median (AIN)',
        meshes: ['Flexor_pollicis_longusr'],
        nerveHint: 'Median_nerver'
    },
    'Pronator Quadratus': {
        bone:  ['Flexor Digitorum Profundus', 'Flexor Pollicis Longus', 'Flexor Carpi Ulnaris'],
        nerve: ['Pronator Teres', 'Flexor Carpi Radialis', 'Palmaris Longus', 'Flexor Digitorum Superficialis', 'Flexor Digitorum Profundus', 'Flexor Pollicis Longus'],
        supply: 'Median (AIN)',
        meshes: ['Pronator_quadratusr'],
        nerveHint: 'Median_nerver'
    },

    // ── FOREARM — ANTERIOR (ULNAR) ────────────────────────────────────────────

    'Flexor Carpi Ulnaris': {
        bone:  ['Flexor Digitorum Superficialis', 'Flexor Digitorum Profundus', 'Pronator Quadratus', 'Abductor Digiti Minimi', 'Flexor Digiti Minimi Brevis', 'Opponens Digiti Minimi', 'Extensor Carpi Ulnaris', 'Palmaris Brevis'],
        nerve: ['Flexor Digitorum Profundus', 'Abductor Digiti Minimi', 'Flexor Digiti Minimi Brevis', 'Opponens Digiti Minimi', 'Palmaris Brevis', 'Adductor Pollicis', 'Flexor Pollicis Brevis', 'Lumbrical III', 'Lumbrical IV', 'Dorsal Interosseous I', 'Dorsal Interosseous II', 'Dorsal Interosseous III', 'Dorsal Interosseous IV', 'Palmar Interosseous I', 'Palmar Interosseous II', 'Palmar Interosseous III'],
        supply: 'Ulnar',
        meshes: ['Flexor_carpi_ulnarisr','Humeral_head_of_flexor_carpi_ulnarisr','Ulnar_head_of_flexor_carpi_ulnarisr','Common_tendon_of_flexor_carpi_ulnarisr'],
        nerveHint: 'Ulnar_nerver'
    },

    // ── HAND — THENAR ────────────────────────────────────────────────────────

    'Abductor Pollicis Brevis': {
        bone:  ['Palmaris Longus', 'Flexor Pollicis Longus', 'Flexor Pollicis Brevis', 'Opponens Pollicis'],
        nerve: ['Flexor Pollicis Brevis', 'Opponens Pollicis', 'Lumbrical I', 'Lumbrical II'],
        supply: 'Median (Recurrent)',
        meshes: ['Abductor_pollicis_brevisr'],
        nerveHint: 'Median_nerve_Recurrent_br'
    },
    'Flexor Pollicis Brevis': {
        bone:  ['Abductor Pollicis Brevis', 'Opponens Pollicis', 'Adductor Pollicis', 'Flexor Pollicis Longus'],
        nerve: ['Abductor Pollicis Brevis', 'Opponens Pollicis', 'Lumbrical I', 'Lumbrical II', 'Adductor Pollicis', 'Palmar Interosseous I', 'Palmar Interosseous II', 'Palmar Interosseous III', 'Flexor Carpi Ulnaris'],
        supply: 'Median (sup head) & Ulnar (deep head)',
        meshes: ['Superficial_head_of_flexor_pollicis_brevisr','Deep_head_of_flexor_pollicis_brevisr'],
        nerveHint: 'Median_nerve_Recurrent_br'
    },
    'Opponens Pollicis': {
        bone:  ['Abductor Pollicis Brevis', 'Flexor Pollicis Brevis', 'Flexor Pollicis Longus'],
        nerve: ['Abductor Pollicis Brevis', 'Flexor Pollicis Brevis', 'Lumbrical I', 'Lumbrical II'],
        supply: 'Median (Recurrent)',
        meshes: ['Opponens_pollicis_muscler'],
        nerveHint: 'Median_nerve_Recurrent_br'
    },
    'Adductor Pollicis': {
        bone:  ['Flexor Pollicis Brevis', 'Lumbrical I', 'Dorsal Interosseous I', 'Palmar Interosseous I'],
        nerve: ['Flexor Carpi Ulnaris', 'Abductor Digiti Minimi', 'Flexor Digiti Minimi Brevis', 'Opponens Digiti Minimi', 'Palmaris Brevis', 'Flexor Pollicis Brevis', 'Lumbrical III', 'Lumbrical IV', 'Dorsal Interosseous I', 'Dorsal Interosseous II', 'Dorsal Interosseous III', 'Dorsal Interosseous IV', 'Palmar Interosseous I', 'Palmar Interosseous II', 'Palmar Interosseous III'],
        supply: 'Ulnar (Deep)',
        meshes: ['Adductor_pollicisr','Oblique_head_of_adductor_pollicisr','Transverse_head_of_adductor_pollicisr'],
        nerveHint: 'Ulnar_nerve_Deep_br'
    },

    // ── HAND — HYPOTHENAR ────────────────────────────────────────────────────

    'Palmaris Brevis': {
        bone:  ['Flexor Carpi Ulnaris', 'Abductor Digiti Minimi'],
        nerve: ['Flexor Carpi Ulnaris', 'Abductor Digiti Minimi', 'Flexor Digiti Minimi Brevis', 'Opponens Digiti Minimi', 'Adductor Pollicis', 'Lumbrical III', 'Lumbrical IV', 'Dorsal Interosseous I', 'Dorsal Interosseous II', 'Dorsal Interosseous III', 'Dorsal Interosseous IV', 'Palmar Interosseous I', 'Palmar Interosseous II', 'Palmar Interosseous III', 'Flexor Digitorum Profundus'],
        supply: 'Ulnar (Superficial)',
        meshes: ['Palmaris_brevis_muscler'],
        nerveHint: 'Ulnar_nerve_Superficial_br_Common_palmar_digital_n'
    },
    'Abductor Digiti Minimi': {
        bone:  ['Flexor Carpi Ulnaris', 'Palmaris Brevis', 'Flexor Digiti Minimi Brevis', 'Opponens Digiti Minimi', 'Lumbrical IV', 'Dorsal Interosseous IV', 'Palmar Interosseous III'],
        nerve: ['Flexor Carpi Ulnaris', 'Palmaris Brevis', 'Flexor Digiti Minimi Brevis', 'Opponens Digiti Minimi', 'Adductor Pollicis', 'Lumbrical III', 'Lumbrical IV', 'Dorsal Interosseous I', 'Dorsal Interosseous II', 'Dorsal Interosseous III', 'Dorsal Interosseous IV', 'Palmar Interosseous I', 'Palmar Interosseous II', 'Palmar Interosseous III'],
        supply: 'Ulnar (Deep)',
        meshes: ['Abductor_digiti_minimir'],
        nerveHint: 'Ulnar_nerve_Deep_br'
    },
    'Flexor Digiti Minimi Brevis': {
        bone:  ['Abductor Digiti Minimi', 'Opponens Digiti Minimi', 'Flexor Carpi Ulnaris'],
        nerve: ['Flexor Carpi Ulnaris', 'Palmaris Brevis', 'Abductor Digiti Minimi', 'Opponens Digiti Minimi', 'Adductor Pollicis', 'Lumbrical III', 'Lumbrical IV', 'Dorsal Interosseous I', 'Dorsal Interosseous II', 'Dorsal Interosseous III', 'Dorsal Interosseous IV', 'Palmar Interosseous I', 'Palmar Interosseous II', 'Palmar Interosseous III'],
        supply: 'Ulnar (Deep)',
        meshes: ['Flexor_digiti_minimi_brevis_of_handr'],
        nerveHint: 'Ulnar_nerve_Deep_br'
    },
    'Opponens Digiti Minimi': {
        bone:  ['Flexor Carpi Ulnaris', 'Abductor Digiti Minimi', 'Flexor Digiti Minimi Brevis'],
        nerve: ['Flexor Carpi Ulnaris', 'Palmaris Brevis', 'Abductor Digiti Minimi', 'Flexor Digiti Minimi Brevis', 'Adductor Pollicis', 'Lumbrical III', 'Lumbrical IV', 'Dorsal Interosseous I', 'Dorsal Interosseous II', 'Dorsal Interosseous III', 'Dorsal Interosseous IV', 'Palmar Interosseous I', 'Palmar Interosseous II', 'Palmar Interosseous III'],
        supply: 'Ulnar (Deep)',
        meshes: ['Opponens_digiti_minimi_muscle_of_handr'],
        nerveHint: 'Ulnar_nerve_Deep_br'
    },

    // ── HAND — LUMBRICALS ────────────────────────────────────────────────────

    'Lumbrical I': {
        bone:  ['Flexor Digitorum Profundus', 'Adductor Pollicis', 'Dorsal Interosseous I', 'Lumbrical II'],
        nerve: ['Abductor Pollicis Brevis', 'Flexor Pollicis Brevis', 'Opponens Pollicis', 'Lumbrical II', 'Flexor Digitorum Profundus'],
        supply: 'Median',
        meshes: ['1st_lumbrical_of_handr'],
        nerveHint: 'Median_nerve_Common_palmar_digital_nerves'
    },
    'Lumbrical II': {
        bone:  ['Flexor Digitorum Profundus', 'Lumbrical I', 'Lumbrical III', 'Dorsal Interosseous II'],
        nerve: ['Abductor Pollicis Brevis', 'Flexor Pollicis Brevis', 'Opponens Pollicis', 'Lumbrical I', 'Lumbrical III', 'Lumbrical IV', 'Flexor Digitorum Profundus'],
        supply: 'Median',
        meshes: ['2nd_lumbrical_of_handr'],
        nerveHint: 'Median_nerve_Common_palmar_digital_nerves'
    },
    'Lumbrical III': {
        bone:  ['Flexor Digitorum Profundus', 'Lumbrical II', 'Lumbrical IV', 'Dorsal Interosseous III'],
        nerve: ['Flexor Carpi Ulnaris', 'Lumbrical II', 'Lumbrical IV', 'Adductor Pollicis', 'Abductor Digiti Minimi', 'Flexor Digiti Minimi Brevis', 'Opponens Digiti Minimi', 'Palmaris Brevis', 'Flexor Digitorum Profundus', 'Dorsal Interosseous I', 'Dorsal Interosseous II', 'Dorsal Interosseous III', 'Dorsal Interosseous IV', 'Palmar Interosseous I', 'Palmar Interosseous II', 'Palmar Interosseous III'],
        supply: 'Ulnar (Deep)',
        meshes: ['3rd_lumbrical_of_handr'],
        nerveHint: 'Ulnar_nerve_Deep_br'
    },
    'Lumbrical IV': {
        bone:  ['Flexor Digitorum Profundus', 'Lumbrical III', 'Dorsal Interosseous IV', 'Abductor Digiti Minimi'],
        nerve: ['Flexor Carpi Ulnaris', 'Lumbrical II', 'Lumbrical III', 'Adductor Pollicis', 'Abductor Digiti Minimi', 'Flexor Digiti Minimi Brevis', 'Opponens Digiti Minimi', 'Palmaris Brevis', 'Flexor Digitorum Profundus', 'Dorsal Interosseous I', 'Dorsal Interosseous II', 'Dorsal Interosseous III', 'Dorsal Interosseous IV', 'Palmar Interosseous I', 'Palmar Interosseous II', 'Palmar Interosseous III'],
        supply: 'Ulnar (Deep)',
        meshes: ['4th_lumbrical_of_handr'],
        nerveHint: 'Ulnar_nerve_Deep_br'
    },

    // ── HAND — DORSAL INTEROSSEI ─────────────────────────────────────────────

    'Dorsal Interosseous I': {
        bone:  ['Adductor Pollicis', 'Lumbrical I', 'Dorsal Interosseous II', 'Palmar Interosseous I'],
        nerve: ['Flexor Carpi Ulnaris', 'Adductor Pollicis', 'Abductor Digiti Minimi', 'Flexor Digiti Minimi Brevis', 'Opponens Digiti Minimi', 'Palmaris Brevis', 'Lumbrical III', 'Lumbrical IV', 'Dorsal Interosseous II', 'Dorsal Interosseous III', 'Dorsal Interosseous IV', 'Palmar Interosseous I', 'Palmar Interosseous II', 'Palmar Interosseous III'],
        supply: 'Ulnar (Deep)',
        meshes: ['1st_dorsal_interosseus_of_handr'],
        nerveHint: 'Ulnar_nerve_Deep_br'
    },
    'Dorsal Interosseous II': {
        bone:  ['Dorsal Interosseous I', 'Lumbrical II', 'Dorsal Interosseous III', 'Palmar Interosseous I', 'Palmar Interosseous II'],
        nerve: ['Flexor Carpi Ulnaris', 'Adductor Pollicis', 'Abductor Digiti Minimi', 'Flexor Digiti Minimi Brevis', 'Opponens Digiti Minimi', 'Palmaris Brevis', 'Lumbrical III', 'Lumbrical IV', 'Dorsal Interosseous I', 'Dorsal Interosseous III', 'Dorsal Interosseous IV', 'Palmar Interosseous I', 'Palmar Interosseous II', 'Palmar Interosseous III'],
        supply: 'Ulnar (Deep)',
        meshes: ['2nd_dorsal_interosseus_of_handr'],
        nerveHint: 'Ulnar_nerve_Deep_br'
    },
    'Dorsal Interosseous III': {
        bone:  ['Dorsal Interosseous II', 'Lumbrical III', 'Dorsal Interosseous IV', 'Palmar Interosseous II', 'Palmar Interosseous III'],
        nerve: ['Flexor Carpi Ulnaris', 'Adductor Pollicis', 'Abductor Digiti Minimi', 'Flexor Digiti Minimi Brevis', 'Opponens Digiti Minimi', 'Palmaris Brevis', 'Lumbrical III', 'Lumbrical IV', 'Dorsal Interosseous I', 'Dorsal Interosseous II', 'Dorsal Interosseous IV', 'Palmar Interosseous I', 'Palmar Interosseous II', 'Palmar Interosseous III'],
        supply: 'Ulnar (Deep)',
        meshes: ['3rd_dorsal_interosseus_of_handr'],
        nerveHint: 'Ulnar_nerve_Deep_br'
    },
    'Dorsal Interosseous IV': {
        bone:  ['Dorsal Interosseous III', 'Lumbrical IV', 'Abductor Digiti Minimi', 'Palmar Interosseous III'],
        nerve: ['Flexor Carpi Ulnaris', 'Adductor Pollicis', 'Abductor Digiti Minimi', 'Flexor Digiti Minimi Brevis', 'Opponens Digiti Minimi', 'Palmaris Brevis', 'Lumbrical III', 'Lumbrical IV', 'Dorsal Interosseous I', 'Dorsal Interosseous II', 'Dorsal Interosseous III', 'Palmar Interosseous I', 'Palmar Interosseous II', 'Palmar Interosseous III'],
        supply: 'Ulnar (Deep)',
        meshes: ['4th_dorsal_interosseus_of_handr'],
        nerveHint: 'Ulnar_nerve_Deep_br'
    },

    // ── HAND — PALMAR INTEROSSEI ─────────────────────────────────────────────

    'Palmar Interosseous I': {
        bone:  ['Adductor Pollicis', 'Dorsal Interosseous I', 'Dorsal Interosseous II', 'Palmar Interosseous II'],
        nerve: ['Flexor Carpi Ulnaris', 'Adductor Pollicis', 'Abductor Digiti Minimi', 'Flexor Digiti Minimi Brevis', 'Opponens Digiti Minimi', 'Palmaris Brevis', 'Lumbrical III', 'Lumbrical IV', 'Dorsal Interosseous I', 'Dorsal Interosseous II', 'Dorsal Interosseous III', 'Dorsal Interosseous IV', 'Palmar Interosseous II', 'Palmar Interosseous III'],
        supply: 'Ulnar (Deep)',
        meshes: ['1st_palmar_interosseus_of_handr'],
        nerveHint: 'Ulnar_nerve_Deep_br'
    },
    'Palmar Interosseous II': {
        bone:  ['Palmar Interosseous I', 'Dorsal Interosseous II', 'Dorsal Interosseous III', 'Palmar Interosseous III'],
        nerve: ['Flexor Carpi Ulnaris', 'Adductor Pollicis', 'Abductor Digiti Minimi', 'Flexor Digiti Minimi Brevis', 'Opponens Digiti Minimi', 'Palmaris Brevis', 'Lumbrical III', 'Lumbrical IV', 'Dorsal Interosseous I', 'Dorsal Interosseous II', 'Dorsal Interosseous III', 'Dorsal Interosseous IV', 'Palmar Interosseous I', 'Palmar Interosseous III'],
        supply: 'Ulnar (Deep)',
        meshes: ['2nd_palmar_interosseus_of_handr'],
        nerveHint: 'Ulnar_nerve_Deep_br'
    },
    'Palmar Interosseous III': {
        bone:  ['Palmar Interosseous II', 'Dorsal Interosseous III', 'Dorsal Interosseous IV', 'Abductor Digiti Minimi'],
        nerve: ['Flexor Carpi Ulnaris', 'Adductor Pollicis', 'Abductor Digiti Minimi', 'Flexor Digiti Minimi Brevis', 'Opponens Digiti Minimi', 'Palmaris Brevis', 'Lumbrical III', 'Lumbrical IV', 'Dorsal Interosseous I', 'Dorsal Interosseous II', 'Dorsal Interosseous III', 'Dorsal Interosseous IV', 'Palmar Interosseous I', 'Palmar Interosseous II'],
        supply: 'Ulnar (Deep)',
        meshes: ['3rd_palmar_interosseus_of_handr'],
        nerveHint: 'Ulnar_nerve_Deep_br'
    },
};

// ── DERIVED GRAPHS ────────────────────────────────────────────────────────────
// Build flat adjacency graphs for pathfinding from the rich data above

const UPPER_LIMB_BONE_GRAPH = {};
const UPPER_LIMB_NERVE_GRAPH = {};

Object.keys(UPPER_LIMB_MUSCLES).forEach(function(muscle) {
    UPPER_LIMB_BONE_GRAPH[muscle]  = UPPER_LIMB_MUSCLES[muscle].bone;
    UPPER_LIMB_NERVE_GRAPH[muscle] = UPPER_LIMB_MUSCLES[muscle].nerve;
});

// ── NERVE HINT MESH GROUPS ────────────────────────────────────────────────────
// For lighting up all branches of a nerve when hint is requested
const NERVE_MESH_GROUPS = {
    'Musculocutaneous': ['Musculocutaneus_nerver','Musculocutaneus_nerve__-_lateral_antebrachial_cutaneous_nerver'],
    'Axillary':         ['Axillary_nerve_-_superior_lateral_br_cutaneous_nerver'],
    'Radial':           ['Radial_nerver','Radial_nerve_(deep_branch)r','Radial_nerve_(posterior_interosseus_n)r','Radial_nerve_(superficial_br)r','Radial_nerve_(posterior_antebrachial_cutaneous_n)r'],
    'Median':           ['Median_nerver','Lateral_root_of_median_nerver','Medial_root_of_median_nerver','Median_nerve_Recurrent_br','Median_nerve_Common_palmar_digital_nerves','Median_nerve_Palmar_br'],
    'Ulnar':            ['Ulnar_nerver','Ulnar_nerve_Deep_br','Ulnar_nerve_Superficial_br_Common_palmar_digital_n','Ulnar_nerve_Dorsal_cutaneous_br'],
    'Suprascapular':    ['Suprascapular_nerver'],
    'Long Thoracic':    ['Long_thoracic_nerver'],
    'Dorsal Scapular':  ['Dorsal_scapular_nerver'],
    'Subscapular':      ['Upper_subscapular_nerver','Lower_subscapular_nerver'],
    'Pectoral':         ['Lateral_pectoral_nerver','Medial_pectoral_nerver'],
    'Subclavian':       ['Subclavian_nerver'],
};
