// ====================================
// ANATOMLE - 3D Model Loader
// ====================================
// Handles Three.js scene setup and GLB model loading

let scene, camera, renderer, controls, skeletonModel;

/**
 * Initialize Three.js scene
 * @param {string} containerId - DOM element ID for canvas
 * @returns {Object} - {scene, camera, renderer, controls}
 */
function initScene(containerId) {
    const container = document.getElementById(containerId);
    
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x334155);
    
    // Camera
    camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    
    // Orbit Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 10;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
    
    return { scene, camera, renderer, controls };
}

/**
 * Load 3D skeleton model
 * @param {string} modelPath - Path to GLB file
 * @param {Function} onLoadCallback - Called when model loads successfully
 * @param {Function} onErrorCallback - Called if loading fails
 */
function loadSkeletonModel(modelPath, onLoadCallback, onErrorCallback) {
    const loader = new THREE.GLTFLoader();
    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);
    
    loader.load(
        modelPath,
        (gltf) => {
            skeletonModel = gltf.scene;
            scene.add(skeletonModel);
            
            // Center camera on model
            const box = new THREE.Box3().setFromObject(skeletonModel);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            controls.target.copy(center);
            camera.position.set(
                center.x + size.x * 1.5,
                center.y + size.y * 0.8,
                center.z + size.z * 2
            );
            controls.update();
            
            if (onLoadCallback) onLoadCallback(skeletonModel);
        },
        undefined,
        (error) => {
            console.error('Error loading model:', error);
            if (onErrorCallback) onErrorCallback(error);
        }
    );
}

/**
 * Get the loaded skeleton model
 * @returns {THREE.Object3D|null}
 */
function getSkeletonModel() {
    return skeletonModel;
}

/**
 * Reset camera and model to initial state
 */
function resetView() {
    if (skeletonModel) {
        const box = new THREE.Box3().setFromObject(skeletonModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        controls.target.copy(center);
        camera.position.set(
            center.x + size.x * 1.5,
            center.y + size.y * 0.8,
            center.z + size.z * 2
        );
        controls.update();
    }
}
