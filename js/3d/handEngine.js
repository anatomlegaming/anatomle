// ============================================================================
// HAND 3D ENGINE
// ============================================================================
// Requires: THREE.js, OrbitControls, GLTFLoader, DRACOLoader
// Requires: HAND_B2M mapping defined in game file
// ============================================================================

// ── Bone name → 3D mesh node mapping (owned by engine, not HTML) ─────────────
var HAND_B2M = {
    'Radius':'Radiusr','Ulna':'Ulnar',
    'Scaphoid':'Scaphoidr','Lunate':'Lunate_boner','Triquetrum':'Triquetrum','Pisiform':'Pisiformr',
    'Trapezium':'Trapeziumr','Trapezoid':'Trapezoidr','Capitate':'Capitater','Hamate':'Hamater',
    'Metacarpal I':'1st_metacarpal_boner','Metacarpal II':'2nd_metacarpal_boner',
    'Metacarpal III':'3rd_metacarpal_boner','Metacarpal IV':'4th_metacarpal_boner','Metacarpal V':'5th_metacarpal_boner',
    'Proximal Phalanx I':'Proximal_phalanx_of_1st_fingerr',
    'Distal Phalanx I':'Distal_phalanx_of_1st_fingerr',
    'Proximal Phalanx II':'Proximal_phalanx_of_2d_fingerr',
    'Middle Phalanx II':'Middle_phalanx_of_2d_fingerr',
    'Distal Phalanx II':'Distal_phalanx_of_2d_fingerr',
    'Proximal Phalanx III':'Proximal_phalanx_of_3rd_fingerr',
    'Middle Phalanx III':'Middle_phalanx_of_3rd_fingerr',
    'Distal Phalanx III':'Distal_phalanx_of_3d_fingerr',
    'Proximal Phalanx IV':'Proximal_phalanx_of_4th_fingerr',
    'Middle Phalanx IV':'Middle_phalanx_of_4th_fingerr',
    'Distal Phalanx IV':'Distal_phalanx_of_4th_fingerr',
    'Proximal Phalanx V':'Proximal_phalanx_of_5th_fingerr',
    'Middle Phalanx V':'Middle_phalanx_of_5th_fingerr',
    'Distal Phalanx V':'Distal_phalanx_of_5th_fingerr',
};

var _sk = null;
var HAND_MESH_KEYS = [
    'Radiusr','Ulnar',
    'Scaphoidr','Lunate_boner','Triquetrum','Pisiformr',
    'Trapeziumr','Trapezoidr','Capitater','Hamater',
    '1st_metacarpal_boner','2nd_metacarpal_boner','3rd_metacarpal_boner','4th_metacarpal_boner','5th_metacarpal_boner',
    'Proximal_phalanx_of_1st_fingerr','Distal_phalanx_of_1st_fingerr',
    'Proximal_phalanx_of_2d_fingerr','Middle_phalanx_of_2d_fingerr','Distal_phalanx_of_2d_fingerr',
    'Proximal_phalanx_of_3rd_fingerr','Middle_phalanx_of_3rd_fingerr','Distal_phalanx_of_3d_fingerr',
    'Proximal_phalanx_of_4th_fingerr','Middle_phalanx_of_4th_fingerr','Distal_phalanx_of_4th_fingerr',
    'Proximal_phalanx_of_5th_fingerr','Middle_phalanx_of_5th_fingerr','Distal_phalanx_of_5th_fingerr'
];

function isHand(n) {
    if (n.indexOf('foot')!==-1 || n.indexOf('_of_foot')!==-1 || n.indexOf('finger_of_foot')!==-1) return false;
    if (n.slice(-2) === '_1') return false;  // exclude mirrored left-side bones
    for (var i=0;i<HAND_MESH_KEYS.length;i++) if (n.indexOf(HAND_MESH_KEYS[i])!==-1) return true;
    return false;
}

window.update3D = function(bones) {
    if (!_sk) return;
    _sk.traverse(function(node) {
        if (!node.isMesh) return;
        if (!isHand(node.name)) { node.visible = false; return; }
        node.visible = true;
        var m = null;
        for (var i = 0; i < bones.length; i++) {
            var k = HAND_B2M[bones[i].name];
            if (k && node.name.indexOf(k) !== -1) { m = bones[i]; break; }
        }
        if (m) {
            var c = 0x5a8a6a, e = 0.55;
            if (m.type === 'start')  { c = 0x5a8a6a; e = 0.6; }
            if (m.type === 'found')  { c = 0x5a8a6a; e = 0.5; }
            if (m.type === 'bad')    { c = 0xc94d2b; e = 0.75; }
            if (m.type === 'reveal') { c = 0x8b5cf6; e = 0.7; }
            node.material = new THREE.MeshStandardMaterial({color:c, emissive:c, emissiveIntensity:e, transparent:false, opacity:1});
        } else {
            node.material = new THREE.MeshStandardMaterial({color:0x8B7355, transparent:true, opacity:0.55});
        }
    });
};

window.reset3D = function() {
    if (!_sk) return;
    _sk.traverse(function(node) {
        if (!node.isMesh) return;
        if (isHand(node.name)) {
            node.material = new THREE.MeshStandardMaterial({color:0x8B7355, transparent:true, opacity:0.55});
            node.visible = true;
        } else {
            node.visible = false;
        }
    });
};

window.addEventListener('DOMContentLoaded', function() {
    var cont = document.getElementById('cv');
    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(45, cont.clientWidth/cont.clientHeight, 0.01, 100);
    var renderer = new THREE.WebGLRenderer({antialias:true,alpha:true});
    renderer.setSize(cont.clientWidth, cont.clientHeight);
    cont.appendChild(renderer.domElement);

    var ctrl = new THREE.OrbitControls(cam, renderer.domElement);
    ctrl.enableDamping=true; ctrl.dampingFactor=0.05; ctrl.maxPolarAngle=Math.PI;
    ctrl.minDistance=0.05; ctrl.maxDistance=2; ctrl.enableZoom=false;

    renderer.domElement.addEventListener('wheel', function(e) {
        e.preventDefault();
        var rect  = renderer.domElement.getBoundingClientRect();
        var mouse = new THREE.Vector2(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        var ray = new THREE.Raycaster(); ray.setFromCamera(mouse, cam);
        var t3d;
        if (_sk) { var h = ray.intersectObjects([_sk], true); if (h.length) t3d = h[0].point.clone(); }
        if (!t3d) t3d = ray.ray.at(cam.position.distanceTo(ctrl.target), new THREE.Vector3());
        var dist = cam.position.distanceTo(ctrl.target);
        var step = dist * 0.12;
        if (e.deltaY < 0 && dist > ctrl.minDistance) {
            cam.position.lerp(t3d, 0.12);
            ctrl.target.lerp(t3d, 0.08);
        } else if (e.deltaY > 0 && dist < ctrl.maxDistance) {
            cam.position.lerp(t3d, -0.12);
            ctrl.target.lerp(t3d, -0.08);
        }
        ctrl.update();
    }, {passive:false});

    scene.add(new THREE.AmbientLight(0xfff8f0, 0.9));
    var dl=new THREE.DirectionalLight(0xfff4e8, 0.7); dl.position.set(3,8,5); scene.add(dl);
    var dl2=new THREE.DirectionalLight(0xfff4e8, 0.7); dl2.position.set(-5,-3,-5); scene.add(dl2);

    var draco=new THREE.DRACOLoader(); draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    var loader=new THREE.GLTFLoader(); loader.setDRACOLoader(draco);
    loader.load('../models/overview-skeleton.glb', function(gltf) {
        _sk = gltf.scene; scene.add(_sk);
        // First pass: hide everything, collect bounding box of right-side bones only
        var box = new THREE.Box3();
        _sk.traverse(function(n){
            if(!n.isMesh) return;
            if(isHand(n.name)) { box.expandByObject(n); n.visible=true; }
            else n.visible=false;
        });
        if(box.isEmpty()) { console.warn('Hand bounding box empty'); return; }
        var center=box.getCenter(new THREE.Vector3());
        var size=box.getSize(new THREE.Vector3());
        ctrl.target.copy(center);
        var fov=cam.fov*(Math.PI/180); var maxDim=Math.max(size.x,size.y,size.z);
        var dist=Math.abs(maxDim/2/Math.tan(fov/2))*1.4;
        cam.position.set(center.x, center.y, center.z+dist);
        cam.lookAt(center); ctrl.update();
        window.reset3D();
        window.dispatchEvent(new CustomEvent('modelReady'));
    });

    function animate(){ requestAnimationFrame(animate); ctrl.update(); renderer.render(scene,cam); }
    animate();

    var ro = new ResizeObserver(function(){
        cam.aspect=cont.clientWidth/cont.clientHeight; cam.updateProjectionMatrix();
        renderer.setSize(cont.clientWidth,cont.clientHeight);
    }); 
    ro.observe(cont);
});
