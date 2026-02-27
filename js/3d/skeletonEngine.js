// ============================================================================
// ANATOMLE — Skull 3D Engine (14 bones)
// Modern architecture: modelReady event, resetCamera, panToGameBones
// ============================================================================

var _cam, _ctrl, _renderer, _skeleton;
var _initCenter, _initDist;

var SKULL_B2M = {
    'Frontal Bone':           'Frontal',
    'Parietal Bone':          'Parietal',
    'Occipital Bone':         'Occipital',
    'Temporal Bone':          'Temporal',
    'Sphenoid Bone':          'Sphenoid',
    'Ethmoid Bone':           'Ethmoid',
    'Nasal Bone':             'Nasal_boner',
    'Lacrimal Bone':          'Lacrimal_boner',
    'Zygomatic Bone':         'Zygomatic',
    'Maxilla':                'Maxilla',
    'Palatine Bone':          'Palatine',
    'Vomer':                  'Vomer',
    'Inferior Nasal Concha':  'Inferior_nasal_concha_boner',
    'Mandible':               'Mandible',
};

var SKULL_MESH_KEYS = Object.values(SKULL_B2M);

function isSkull(meshName) {
    for (var i = 0; i < SKULL_MESH_KEYS.length; i++) {
        if (meshName.indexOf(SKULL_MESH_KEYS[i]) !== -1) return true;
    }
    return false;
}

function meshKeyForBone(boneName) { return SKULL_B2M[boneName] || null; }

// Reverse: mesh name → display bone name
function meshNameToDisplay(meshName) {
    var bones = Object.keys(SKULL_B2M);
    for (var i = 0; i < bones.length; i++) {
        if (meshName.indexOf(SKULL_B2M[bones[i]]) !== -1) return bones[i];
    }
    return null;
}

// ── RAYCASTING ────────────────────────────────────────────────────────────────
var _raycaster = null;
var _lastHover = null;
var _rafPending = false;

function raycastAt(clientX, clientY) {
    if (!_skeleton || !_cam || !_renderer) return null;
    var rect  = _renderer.domElement.getBoundingClientRect();
    var mouse = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
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
    if (!display) { _lastHover = null; if (window.boneTooltip) window.boneTooltip.hide(); return; }
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

window.update3D = function(bones) {
    if (!_skeleton) return;
    _skeleton.traverse(function(node) {
        if (!node.isMesh) return;
        if (!isSkull(node.name)) { node.visible = false; return; }
        node.visible = true;
        var matched = null;
        for (var i = 0; i < bones.length; i++) {
            var key = meshKeyForBone(bones[i].name);
            if (key && node.name.indexOf(key) !== -1) { matched = bones[i]; break; }
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
            mat = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: em });
        } else {
            mat = new THREE.MeshStandardMaterial({ color: 0x8B7355, transparent: true, opacity: 0.25 });
        }
        node.material = mat; node._baseMaterial = mat;
    });
};

window.reset3D = function() {
    if (!_skeleton) return;
    _skeleton.traverse(function(node) {
        if (!node.isMesh) return;
        if (isSkull(node.name)) {
            var mat = new THREE.MeshStandardMaterial({ color: 0x8B7355, transparent: true, opacity: 0.25 });
            node.material = mat; node._baseMaterial = mat; node.visible = true;
        } else { node.visible = false; }
    });
};

window.highlight3D = function(boneName, on) {
    if (!_skeleton) return;
    var key = meshKeyForBone(boneName);
    if (!key) return;
    _skeleton.traverse(function(node) {
        if (!node.isMesh || !node._baseMaterial || node._baseMaterial.transparent) return;
        if (node.name.indexOf(key) === -1) return;
        if (on) {
            var hl = node._baseMaterial.clone();
            hl.emissive = new THREE.Color(0xffffff); hl.emissiveIntensity = 0.4;
            hl.color = new THREE.Color(0xffffff); node.material = hl;
        } else { node.material = node._baseMaterial; }
    });
};

window.resetCamera = function() {
    if (!_initCenter || !_cam || !_ctrl) return;
    _cam.position.set(_initCenter.x, _initCenter.y, _initCenter.z + _initDist);
    _ctrl.target.copy(_initCenter); _cam.lookAt(_initCenter);
    _ctrl.saveState && _ctrl.saveState(); _ctrl.update();
};

window.getMeshCenter = function(boneName) {
    if (!_skeleton) return null;
    var key = meshKeyForBone(boneName);
    if (!key) return null;
    var box = new THREE.Box3(); var found = false;
    _skeleton.traverse(function(node) {
        if (!node.isMesh || node.name.indexOf(key) === -1) return;
        node.geometry.computeBoundingBox();
        box.union(node.geometry.boundingBox.clone().applyMatrix4(node.matrixWorld));
        found = true;
    });
    return found ? box.getCenter(new THREE.Vector3()) : null;
};

window.panToGameBones = function(startBone, endBone, duration) {
    if (!_cam || !_ctrl || !_skeleton) return;
    duration = duration || 1500;
    var sp = window.getMeshCenter(startBone), ep = window.getMeshCenter(endBone);
    if (!sp || !ep) return;
    var mid = new THREE.Vector3().addVectors(sp, ep).multiplyScalar(0.5);
    var spread = sp.distanceTo(ep);
    var targetDist = Math.max(0.4, Math.min(spread * 2.5, _initDist * 0.9));
    var fromTarget = _ctrl.target.clone(), fromPos = _cam.position.clone();
    var dir = fromPos.clone().sub(fromTarget).normalize();
    var toTarget = mid.clone(), toPos = mid.clone().add(dir.multiplyScalar(targetDist));
    var t0 = performance.now();
    function ease(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
    function step(now) {
        var t = Math.min((now - t0) / duration, 1), e = ease(t);
        _cam.position.lerpVectors(fromPos, toPos, e);
        _ctrl.target.lerpVectors(fromTarget, toTarget, e);
        _ctrl.update();
        if (t < 1) requestAnimationFrame(step);
        else { _ctrl.saveState && _ctrl.saveState(); }
    }
    requestAnimationFrame(step);
};

function _initSkullEngine() {
    var cont = document.getElementById('cv');
    var scene = new THREE.Scene();
    _cam = new THREE.PerspectiveCamera(45, cont.clientWidth / cont.clientHeight, 0.1, 1000);
    _renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    _renderer.setSize(cont.clientWidth, cont.clientHeight);
    cont.appendChild(_renderer.domElement);
    _raycaster = new THREE.Raycaster();

    // ── Mouse hover ──
    _renderer.domElement.addEventListener('mousemove', function(e) {
        if (_rafPending) return;
        _rafPending = true;
        var cx = e.clientX, cy = e.clientY;
        requestAnimationFrame(function() { _rafPending = false; handleHover(cx, cy); });
    });
    _renderer.domElement.addEventListener('mouseleave', function() {
        _lastHover = null; if (window.boneTooltip) window.boneTooltip.hide();
    });
    // ── Mouse click ──
    _renderer.domElement.addEventListener('click', function(e) { handleClick(e.clientX, e.clientY); });
    // ── Touch tap ──
    var _touchStart = null;
    _renderer.domElement.addEventListener('touchstart', function(e) {
        if (e.touches.length !== 1) return;
        _touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
    }, { passive: true });
    _renderer.domElement.addEventListener('touchend', function(e) {
        if (!_touchStart || e.changedTouches.length !== 1) return;
        var dx = e.changedTouches[0].clientX - _touchStart.x;
        var dy = e.changedTouches[0].clientY - _touchStart.y;
        var dt = Date.now() - _touchStart.t;
        var x = e.changedTouches[0].clientX, y = e.changedTouches[0].clientY;
        _touchStart = null;
        if (Math.sqrt(dx*dx+dy*dy) > 10 || dt > 350) return;
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
    }, { passive: false });

    _ctrl = new THREE.OrbitControls(_cam, _renderer.domElement);
    _ctrl.enableDamping = true; _ctrl.dampingFactor = 0.05;
    _ctrl.maxPolarAngle = Math.PI; _ctrl.minDistance = 0.3; _ctrl.maxDistance = 8; _ctrl.enableZoom = false;

    _renderer.domElement.addEventListener('wheel', function(e) {
        e.preventDefault();
        var rect = _renderer.domElement.getBoundingClientRect();
        var mouse = new THREE.Vector2(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1);
        var ray = new THREE.Raycaster(); ray.setFromCamera(mouse, _cam);
        var t3d;
        if (_skeleton) { var h = ray.intersectObjects([_skeleton], true); if (h.length) t3d = h[0].point.clone(); }
        if (!t3d) t3d = ray.ray.at(_cam.position.distanceTo(_ctrl.target), new THREE.Vector3());
        var dist = _cam.position.distanceTo(_ctrl.target);
        if (e.deltaY < 0 && dist > _ctrl.minDistance) { _cam.position.lerp(t3d, 0.12); _ctrl.target.lerp(t3d, 0.08); }
        else if (e.deltaY > 0 && dist < _ctrl.maxDistance) { _cam.position.lerp(t3d, -0.12); _ctrl.target.lerp(t3d, -0.08); }
        _ctrl.update();
    }, { passive: false });

    scene.add(new THREE.AmbientLight(0xfff8f0, 0.9));
    var dl = new THREE.DirectionalLight(0xfff4e8, 0.7); dl.position.set(5, 10, 7.5); scene.add(dl);

    var draco = new THREE.DRACOLoader(); draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    var loader = new THREE.GLTFLoader(); loader.setDRACOLoader(draco);
    loader.load('../../models/overview-skeleton.glb', function(gltf) {
        _skeleton = gltf.scene; scene.add(_skeleton);
        var box = new THREE.Box3();
        _skeleton.traverse(function(n) {
            if (!n.isMesh) return;
            if (isSkull(n.name)) box.expandByObject(n); else n.visible = false;
        });
        var center = box.getCenter(new THREE.Vector3());
        var size   = box.getSize(new THREE.Vector3());
        _ctrl.target.copy(center);
        var fov  = _cam.fov * (Math.PI / 180);
        var dist = Math.abs(Math.max(size.x,size.y,size.z) / 2 / Math.tan(fov/2)) * 1.8;
        _initCenter = center.clone(); _initDist = dist;
        _cam.position.set(center.x, center.y, center.z + dist);
        _cam.lookAt(center); _ctrl.update();
        window.reset3D();
        window.__modelIsReady = true;
        window.dispatchEvent(new CustomEvent('modelReady'));
    });

    function animate() { requestAnimationFrame(animate); _ctrl.update(); _renderer.render(scene, _cam); }
    animate();

    var ro = new ResizeObserver(function() {
        _cam.aspect = cont.clientWidth / cont.clientHeight;
        _cam.updateProjectionMatrix(); _renderer.setSize(cont.clientWidth, cont.clientHeight);
    });
    ro.observe(cont);
}

window.__skullEngineInit = _initSkullEngine;
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', _initSkullEngine);
} else {
    _initSkullEngine();
}
