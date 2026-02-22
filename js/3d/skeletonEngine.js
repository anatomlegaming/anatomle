// ============================================================================
// FULL SKELETON 3D ENGINE (Pathfinding Mode)
// ============================================================================
// Requires: THREE.js, OrbitControls, GLTFLoader, DRACOLoader
// Requires: BONE_TO_3D_MODEL from boneMappings.js
// Requires: boneTooltip.js (window.boneTooltip)
// ============================================================================

var _skeleton  = null;
var _cam       = null;
var _renderer  = null;
var _raycaster = new THREE.Raycaster();
var _rafPending= false;
var _lastHover = null;

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
function raycastAt(clientX, clientY) {
    if (!_skeleton || !_cam || !_renderer) return null;
    var rect  = _renderer.domElement.getBoundingClientRect();
    var mouse = new THREE.Vector2(
        ((clientX - rect.left) / rect.width)  * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
    );
    _raycaster.setFromCamera(mouse, _cam);
    var hits = _raycaster.intersectObjects([_skeleton], true);
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
        n.material = new THREE.MeshStandardMaterial({ color:0x8B7355, transparent:true, opacity:0.25 });
        n._baseMaterial = n.material;
    });
};

window.update3D = function(bones) {
    if (!_skeleton) return;
    _skeleton.traverse(function(node) {
        if (!node.isMesh) return;
        var matched = null;
        for (var i = 0; i < bones.length; i++) {
            var b = bones[i];
            if (b.name === 'True Ribs (1-7)')        { for(var t=0;t<TRUE_RIB_NODES.length;t++)     if(node.name.indexOf(TRUE_RIB_NODES[t])    !=-1){matched=b;break;} if(matched)break; continue; }
            if (b.name === 'False Ribs (8-10)')       { for(var f=0;f<FALSE_RIB_NODES.length;f++)    if(node.name.indexOf(FALSE_RIB_NODES[f])   !=-1){matched=b;break;} if(matched)break; continue; }
            if (b.name === 'Floating Ribs (11-12)')   { for(var l=0;l<FLOATING_RIB_NODES.length;l++) if(node.name.indexOf(FLOATING_RIB_NODES[l])!=-1){matched=b;break;} if(matched)break; continue; }
            if (b.name === 'Costal Cartilage (1-7)')  { for(var c=0;c<COSTAL_TRUE_NODES.length;c++)  if(node.name.indexOf(COSTAL_TRUE_NODES[c]) !=-1){matched=b;break;} if(matched)break; continue; }
            if (b.name === 'Costal Cartilage (8-10)') { for(var d=0;d<COSTAL_FALSE_NODES.length;d++) if(node.name.indexOf(COSTAL_FALSE_NODES[d])!=-1){matched=b;break;} if(matched)break; continue; }
            if (b.name === 'Hip Bone') { if(node.name.indexOf('Hip_boner')!=-1){matched=b;break;} continue; }
            var key = BONE_TO_3D_MODEL[b.name];
            if (!key) continue;
            if (key.indexOf('__group__') === 0) {
                var parts = key.slice(9).split('|');
                for (var p = 0; p < parts.length; p++) { if(node.name.indexOf(parts[p])!=-1){matched=b;break;} }
                if (matched) break;
            } else {
                if (node.name.indexOf(key) !== -1) { matched = b; break; }
            }
        }
        var mat;
        if (matched) {
            var col = 0x5a8a6a, em = 0.55;
            if (matched.type === 'start')  { col = 0x5a8a6a; em = 0.6; }
            if (matched.type === 'end')    { col = 0xe8603c; em = 0.6; }
            if (matched.type === 'path')   { col = 0x5a8a6a; em = 0.5; }
            if (matched.type === 'detour') { col = 0xf0a500; em = 0.6; }
            if (matched.type === 'bad')    { col = 0xc94d2b; em = 0.75; }
            if (matched.type === 'reveal') { col = 0x8b5cf6; em = 0.7; }
            mat = new THREE.MeshStandardMaterial({ color:col, emissive:col, emissiveIntensity:em });
        } else {
            mat = new THREE.MeshStandardMaterial({ color:0x8B7355, transparent:true, opacity:0.25 });
        }
        node.material      = mat;
        node._baseMaterial = mat;
    });
};

// ── HIGHLIGHT SINGLE BONE (from panel row hover) ──────────────────────────────
window.highlight3D = function(displayName, on) {
    if (!_skeleton) return;
    _skeleton.traverse(function(node) {
        if (!node.isMesh || !node._baseMaterial || node._baseMaterial.transparent) return;
        if (meshNameToDisplay(node.name) !== displayName) return;
        if (on) {
            var hl = node._baseMaterial.clone();
            hl.emissive          = new THREE.Color(0xffffff);
            hl.emissiveIntensity = 0.4;
            hl.color             = new THREE.Color(0xffffff);
            node.material = hl;
        } else {
            node.material = node._baseMaterial;
        }
    });
};

// ── SCENE INIT ────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', function() {
    var cont  = document.getElementById('cv');
    var scene = new THREE.Scene();

    _cam = new THREE.PerspectiveCamera(45, cont.clientWidth / cont.clientHeight, 0.1, 1000);
    _renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    _renderer.setSize(cont.clientWidth, cont.clientHeight);
    cont.appendChild(_renderer.domElement);

    var ctrl = new THREE.OrbitControls(_cam, _renderer.domElement);
    ctrl.enableDamping = true; ctrl.dampingFactor = 0.05;
    ctrl.maxPolarAngle = Math.PI;
    ctrl.minDistance = 1; ctrl.maxDistance = 10; ctrl.enableZoom = false;

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

    // ── Mouse wheel zoom ──
    _renderer.domElement.addEventListener('wheel', function(e) {
        e.preventDefault();
        var rect  = _renderer.domElement.getBoundingClientRect();
        var mouse = new THREE.Vector2(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        var ray = new THREE.Raycaster(); ray.setFromCamera(mouse, _cam);
        var t3d;
        if (_skeleton) { var h = ray.intersectObjects([_skeleton], true); if (h.length) t3d = h[0].point.clone(); }
        if (!t3d) t3d = ray.ray.at(_cam.position.distanceTo(ctrl.target), new THREE.Vector3());
        var dist = _cam.position.distanceTo(ctrl.target);
        if (e.deltaY < 0 && dist > ctrl.minDistance) {
            _cam.position.lerp(t3d, 0.12);
            ctrl.target.lerp(t3d, 0.08);
        } else if (e.deltaY > 0 && dist < ctrl.maxDistance) {
            _cam.position.lerp(t3d, -0.12);
            ctrl.target.lerp(t3d, -0.08);
        }
        ctrl.update();
    }, { passive:false });

    // ── Lights ──
    scene.add(new THREE.AmbientLight(0xfff8f0, 0.9));
    var dl = new THREE.DirectionalLight(0xfff4e8, 0.7);
    dl.position.set(5, 10, 7.5); scene.add(dl);

    // ── Load model ──
    var draco = new THREE.DRACOLoader();
    draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    var loader = new THREE.GLTFLoader();
    loader.setDRACOLoader(draco);
    loader.load('../models/overview-skeleton.glb', function(gltf) {
        _skeleton = gltf.scene;
        scene.add(_skeleton);
        buildReverseMap();
        var box    = new THREE.Box3().setFromObject(_skeleton);
        var center = box.getCenter(new THREE.Vector3());
        var size   = box.getSize(new THREE.Vector3());
        ctrl.target.copy(center);
        var fov    = _cam.fov * (Math.PI / 180);
        var maxDim = Math.max(size.x, size.y, size.z);
        _cam.position.set(center.x, center.y, center.z + Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5);
        _cam.lookAt(center); ctrl.update();
        window.reset3D();
        window.dispatchEvent(new CustomEvent('modelReady'));
    });

    function animate() { requestAnimationFrame(animate); ctrl.update(); _renderer.render(scene, _cam); }
    animate();

    var ro = new ResizeObserver(function() {
        _cam.aspect = cont.clientWidth / cont.clientHeight;
        _cam.updateProjectionMatrix();
        _renderer.setSize(cont.clientWidth, cont.clientHeight);
    });
    ro.observe(cont);
});
