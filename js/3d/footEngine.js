// ============================================================================
// FOOT 3D ENGINE
// ============================================================================
// Requires: THREE.js, OrbitControls, GLTFLoader, DRACOLoader
// Requires: FOOT_B2M mapping defined in game file
// ============================================================================

var _sk = null;
var FOOT_MESH_KEYS = ['Tibia','Fibula','Talus','Calcaneus','Navicular_boner','Cuboid_boner','Medial_cuneiform','Intermediate_cuneiform','Lateral_cuneiform','First_metatarsal','Second_metatarsal','Third_metatarsal','Fourth_metatarsal','Fifth_metatarsal','finger_of_foot'];

function isFoot(n) {
    for (var i=0;i<FOOT_MESH_KEYS.length;i++) if (n.indexOf(FOOT_MESH_KEYS[i])!==-1) return true;
    return false;
}

window.update3D = function(bones) {
    if (!_sk) return;
    _sk.traverse(function(node) {
        if (!node.isMesh || !isFoot(node.name)) { node.visible = false; return; }
        node.visible = true;
        var m = null;
        for (var i=0;i<bones.length;i++) {
            var k = FOOT_B2M[bones[i].name];
            if (k && node.name.indexOf(k)!==-1) { m = bones[i]; break; }
        }
        if (m) {
            var c=0x3b82f6, e=0.5;
            if (m.type==='start')  { c=0x10b981; e=0.6; }
            if (m.type==='bad')    { c=0xef4444; e=0.8; }
            if (m.type==='reveal') { c=0xd946ef; e=0.8; }
            node.material = new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:e});
        } else {
            node.material = new THREE.MeshStandardMaterial({color:0x334155,transparent:true,opacity:0.3});
        }
    });
};

window.reset3D = function() {
    if (!_sk) return;
    _sk.traverse(function(node) {
        if (!node.isMesh) return;
        if (isFoot(node.name)) {
            node.material = new THREE.MeshStandardMaterial({color:0x334155,transparent:true,opacity:0.3});
            node.visible = true;
        } else { node.visible = false; }
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
        var rect=renderer.domElement.getBoundingClientRect();
        var mouse=new THREE.Vector2(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1);
        var ray=new THREE.Raycaster(); ray.setFromCamera(mouse,cam);
        var t3d;
        if(_sk){var h=ray.intersectObjects([_sk],true);if(h.length)t3d=h[0].point.clone();}
        if(!t3d)t3d=ray.ray.at(cam.position.distanceTo(ctrl.target),new THREE.Vector3());
        var dir=new THREE.Vector3().subVectors(t3d,cam.position);
        var dist=cam.position.distanceTo(ctrl.target);
        var step=dir.length()*0.12;
        if(e.deltaY<0&&dist>ctrl.minDistance)cam.position.addScaledVector(dir.normalize(),step);
        else if(e.deltaY>0&&dist<ctrl.maxDistance)cam.position.addScaledVector(dir.normalize(),-step);
        ctrl.update();
    },{passive:false});

    scene.add(new THREE.AmbientLight(0xffffff,0.7));
    var dl=new THREE.DirectionalLight(0xffffff,0.9); dl.position.set(3,8,5); scene.add(dl);
    var dl2=new THREE.DirectionalLight(0xffffff,0.3); dl2.position.set(-5,-3,-5); scene.add(dl2);

    var draco=new THREE.DRACOLoader(); draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    var loader=new THREE.GLTFLoader(); loader.setDRACOLoader(draco);
    loader.load('../models/overview-skeleton.glb', function(gltf) {
        _sk = gltf.scene; scene.add(_sk);
        var box = new THREE.Box3();
        _sk.traverse(function(n){ if(!n.isMesh) return; if(isFoot(n.name)) box.expandByObject(n); else n.visible=false; });
        var center=box.getCenter(new THREE.Vector3()); var size=box.getSize(new THREE.Vector3());
        ctrl.target.copy(center);
        var fov=cam.fov*(Math.PI/180); var maxDim=Math.max(size.x,size.y,size.z);
        cam.position.set(center.x, center.y+size.y*0.2, center.z+Math.abs(maxDim/2/Math.tan(fov/2))*2.4);
        cam.lookAt(center); ctrl.update();
        window.reset3D();
    });

    function animate(){ requestAnimationFrame(animate); ctrl.update(); renderer.render(scene,cam); }
    animate();

    var ro = new ResizeObserver(function(){
        cam.aspect=cont.clientWidth/cont.clientHeight; cam.updateProjectionMatrix();
        renderer.setSize(cont.clientWidth,cont.clientHeight);
    });
    ro.observe(cont);
});
