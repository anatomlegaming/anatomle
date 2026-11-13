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

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { findShortestPath };
}
