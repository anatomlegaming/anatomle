// ====================================
// ANATOMLE - Game Logic
// ====================================
// Reusable game mechanics for any bone graph

/**
 * Validate a guess and determine its category
 * @param {string} guess - The guessed bone
 * @param {Array} optimalPath - The shortest path array
 * @param {string} start - Starting bone
 * @param {string} target - Target bone
 * @param {Object} graph - Bone connection graph
 * @returns {Object} - {type: 'optimal'|'detour'|'failure', isValid: boolean}
 */
function validateGuess(guess, optimalPath, start, target, graph) {
    // Check if guess is on the optimal (shortest) path
    const isOnOptimalPath = optimalPath.includes(guess);
    
    if (isOnOptimalPath) {
        return { type: 'optimal', isValid: true };
    }
    
    // Not on optimal path - check if it's on ANY valid path
    const isValidDetour = isOnValidPath(guess, start, target, graph);
    
    if (isValidDetour) {
        return { type: 'detour', isValid: true };
    }
    
    // Not on any valid path
    return { type: 'failure', isValid: false };
}

/**
 * Initialize a new game
 * @param {Object} graph - Bone connection graph
 * @param {Object} options - {minLength: 4, maxLength: 8}
 * @returns {Object} - {start, end, path}
 */
function initializeGame(graph, options = {}) {
    const { minLength = 4, maxLength = 8 } = options;
    const bones = Object.keys(graph);
    
    let start, end, path;
    do {
        start = bones[Math.floor(Math.random() * bones.length)];
        end = bones[Math.floor(Math.random() * bones.length)];
        path = findShortestPath(start, end, graph);
    } while (!path || path.length < minLength || path.length > maxLength || start === end);
    
    return { start, end, path };
}

/**
 * Calculate guess count based on path length
 * @param {number} pathLength - Length of optimal path
 * @param {number} bonusGuesses - Extra guesses (default: 3)
 * @returns {number} - Total guesses allowed
 */
function calculateGuessCount(pathLength, bonusGuesses = 3) {
    // Path length - 1 (start is free) + bonus guesses
    return (pathLength - 1) + bonusGuesses;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { validateGuess, initializeGame, calculateGuessCount };
}
