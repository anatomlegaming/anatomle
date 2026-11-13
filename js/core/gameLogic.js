// ====================================
// ANATOMLE - Game Logic
// ====================================
// Puzzle generation. Guess grading and win/score rules live in pathGame.js.

/**
 * Pick a random start and end whose shortest path has the wanted length
 * @param {Object} graph - Bone connection graph
 * @param {Object} options - {minLength: 4, maxLength: 8} (path length in bones)
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

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initializeGame };
}
