// ============================================================================
// ANATOMLE - Upper Limb Muscle Engine
// ============================================================================
// Requires: THREE.js, GLTFLoader, DRACOLoader, OrbitControls
// Requires: UPPER_LIMB_MUSCLES from upperLimbGraph.js
// ============================================================================

var _model = null;

// ── MATERIAL HELPERS ─────────────────────────────────────────────────────────
function mat(color, emissive, opacity, transparent) {
    return new THREE.MeshStandardMaterial({
        color: color,
        emissive: emissive !== undefined ? emissive : color,
        emissiveIntensity: emissive !== undefined ? 0.55 : 0,
        transparent: transparent !== undefined ? transparent : false,
        opacity: opacity !== undefined ? opacity : 1,
        depthWrite: opacity === undefined || opacity >= 1
    });
}

var REST_MAT  = function(){ return mat(0xc4855a, 0, 1, false); }; // warm muscle tone, no emissive
var GHOST_MAT = function(){ return new THREE.MeshStandardMaterial({ color:0xc4855a, transparent:true, opacity:0.12, depthWrite:false }); };

// ── MESH LOOKUP ──────────────────────────────────────────────────────────────
// Build a flat map of meshName → THREE.Mesh on model load
var _meshMap = {};

function buildMeshMap() {
    _meshMap = {};
    if (!_model) return;
    _model.traverse(function(node) {
        if (node.isMesh) _meshMap[node.name] = node;
    });
}

function getMeshesForMuscle(muscleName) {
    var data = UPPER_LIMB_MUSCLES[muscleName];
    if (!data || !data.meshes) return [];
    return data.meshes.map(function(n){ return _meshMap[n]; }).filter(Boolean);
}

function getNerveMeshes(nerveHintNode) {
    // nerveHintNode can be a single string or we look up the full group
    if (!nerveHintNode) return [];
    // Check NERVE_MESH_GROUPS first by matching supply string
    var result = [];
    if (_meshMap[nerveHintNode]) result.push(_meshMap[nerveHintNode]);
    return result;
}

function getNerveMeshesForSupply(supply) {
    // supply is like "Median", "Ulnar (Deep)", "Radial (PIN)" etc.
    // Match against NERVE_MESH_GROUPS keys
    var result = [];
    Object.keys(NERVE_MESH_GROUPS).forEach(function(key) {
        if (supply && supply.indexOf(key) !== -1) {
            NERVE_MESH_GROUPS[key].forEach(function(meshName) {
                if (_meshMap[meshName]) result.push(_meshMap[meshName]);
            });
        }
    });
    return result;
}

// ── PUBLIC API ───────────────────────────────────────────────────────────────

window.reset3D = function() {
    if (!_model) return;
    _model.traverse(function(n) {
        if (n.isMesh) n.material = GHOST_MAT();
    });
};

window.update3D = function(bones) {
    // bones = [{name, type}] where type: 'start'|'end'|'path'|'detour'|'bad'|'reveal'
    if (!_model) return;

    // Build set of all highlighted mesh names
    var highlighted = {}; // meshName → type

    bones.forEach(function(b) {
        var meshes = getMeshesForMuscle(b.name);
        meshes.forEach(function(mesh) {
            // Higher priority types win
            var current = highlighted[mesh.name];
            var priority = {start:5, end:5, path:4, detour:3, reveal:2, bad:1};
            if (!current || (priority[b.type] || 0) > (priority[current] || 0)) {
                highlighted[mesh.name] = b.type;
            }
        });
    });

    _model.traverse(function(node) {
        if (!node.isMesh) return;
        var type = highlighted[node.name];
        if (type) {
            var col = 0x5a8a6a, em = 0x5a8a6a, ei = 0.55;
            if (type === 'start')  { col = 0x5a8a6a; em = 0x5a8a6a; ei = 0.6; }
            if (type === 'end')    { col = 0xe8603c; em = 0xe8603c; ei = 0.6; }
            if (type === 'path')   { col = 0x5a8a6a; em = 0x5a8a6a; ei = 0.5; }
            if (type === 'detour') { col = 0xf0a500; em = 0xf0a500; ei = 0.6; }
            if (type === 'bad')    { col = 0xc94d2b; em = 0xc94d2b; ei = 0.75; }
            if (type === 'reveal') { col = 0x8b5cf6; em = 0x8b5cf6; ei = 0.7; }
            node.material = new THREE.MeshStandardMaterial({ color:col, emissive:em, emissiveIntensity:ei, transparent:false, opacity:1 });
        } else {
            node.material = GHOST_MAT();
        }
    });
};

window.showNerveHint = function(muscleName) {
    // Light up the nerve meshes for the target muscle
    if (!_model) return;
    var data = UPPER_LIMB_MUSCLES[muscleName];
    if (!data) return;

    // Collect nerve meshes via nerveHint node + full supply group
    var nerveMeshes = new Set();

    if (data.nerveHint && _meshMap[data.nerveHint]) {
        nerveMeshes.add(data.nerveHint);
    }
    // Also add all meshes from the supply group
    getNerveMeshesForSupply(data.supply).forEach(function(m){ nerveMeshes.add(m.name); });

    _model.traverse(function(node) {
        if (!node.isMesh) return;
        if (nerveMeshes.has(node.name)) {
            node.material = new THREE.MeshStandardMaterial({
                color: 0xf0c040, emissive: 0xf0c040, emissiveIntensity: 0.8,
                transparent: false, opacity: 1
            });
        }
    });
};

window.clearNerveHint = function() {
    // Called after a few seconds to fade nerve highlight back
    // Just re-run update3D with current state — caller handles this
};

// ── SCENE SETUP ──────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', function() {
    var cont = document.getElementById('cv');
    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(45, cont.clientWidth / cont.clientHeight, 0.1, 100);
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(cont.clientWidth, cont.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    cont.appendChild(renderer.domElement);

    var ctrl = new THREE.OrbitControls(cam, renderer.domElement);
    ctrl.enableDamping = true;
    ctrl.dampingFactor = 0.05;
    ctrl.maxPolarAngle = Math.PI;
    ctrl.minDistance = 0.5;
    ctrl.maxDistance = 15;
    ctrl.enableZoom = false;

    // Scroll-to-zoom
    renderer.domElement.addEventListener('wheel', function(e) {
        e.preventDefault();
        var dir = new THREE.Vector3().subVectors(cam.position, ctrl.target).normalize();
        var dist = cam.position.distanceTo(ctrl.target);
        var step = dist * 0.1;
        if (e.deltaY < 0 && dist > ctrl.minDistance) cam.position.addScaledVector(dir, -step);
        else if (e.deltaY > 0 && dist < ctrl.maxDistance) cam.position.addScaledVector(dir, step);
        ctrl.update();
    }, { passive: false });

    // Warm lighting
    scene.add(new THREE.AmbientLight(0xfff8f0, 0.9));
    var dl = new THREE.DirectionalLight(0xfff4e8, 0.8);
    dl.position.set(5, 10, 7.5);
    scene.add(dl);
    var dl2 = new THREE.DirectionalLight(0xffe8d8, 0.4);
    dl2.position.set(-5, 3, -5);
    scene.add(dl2);

    // Load model
    var draco = new THREE.DRACOLoader();
    draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    var loader = new THREE.GLTFLoader();
    loader.setDRACOLoader(draco);

    loader.load('../models/upper-limb.glb', function(gltf) {
        _model = gltf.scene;
        scene.add(_model);

        buildMeshMap();

        // Hide non-muscle groups by default — show only muscles
        _model.traverse(function(node) {
            if (node.isObject3D && !node.isMesh) {
                var name = node.name || '';
                // Hide bones, nerves, veins, arteries, cartilages, ligaments groups
                if (name.indexOf('bone') !== -1 || name.indexOf('nerve') !== -1 ||
                    name.indexOf('vein') !== -1 || name.indexOf('arteri') !== -1 ||
                    name.indexOf('cartilage') !== -1 || name.indexOf('ligament') !== -1 ||
                    name.indexOf('capsule') !== -1 || name.indexOf('synovia') !== -1 ||
                    name.indexOf('bursae') !== -1) {
                    node.visible = false;
                }
            }
        });

        // Ghost all muscles initially
        window.reset3D();

        // Frame model
        var box = new THREE.Box3().setFromObject(_model);
        var center = box.getCenter(new THREE.Vector3());
        var size = box.getSize(new THREE.Vector3());
        ctrl.target.copy(center);
        var fov = cam.fov * (Math.PI / 180);
        var maxDim = Math.max(size.x, size.y, size.z);
        cam.position.set(center.x, center.y, center.z + Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.3);
        cam.lookAt(center);
        ctrl.update();
    }, undefined, function(err) {
        console.error('Failed to load upper-limb.glb:', err);
    });

    function animate() {
        requestAnimationFrame(animate);
        ctrl.update();
        renderer.render(scene, cam);
    }
    animate();

    var ro = new ResizeObserver(function() {
        cam.aspect = cont.clientWidth / cont.clientHeight;
        cam.updateProjectionMatrix();
        renderer.setSize(cont.clientWidth, cont.clientHeight);
    });
    ro.observe(cont);
});
