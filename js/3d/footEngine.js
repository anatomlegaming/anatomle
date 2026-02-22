// ============================================================================
// FOOT 3D ENGINE
// ============================================================================
// Requires: THREE.js, OrbitControls, GLTFLoader, DRACOLoader
// Requires: FOOT_B2M mapping defined in game file
// ============================================================================

// ── Bone name → 3D mesh node mapping (owned by engine, not HTML) ─────────────
var FOOT_B2M = {
    'Tibia':'Tibiar','Fibula':'Fibular','Talus':'Talusr','Calcaneus':'Calcaneusr',
    'Navicular':'Navicular_boner','Cuboid':'Cuboid_boner',
    'Medial Cuneiform':'Medial_cuneiform_boner',
    'Intermediate Cuneiform':'Intermediate_cuneiform_boner',
    'Lateral Cuneiform':'Lateral_cuneiform_boner',
    'Metatarsal I':'First_metatarsal_boner','Metatarsal II':'Second_metatarsal_boner',
    'Metatarsal III':'Third_metatarsal_boner','Metatarsal IV':'Fourth_metatarsal_boner',
    'Metatarsal V':'Fifth_metatarsal_boner',
    'Proximal Phalanx I (Foot)':'Proximal_phalanx_of_first_finger_of_footr',
    'Distal Phalanx I (Foot)':'Distal_phalanx_of_first_finger_of_footr',
    'Proximal Phalanx II (Foot)':'Proximal_phalanx_of_second_finger_of_footr',
    'Middle Phalanx II (Foot)':'Middle_phalanx_of_second_finger_of_footr',
    'Distal Phalanx II (Foot)':'Distal_phalanx_of_second_finger_of_footr',
    'Proximal Phalanx III (Foot)':'Proximal_phalanx_of_third_finger_of_footr',
    'Middle Phalanx III (Foot)':'Middle_phalanx_of_third_finger_of_footr',
    'Distal Phalanx III (Foot)':'Distal_phalanx_of_third_finger_of_footr',
    'Proximal Phalanx IV (Foot)':'Proximal_phalanx_of_fourth_finger_of_footr',
    'Middle Phalanx IV (Foot)':'Middle_phalanx_of_fourth_finger_of_footr',
    'Distal Phalanx IV (Foot)':'Distal_phalanx_of_fourth_finger_of_footr',
    'Proximal Phalanx V (Foot)':'Proximal_phalanx_of_fifth_finger_of_footr',
    'Middle Phalanx V (Foot)':'Middle_phalanx_of_fifth_finger_of_footr',
    'Distal Phalanx V (Foot)':'Distal_phalanx_of_fifth_finger_of_footr',
};

var _sk = null;
var FOOT_MESH_KEYS = [
    'Tibiar','Fibular','Talusr','Calcaneusr',
    'Navicular_boner','Cuboid_boner',
    'Medial_cuneiform_boner','Intermediate_cuneiform_boner','Lateral_cuneiform_boner',
    'First_metatarsal_boner','Second_metatarsal_boner','Third_metatarsal_boner','Fourth_metatarsal_boner','Fifth_metatarsal_boner',
    'Proximal_phalanx_of_first_finger_of_footr','Distal_phalanx_of_first_finger_of_footr',
    'Proximal_phalanx_of_second_finger_of_footr','Middle_phalanx_of_second_finger_of_footr','Distal_phalanx_of_second_finger_of_footr',
    'Proximal_phalanx_of_third_finger_of_footr','Middle_phalanx_of_third_finger_of_footr','Distal_phalanx_of_third_finger_of_footr',
    'Proximal_phalanx_of_fourth_finger_of_footr','Middle_phalanx_of_fourth_finger_of_footr','Distal_phalanx_of_fourth_finger_of_footr',
    'Proximal_phalanx_of_fifth_finger_of_footr','Middle_phalanx_of_fifth_finger_of_footr','Distal_phalanx_of_fifth_finger_of_footr'
];

function isFoot(n) {
    if (n.slice(-2) === '_1') return false;  // exclude mirrored left-side bones
    for (var i=0;i<FOOT_MESH_KEYS.length;i++) if (n.indexOf(FOOT_MESH_KEYS[i])!==-1) return true;
    return false;
}

window.update3D = function(bones) {
    if (!_sk) return;
    _sk.traverse(function(node) {
        if (!node.isMesh) return;
        if (!isFoot(node.name)) { node.visible = false; return; }
        node.visible = true;
        var m = null;
        for (var i = 0; i < bones.length; i++) {
            var k = FOOT_B2M[bones[i].name];
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
        if (isFoot(node.name)) {
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
        var box = new THREE.Box3();
        _sk.traverse(function(n){
            if(!n.isMesh) return;
            if(isFoot(n.name)) { box.expandByObject(n); n.visible=true; }
            else n.visible=false;
        });
        if(box.isEmpty()) { console.warn('Foot bounding box empty'); return; }
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
