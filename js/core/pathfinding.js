// ====================================
// ANATOMLE - Core Pathfinding Logic
// ====================================
// Reusable pathfinding algorithms for any bone graph

/**
 * Find shortest path between two bones using BFS
 * @param {string} start - Starting bone name
 * @param {string} end - Target bone name
 * @param {Object} graph - Bone connection graph
 * @returns {Array|null} - Array of bone names forming shortest path, or null if no path
 */
function findShortestPath(start, end, graph) {
    const queue = [[start]];
    const visited = new Set([start]);
    
    while (queue.length > 0) {
        const path = queue.shift();
        const current = path[path.length - 1];
        
        if (current === end) return path;
        
        for (const neighbor of (graph[current] || [])) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push([...path, neighbor]);
            }
        }
    }
    
    return null;
}

/**
 * Check if a bone is on ANY valid path from start to target
 * @param {string} bone - Bone to check
 * @param {string} start - Starting bone
 * @param {string} target - Target bone
 * @param {Object} graph - Bone connection graph
 * @returns {boolean} - True if bone is on a valid path
 */
function isOnValidPath(bone, start, target, graph) {
    // Can we reach the bone from start?
    const pathToGuess = findShortestPath(start, bone, graph);
    if (!pathToGuess) return false;
    
    // Can we reach target from the bone?
    const pathFromGuess = findShortestPath(bone, target, graph);
    if (!pathFromGuess) return false;
    
    return true; // Valid path exists through this bone
}

/**
 * Check if we can reach target from start using only guessed bones
 * @param {string} start - Starting bone
 * @param {string} target - Target bone
 * @param {Array} guessedBones - Bones guessed on optimal path
 * @param {Array} detourBones - Bones guessed as detours
 * @param {Object} graph - Bone connection graph
 * @returns {boolean} - True if target is reachable
 */
function canReachTargetWithGuessed(start, target, guessedBones, detourBones, graph) {
    const allGuessed = new Set([...guessedBones, ...detourBones, start]);
    
    // BFS using only guessed bones
    const queue = [start];
    const visited = new Set([start]);
    
    while (queue.length > 0) {
        const current = queue.shift();
        
        // Check if we've reached the target
        if (current === target) {
            return true;
        }
        
        // Explore neighbors that have been guessed
        for (const neighbor of (graph[current] || [])) {
            if (!visited.has(neighbor) && allGuessed.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }
    
    return false; // Can't reach a neighbor of target with guessed bones
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { findShortestPath, isOnValidPath, canReachTargetWithGuessed };
}
