// ============================================================================
// FULL SKELETON 3D ENGINE (Pathfinding Mode)
// ============================================================================
// Requires: THREE.js, OrbitControls, GLTFLoader, DRACOLoader
// Requires: BONE_TO_3D_MODEL from boneMappings.js
// Requires: boneTooltip.js (window.boneTooltip)
// ============================================================================

var _skeleton  = null;
var _ctrl = null;
var _initCenter = null;
var _initDist = 1;
var _cam       = null;
var _renderer  = null;
var _raycaster = new THREE.Raycaster();
var _rafPending= false;
var _lastHover = null;
var _camFx    = null;

// ── RIB / SPECIAL NODE LISTS ─────────────────────────────────────────────────
var TRUE_RIB_NODES     = ['Rib_(1st)r','Rib_(2nd)r','Rib_(3rd)r','Rib_(4th)r','Rib_(5th)r','Rib_(6th)r','Rib_(7th)r'];
var FALSE_RIB_NODES    = ['Rib_(8th)r','Rib_(9th)r','Rib_(10th)r'];
var FLOATING_RIB_NODES = ['Rib_(11th)r','Rib_(12th)r'];
var COSTAL_TRUE_NODES  = ['Costal_cart_of_1st_rib','Costal_cart_of_2nd_rib','Costal_cart_of_3rd_rib',
                          'Costal_cart_of_4th_rib','Costal_cart_of_5th_rib','Costal_cart_of_6th_rib','Costal_cart_of_7th_rib'];
var COSTAL_FALSE_NODES = ['Costal_cart_of_8th_rib','Costal_cart_of_9th_rib','Costal_cart_of_10th_rib'];

// ── REVERSE LOOKUP: mesh name → display bone name ────────────────────────────
var _meshToDisplay = null;

function buildReverseMap() {
    _meshToDisplay = {};
    if (typeof BONE_TO_3D_MODEL === 'undefined') return;
    Object.keys(BONE_TO_3D_MODEL).forEach(function(display) {
        var val = BONE_TO_3D_MODEL[display];
        if (!val) return;
        if (val.indexOf('__group__') === 0) {
            val.slice(9).split('|').forEach(function(frag) { _meshToDisplay[frag] = display; });
        } else if (val.indexOf('__') !== 0) {
            _meshToDisplay[val] = display;
        }
    });
}

function meshNameToDisplay(meshName) {
    if (!_meshToDisplay) return null;
    var keys = Object.keys(_meshToDisplay);
    for (var i = 0; i < keys.length; i++) {
        if (meshName.indexOf(keys[i]) !== -1) return _meshToDisplay[keys[i]];
    }
    for (var r = 0; r < TRUE_RIB_NODES.length; r++)     if (meshName.indexOf(TRUE_RIB_NODES[r])     !== -1) return 'True Ribs (1-7)';
    for (var f = 0; f < FALSE_RIB_NODES.length; f++)    if (meshName.indexOf(FALSE_RIB_NODES[f])    !== -1) return 'False Ribs (8-10)';
    for (var l = 0; l < FLOATING_RIB_NODES.length; l++) if (meshName.indexOf(FLOATING_RIB_NODES[l]) !== -1) return 'Floating Ribs (11-12)';
    for (var c = 0; c < COSTAL_TRUE_NODES.length; c++)  if (meshName.indexOf(COSTAL_TRUE_NODES[c])  !== -1) return 'Costal Cartilage (1-7)';
    for (var d = 0; d < COSTAL_FALSE_NODES.length; d++) if (meshName.indexOf(COSTAL_FALSE_NODES[d]) !== -1) return 'Costal Cartilage (8-10)';
    if (meshName.indexOf('Hip_boner') !== -1) return 'Hip Bone';
    return null;
}

// ── RAYCASTING ────────────────────────────────────────────────────────────────
// Only lit-up bones show a tooltip, so only those are tested. This is much
// cheaper than testing the whole skeleton, and a grey bone in front of a lit
// one no longer blocks it.
function litMeshes() {
    var out = [];
    _skeleton.traverse(function(n) { if (n.isMesh && n._hlType && n._hlType !== 'ghost') out.push(n); });
    return out;
}

var _allMeshes = null;
function allMeshes() {
    if (!_allMeshes) { _allMeshes = []; _skeleton.traverse(function(n) { if (n.isMesh) _allMeshes.push(n); }); }
    return _allMeshes;
}

function raycastAt(clientX, clientY) {
    if (!_skeleton || !_cam || !_renderer) return null;
    var rect  = _renderer.domElement.getBoundingClientRect();
    var mouse = new THREE.Vector2(
        ((clientX - rect.left) / rect.width)  * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
    );
    _raycaster.setFromCamera(mouse, _cam);
    var hits = _raycaster.intersectObjects(litMeshes(), false);
    if (!hits.length) return null;
    var obj = hits[0].object;
    while (obj && !obj.isMesh) obj = obj.parent;
    return obj || null;
}

function handleHover(clientX, clientY) {
    var mesh = raycastAt(clientX, clientY);
    if (!mesh || !mesh.material || mesh.material.transparent) {
        _lastHover = null;
        if (window.boneTooltip) window.boneTooltip.hide();
        return;
    }
    var display = meshNameToDisplay(mesh.name);
    if (!display) {
        _lastHover = null;
        if (window.boneTooltip) window.boneTooltip.hide();
        return;
    }
    _lastHover = display;
    if (window.boneTooltip) window.boneTooltip.show(display, clientX, clientY);
}

function handleClick(clientX, clientY) {
    var mesh = raycastAt(clientX, clientY);
    if (!mesh || !mesh.material || mesh.material.transparent) return;
    var display = meshNameToDisplay(mesh.name);
    if (!display) return;
    if (window.boneTooltip) { window.boneTooltip.hide(); window.boneTooltip.openCard(display); }
}

// ── GAME STATE COLOURING ──────────────────────────────────────────────────────
window.reset3D = function() {
    if (!_skeleton) return;
    _skeleton.traverse(function(n) {
        if (!n.isMesh) return;
        HL.apply(n, null, { instant: true });
    });
};

function _matchBone(node, bones) {
    for (var i = 0; i < bones.length; i++) {
        var b = bones[i];
        if (b.name === 'True Ribs (1-7)')        { for(var t=0;t<TRUE_RIB_NODES.length;t++)     if(node.name.indexOf(TRUE_RIB_NODES[t])    !=-1) return b; continue; }
        if (b.name === 'False Ribs (8-10)')       { for(var f=0;f<FALSE_RIB_NODES.length;f++)    if(node.name.indexOf(FALSE_RIB_NODES[f])   !=-1) return b; continue; }
        if (b.name === 'Floating Ribs (11-12)')   { for(var l=0;l<FLOATING_RIB_NODES.length;l++) if(node.name.indexOf(FLOATING_RIB_NODES[l])!=-1) return b; continue; }
        if (b.name === 'Costal Cartilage (1-7)')  { for(var c=0;c<COSTAL_TRUE_NODES.length;c++)  if(node.name.indexOf(COSTAL_TRUE_NODES[c]) !=-1) return b; continue; }
        if (b.name === 'Costal Cartilage (8-10)') { for(var d=0;d<COSTAL_FALSE_NODES.length;d++) if(node.name.indexOf(COSTAL_FALSE_NODES[d])!=-1) return b; continue; }
        if (b.name === 'Hip Bone') { if(node.name.indexOf('Hip_boner')!=-1) return b; continue; }
        var key = BONE_TO_3D_MODEL[b.name];
        if (!key) continue;
        if (key.indexOf('__group__') === 0) {
            var parts = key.slice(9).split('|');
            for (var p = 0; p < parts.length; p++) { if(node.name.indexOf(parts[p])!=-1) return b; }
        } else if (node.name.indexOf(key) !== -1) return b;
    }
    return null;
}

// Colours every mesh for the game state. Newly guessed bones are drawn in
// with a highlighter fill (see js/3d/hlFx.js); wrong ones also shake.
window.update3D = function(bones) {
    if (!_skeleton) return;
    _skeleton.traverse(function(node) {
        if (!node.isMesh) return;
        var matched = _matchBone(node, bones);
        HL.apply(node, matched ? matched.type : null);
    });
};

// Repaint with the other theme's colours
window.addEventListener('anatomle-theme', function () {
    if (!_skeleton) return;
    _skeleton.traverse(function(n) {
        if (!n.isMesh || !n._hlType) return;
        HL.apply(n, n._hlType === 'ghost' ? null : n._hlType, { force: true, instant: true });
    });
});

// ── HIGHLIGHT SINGLE BONE (from panel row hover) ──────────────────────────────
window.highlight3D = function(displayName, on) {
    if (!_skeleton) return;
    _skeleton.traverse(function(node) {
        if (!node.isMesh || !node._hlType || node._hlType === 'ghost') return;
        if (meshNameToDisplay(node.name) !== displayName) return;
        // a bone still being drawn in keeps its animation
        if (node.children.length) return;
        node.material = on ? HL.hoverMaterial() : HL.typeMaterial(node._hlType);
    });
    HL.invalidate();
};

// ── SCENE INIT ────────────────────────────────────────────────────────────────

window.resetCamera = function() {
    if (!_initCenter || !_cam || !_ctrl) return;
    _camFx.fly(new THREE.Vector3(_initCenter.x, _initCenter.y, _initCenter.z + _initDist), _initCenter, 700);
};

// ── GET WORLD-SPACE CENTER OF A NAMED BONE ────────────────────────────────────
window.getMeshCenter = function(displayName) {
    if (!_skeleton) return null;
    var box = new THREE.Box3();
    var found = false;
    var want = [{ name: displayName }];
    _skeleton.traverse(function(node) {
        if (!node.isMesh || !_matchBone(node, want)) return;
        if (!node.geometry.boundingBox) node.geometry.computeBoundingBox();
        box.union(node.geometry.boundingBox.clone().applyMatrix4(node.matrixWorld));
        found = true;
    });
    if (!found) return null;
    return box.getCenter(new THREE.Vector3());
};

// ── SMOOTH PAN CAMERA TO MIDPOINT BETWEEN TWO BONES ──────────────────────────
window.panToGameBones = function(startBone, endBone, duration) {
    if (!_cam || !_ctrl || !_skeleton) return;
    duration = duration || 1800;

    var startPos = window.getMeshCenter(startBone);
    var endPos   = window.getMeshCenter(endBone);
    if (!startPos || !endPos) return;

    // Midpoint between the two bones
    var mid = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);

    // Distance — zoom in relative to how far apart the bones are
    var spread = startPos.distanceTo(endPos);
    var targetDist = Math.max(_initDist * 0.45, Math.min(spread * 2.2, _initDist * 0.85));

    // Keep the same viewing angle, just glide closer
    var dir = _cam.position.clone().sub(_ctrl.target).normalize();
    _camFx.fly(mid.clone().add(dir.multiplyScalar(targetDist)), mid, duration);
};
function _initSkeletonEngine() {
    var cont  = document.getElementById('cv');
    var scene = new THREE.Scene();

    _cam = new THREE.PerspectiveCamera(45, cont.clientWidth / cont.clientHeight, 0.1, 1000);
    _renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    _renderer.setSize(cont.clientWidth, cont.clientHeight);
    HL.enable(_renderer);
    cont.appendChild(_renderer.domElement);

    _ctrl = new THREE.OrbitControls(_cam, _renderer.domElement);
    var ctrl = _ctrl;
    _camFx = HL.camera({ cam: _cam, ctrl: ctrl, dom: _renderer.domElement,
                         pickables: function () { return _skeleton ? allMeshes() : []; } });

    // ── Mouse hover (rAF-throttled) ──
    _renderer.domElement.addEventListener('mousemove', function(e) {
        if (_rafPending) return;
        _rafPending = true;
        var cx = e.clientX, cy = e.clientY;
        requestAnimationFrame(function() { _rafPending = false; handleHover(cx, cy); });
    });
    _renderer.domElement.addEventListener('mouseleave', function() {
        _lastHover = null;
        if (window.boneTooltip) window.boneTooltip.hide();
    });

    // ── Mouse click ──
    _renderer.domElement.addEventListener('click', function(e) {
        handleClick(e.clientX, e.clientY);
    });

    // ── Touch: tap detection (distinguish from drag) ──
    var _touchStart = null;
    _renderer.domElement.addEventListener('touchstart', function(e) {
        if (e.touches.length !== 1) return;
        _touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
    }, { passive:true });

    _renderer.domElement.addEventListener('touchend', function(e) {
        if (!_touchStart || e.changedTouches.length !== 1) return;
        var dx = e.changedTouches[0].clientX - _touchStart.x;
        var dy = e.changedTouches[0].clientY - _touchStart.y;
        var dt = Date.now() - _touchStart.t;
        var x  = e.changedTouches[0].clientX;
        var y  = e.changedTouches[0].clientY;
        _touchStart = null;
        if (Math.sqrt(dx*dx + dy*dy) > 10 || dt > 350) return; // was a drag

        // Tap: show tooltip briefly, then open card
        var mesh = raycastAt(x, y);
        if (!mesh || !mesh.material || mesh.material.transparent) return;
        var display = meshNameToDisplay(mesh.name);
        if (!display) return;
        if (window.boneTooltip) {
            window.boneTooltip.show(display, x, y);
            setTimeout(function() {
                if (window.boneTooltip) { window.boneTooltip.hide(); window.boneTooltip.openCard(display); }
            }, 500);
        }
        e.preventDefault();
    }, { passive:false });

    // ── Lights ──
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    var dl = new THREE.DirectionalLight(0xffffff, 0.8);
    dl.position.set(5, 10, 7.5); scene.add(dl);
    var dl2 = new THREE.DirectionalLight(0xffffff, 0.35);
    dl2.position.set(-5, 2, -6); scene.add(dl2);

    // ── Load model ──
    var draco = new THREE.DRACOLoader();
    draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    var loader = new THREE.GLTFLoader();
    loader.setDRACOLoader(draco);
    var note = HL.loadNote(cont);
    loader.load('../models/overview-skeleton.glb', function(gltf) {
        note.done();
        _skeleton = gltf.scene;
        scene.add(_skeleton);
        buildReverseMap();
        var box    = new THREE.Box3().setFromObject(_skeleton);
        var center = box.getCenter(new THREE.Vector3());
        var size   = box.getSize(new THREE.Vector3());
        ctrl.target.copy(center);
        var fov    = _cam.fov * (Math.PI / 180);
        var maxDim = Math.max(size.x, size.y, size.z);
        _camFx.setRange(maxDim, box);
        var dist = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5;
        _initCenter = center.clone();
        _initDist   = dist;
        _cam.position.set(center.x, center.y, center.z + dist);
        _cam.lookAt(center); ctrl.update();
        window.reset3D();
        window.__modelIsReady = true;
        window.dispatchEvent(new CustomEvent('modelReady'));
    }, note.progress, function(err) {
        console.error('Failed to load overview-skeleton.glb:', err);
        note.fail();
    });

    // Only draw when something changed: the camera moved, a bone was
    // recoloured, or an animation is running. Saves battery when idle.
    ctrl.addEventListener('change', HL.invalidate);
    function animate() {
        requestAnimationFrame(animate);
        _camFx.step();
        ctrl.update();
        if (HL.tick()) _renderer.render(scene, _cam);
    }
    animate();

    var ro = new ResizeObserver(function() {
        _cam.aspect = cont.clientWidth / cont.clientHeight;
        _cam.updateProjectionMatrix();
        _renderer.setSize(cont.clientWidth, cont.clientHeight);
        HL.invalidate();
    });
    ro.observe(cont);
}

// Call immediately if DOM is ready, otherwise wait
window.__skeletonEngineInit = _initSkeletonEngine;
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', _initSkeletonEngine);
} else {
    _initSkeletonEngine();
}
