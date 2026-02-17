// ====================================
// ANATOMLE - Bone Highlighter
// ====================================
// Updates bone colors in 3D model based on game state

/**
 * Update 3D model bone colors
 * @param {Array} bones - Array of {name: string, type: string} objects
 * @param {Object} mappings - BONE_TO_3D_MODEL mappings object
 * 
 * Types: 'start', 'path', 'end', 'bad', 'detour', 'reveal'
 */
function updateBoneColors(bones, mappings) {
    const skeleton = getSkeletonModel();
    if (!skeleton) return;
    
    skeleton.traverse(node => {
        if (node.isMesh) {
            const match = bones.find(b => matchesBone(node, b.name, mappings));
            
            if (match) {
                const { color, emissiveIntensity } = getBoneStyle(match.type);
                node.material = new THREE.MeshStandardMaterial({
                    color: color,
                    emissive: color,
                    emissiveIntensity: emissiveIntensity,
                    transparent: false,
                    opacity: 1
                });
            } else {
                // Reset to default gray
                node.material = new THREE.MeshStandardMaterial({
                    color: 0x8b8b8b,
                    transparent: false,
                    opacity: 1
                });
            }
        }
    });
}

/**
 * Check if a 3D node matches a game bone name
 * @param {THREE.Mesh} node - 3D mesh node
 * @param {string} boneName - Game bone name
 * @param {Object} mappings - BONE_TO_3D_MODEL mappings
 * @returns {boolean}
 */
function matchesBone(node, boneName, mappings) {
    const key = mappings[boneName];
    if (!key) return false;
    
    // Special case: Hip bones all light up together (fused in 3D model)
    if (boneName === "Ilium" || boneName === "Ischium" || boneName === "Pubis") {
        const hipParts = ["Ilium", "Ischium", "Pubis"];
        return hipParts.some(part => node.name.includes(part));
    }
    
    // Default: standard includes check
    return node.name.includes(key);
}

/**
 * Get color and style for a bone type
 * @param {string} type - Bone type (start, path, end, bad, detour, reveal)
 * @returns {Object} - {color: number, emissiveIntensity: number}
 */
function getBoneStyle(type) {
    const styles = {
        'start': { color: 0x10b981, emissiveIntensity: 0.5 },    // Green
        'path': { color: 0x3b82f6, emissiveIntensity: 0.5 },     // Blue
        'end': { color: 0xf59e0b, emissiveIntensity: 0.5 },      // Amber
        'detour': { color: 0xf97316, emissiveIntensity: 0.6 },   // Orange
        'bad': { color: 0xef4444, emissiveIntensity: 0.8 },      // Red
        'reveal': { color: 0xd946ef, emissiveIntensity: 0.8 }    // Magenta
    };
    
    return styles[type] || { color: 0x3b82f6, emissiveIntensity: 0.5 };
}

/**
 * Reset all bones to default gray color
 */
function resetBoneColors() {
    const skeleton = getSkeletonModel();
    if (!skeleton) return;
    
    skeleton.traverse(node => {
        if (node.isMesh) {
            node.material = new THREE.MeshStandardMaterial({
                color: 0x8b8b8b,
                transparent: false,
                opacity: 1
            });
        }
    });
}

/**
 * Highlight a single bone (useful for hover effects)
 * @param {string} boneName - Game bone name
 * @param {number} color - Hex color
 * @param {Object} mappings - BONE_TO_3D_MODEL mappings
 */
function highlightBone(boneName, color, mappings) {
    const skeleton = getSkeletonModel();
    if (!skeleton) return;
    
    skeleton.traverse(node => {
        if (node.isMesh && matchesBone(node, boneName, mappings)) {
            node.material = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 0.7,
                transparent: false,
                opacity: 1
            });
        }
    });
}
