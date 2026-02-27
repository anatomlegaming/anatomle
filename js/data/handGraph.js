// ============================================================================
// ANATOMLE — Hand Graph (29 bones)
// Includes radius, ulna, 8 carpals, 5 metacarpals, 14 phalanges
// ============================================================================

const HAND_GRAPH = {
    'Radius':             ['Ulna', 'Scaphoid', 'Lunate'],
    'Ulna':               ['Radius', 'Triquetrum', 'Pisiform'],
    'Scaphoid':           ['Radius', 'Lunate', 'Trapezium', 'Trapezoid', 'Capitate'],
    'Lunate':             ['Radius', 'Scaphoid', 'Triquetrum', 'Capitate', 'Hamate'],
    'Triquetrum':         ['Ulna', 'Lunate', 'Pisiform', 'Hamate'],
    'Pisiform':           ['Ulna', 'Triquetrum'],
    'Trapezium':          ['Scaphoid', 'Trapezoid', 'Metacarpal I'],
    'Trapezoid':          ['Scaphoid', 'Trapezium', 'Capitate', 'Metacarpal II'],
    'Capitate':           ['Scaphoid', 'Lunate', 'Trapezoid', 'Hamate', 'Metacarpal II', 'Metacarpal III'],
    'Hamate':             ['Lunate', 'Triquetrum', 'Capitate', 'Metacarpal IV', 'Metacarpal V'],
    'Metacarpal I':       ['Trapezium', 'Proximal Phalanx I'],
    'Metacarpal II':      ['Trapezoid', 'Capitate', 'Proximal Phalanx II'],
    'Metacarpal III':     ['Capitate', 'Proximal Phalanx III'],
    'Metacarpal IV':      ['Hamate', 'Proximal Phalanx IV'],
    'Metacarpal V':       ['Hamate', 'Proximal Phalanx V'],
    'Proximal Phalanx I': ['Metacarpal I', 'Distal Phalanx I'],
    'Distal Phalanx I':   ['Proximal Phalanx I'],
    'Proximal Phalanx II':['Metacarpal II', 'Middle Phalanx II'],
    'Middle Phalanx II':  ['Proximal Phalanx II', 'Distal Phalanx II'],
    'Distal Phalanx II':  ['Middle Phalanx II'],
    'Proximal Phalanx III':['Metacarpal III', 'Middle Phalanx III'],
    'Middle Phalanx III': ['Proximal Phalanx III', 'Distal Phalanx III'],
    'Distal Phalanx III': ['Middle Phalanx III'],
    'Proximal Phalanx IV':['Metacarpal IV', 'Middle Phalanx IV'],
    'Middle Phalanx IV':  ['Proximal Phalanx IV', 'Distal Phalanx IV'],
    'Distal Phalanx IV':  ['Middle Phalanx IV'],
    'Proximal Phalanx V': ['Metacarpal V', 'Middle Phalanx V'],
    'Middle Phalanx V':   ['Proximal Phalanx V', 'Distal Phalanx V'],
    'Distal Phalanx V':   ['Middle Phalanx V'],
};
