// ============================================================================
// ANATOMLE - Upper Limb Muscle Engine
// ============================================================================
// Requires: THREE.js, GLTFLoader, DRACOLoader, OrbitControls
// Requires: UPPER_LIMB_MUSCLES from upperLimbGraph.js
// ============================================================================

var _model = null;
if (window.HL) HL.ghostScale = 0.7; // muscles overlap a lot, keep the unguessed ones lighter

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

// Meshes that belong to hidden systems (bones, nerves, vessels…). They stay
// invisible except while a nerve hint is lighting one of them up.
var _hiddenMeshes = [];

function hideNonMuscle() {
    _hiddenMeshes.forEach(function(m) { m.visible = false; });
    HL.invalidate();
}

window.reset3D = function() {
    if (!_model) return;
    hideNonMuscle();
    _model.traverse(function(n) {
        if (n.isMesh) HL.apply(n, null, { instant: true, force: true });
    });
};

var PRIORITY = { start: 5, end: 5, path: 4, detour: 3, reveal: 2, bad: 1 };

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
            if (!current || (PRIORITY[b.type] || 0) > (PRIORITY[current] || 0)) {
                highlighted[mesh.name] = b.type;
            }
        });
    });

    hideNonMuscle();
    _model.traverse(function(node) {
        if (!node.isMesh) return;
        if (node._hidden) return;
        HL.apply(node, highlighted[node.name] || null);
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

    if (!_nerveMat) _nerveMat = new THREE.MeshStandardMaterial({ color: 0x8FD0FF, emissive: 0x8FD0FF, emissiveIntensity: 0.8 });
    nerveMeshes.forEach(function(name) {
        var node = _meshMap[name];
        if (!node) return;
        node.visible = true;
        node.material = _nerveMat;
    });
    HL.invalidate();
};
var _nerveMat = null;

// Hide the nerves again once the hint is over
window.clearNerveHint = hideNonMuscle;

// Repaint with the other theme's colours
window.addEventListener('anatomle-theme', function () {
    if (!_model) return;
    _model.traverse(function(n) {
        if (!n.isMesh || !n._hlType || n._hidden) return;
        HL.apply(n, n._hlType === 'ghost' ? null : n._hlType, { force: true, instant: true });
    });
});

// ── SCENE SETUP ──────────────────────────────────────────────────────────────
function _initUpperLimbEngine() {
    var cont = document.getElementById('cv');
    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(45, cont.clientWidth / cont.clientHeight, 0.1, 100);
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(cont.clientWidth, cont.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    HL.enable(renderer);
    cont.appendChild(renderer.domElement);

    var ctrl = new THREE.OrbitControls(cam, renderer.domElement);
    var camFx = HL.camera({ cam: cam, ctrl: ctrl, dom: renderer.domElement, pickables: function () {
        var out = [];
        if (_model) _model.traverse(function(n) { if (n.isMesh && n.visible) out.push(n); });
        return out;
    } });

    // Warm lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    var dl = new THREE.DirectionalLight(0xffffff, 0.8);
    dl.position.set(5, 10, 7.5);
    scene.add(dl);
    var dl2 = new THREE.DirectionalLight(0xeef2ff, 0.4);
    dl2.position.set(-5, 3, -5);
    scene.add(dl2);

    // Load model
    var draco = new THREE.DRACOLoader();
    draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    var loader = new THREE.GLTFLoader();
    loader.setDRACOLoader(draco);

    var note = HL.loadNote(cont);
    loader.load('../models/upper-limb.glb', function(gltf) {
        note.done();
        _model = gltf.scene;
        scene.add(_model);

        buildMeshMap();

        // Hide non-muscle systems by default — show only muscles. We hide the
        // meshes themselves rather than their parent groups, so a nerve hint
        // can still make an individual nerve visible.
        _hiddenMeshes = [];
        _model.traverse(function(node) {
            if (node.isObject3D && !node.isMesh) {
                var name = node.name || '';
                // Bones, nerves, veins, arteries, cartilages, ligaments groups
                if (name.indexOf('bone') !== -1 || name.indexOf('nerve') !== -1 ||
                    name.indexOf('vein') !== -1 || name.indexOf('arteri') !== -1 ||
                    name.indexOf('cartilage') !== -1 || name.indexOf('ligament') !== -1 ||
                    name.indexOf('capsule') !== -1 || name.indexOf('synovia') !== -1 ||
                    name.indexOf('bursae') !== -1) {
                    node.traverse(function(child) {
                        if (child.isMesh && !child._hidden) { child._hidden = true; _hiddenMeshes.push(child); }
                    });
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
        camFx.setRange(maxDim, box);
        cam.position.set(center.x, center.y, center.z + Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.3);
        cam.lookAt(center);
        ctrl.update();
        var homePos = cam.position.clone(), homeTarget = center.clone();
        window.resetCamera = function() { camFx.fly(homePos, homeTarget, 700); };

        window.__modelIsReady = true;
        window.dispatchEvent(new Event('modelReady'));
    }, note.progress, function(err) {
        console.error('Failed to load upper-limb.glb:', err);
        note.fail();
    });

    // Only draw when something changed (see skeletonEngine.js)
    ctrl.addEventListener('change', HL.invalidate);
    function animate() {
        requestAnimationFrame(animate);
        camFx.step();
        ctrl.update();
        if (HL.tick()) renderer.render(scene, cam);
    }
    animate();

    var ro = new ResizeObserver(function() {
        cam.aspect = cont.clientWidth / cont.clientHeight;
        cam.updateProjectionMatrix();
        renderer.setSize(cont.clientWidth, cont.clientHeight);
        HL.invalidate();
    });
    ro.observe(cont);
}

// Run now if the page has already loaded (e.g. replay.html injects this
// script after DOMContentLoaded), otherwise wait for the DOM.
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', _initUpperLimbEngine);
} else {
    _initUpperLimbEngine();
}
