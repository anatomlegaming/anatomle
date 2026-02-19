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
    if (optimalPath.includes(guess)) {
        return { type: 'optimal', isValid: true };
    }

    // Find the minimum BFS distance from this guess to any node on the optimal path.
    // We search outward from the guess and stop at the first optimal-path node we reach.
    const optimalSet = new Set(optimalPath);
    const visited = new Set([guess]);
    const queue = [[guess, 0]];

    while (queue.length > 0) {
        const [current, dist] = queue.shift();

        // If we've reached a node on the optimal path, classify by distance
        if (optimalSet.has(current) && current !== guess) {
            if (dist <= 2) {
                return { type: 'detour', isValid: true };
            } else {
                return { type: 'failure', isValid: false };
            }
        }

        // Don't explore too far — anything beyond 3 hops can't be a detour
        if (dist >= 3) continue;

        for (const neighbor of (graph[current] || [])) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push([neighbor, dist + 1]);
            }
        }
    }

    // Never reached the optimal path at all
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
