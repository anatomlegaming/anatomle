// ============================================================================
// FULL SKELETON 3D ENGINE (Pathfinding Mode)
// ============================================================================
// Requires: THREE.js, OrbitControls, GLTFLoader, DRACOLoader
// Requires: BONE_TO_3D_MODEL mapping from boneMappings.js
// ============================================================================

var _skeleton = null;
var TRUE_RIB_NODES     = ['Rib_(1st)r','Rib_(2nd)r','Rib_(3rd)r','Rib_(4th)r','Rib_(5th)r','Rib_(6th)r','Rib_(7th)r'];
var FALSE_RIB_NODES    = ['Rib_(8th)r','Rib_(9th)r','Rib_(10th)r'];
var FLOATING_RIB_NODES = ['Rib_(11th)r','Rib_(12th)r'];
var COSTAL_TRUE_NODES  = ['Costal_cart_of_1st_rib','Costal_cart_of_2nd_rib','Costal_cart_of_3rd_rib',
                          'Costal_cart_of_4th_rib','Costal_cart_of_5th_rib','Costal_cart_of_6th_rib','Costal_cart_of_7th_rib'];
var COSTAL_FALSE_NODES = ['Costal_cart_of_8th_rib','Costal_cart_of_9th_rib'];

window.reset3D = function() {
    if (!_skeleton) return;
    _skeleton.traverse(function(n){ if(n.isMesh) n.material=new THREE.MeshStandardMaterial({color:0x8B7355,transparent:true,opacity:0.25}); });
};

window.update3D = function(bones) {
    if (!_skeleton) return;
    _skeleton.traverse(function(node) {
        if (!node.isMesh) return;
        var matched = null;
        for (var i = 0; i < bones.length; i++) {
            var b = bones[i];
            // Special cases: ribs, hip bone
            if (b.name === 'True Ribs (1-7)')       { for(var t=0;t<TRUE_RIB_NODES.length;t++)     if(node.name.indexOf(TRUE_RIB_NODES[t])!==-1)    {matched=b;break;} if(matched)break; continue; }
            if (b.name === 'False Ribs (8-10)')     { for(var f=0;f<FALSE_RIB_NODES.length;f++)    if(node.name.indexOf(FALSE_RIB_NODES[f])!==-1)   {matched=b;break;} if(matched)break; continue; }
            if (b.name === 'Floating Ribs (11-12)') { for(var l=0;l<FLOATING_RIB_NODES.length;l++) if(node.name.indexOf(FLOATING_RIB_NODES[l])!==-1) {matched=b;break;} if(matched)break; continue; }
            if (b.name === 'Costal Cartilage (1-7)')  { for(var c=0;c<COSTAL_TRUE_NODES.length;c++)  if(node.name.indexOf(COSTAL_TRUE_NODES[c])!==-1)  {matched=b;break;} if(matched)break; continue; }
            if (b.name === 'Costal Cartilage (8-10)') { for(var d=0;d<COSTAL_FALSE_NODES.length;d++) if(node.name.indexOf(COSTAL_FALSE_NODES[d])!==-1) {matched=b;break;} if(matched)break; continue; }
            if (b.name === 'Hip Bone')   { if(node.name.indexOf('Hip_boner')!==-1){matched=b;break;} continue; }
            var key = BONE_TO_3D_MODEL[b.name];
            if (!key) continue;
            // __group__ prefix: key is pipe-separated list of mesh substrings
            if (key.indexOf('__group__') === 0) {
                var parts = key.slice(9).split('|');
                for (var p = 0; p < parts.length; p++) {
                    if (node.name.indexOf(parts[p]) !== -1) { matched = b; break; }
                }
                if (matched) break;
            } else {
                if (node.name.indexOf(key) !== -1) { matched = b; break; }
            }
        }
        if (matched) {
            var col = 0x5a8a6a, em = 0.55;
            if (matched.type === 'start')  { col = 0x5a8a6a; em = 0.6; }
            if (matched.type === 'end')    { col = 0xe8603c; em = 0.6; }
            if (matched.type === 'path')   { col = 0x5a8a6a; em = 0.5; }
            if (matched.type === 'detour') { col = 0xf0a500; em = 0.6; }
            if (matched.type === 'bad')    { col = 0xc94d2b; em = 0.75; }
            if (matched.type === 'reveal') { col = 0x8b5cf6; em = 0.7; }
            node.material = new THREE.MeshStandardMaterial({color:col, emissive:col, emissiveIntensity:em, transparent:false, opacity:1});
        } else {
            node.material = new THREE.MeshStandardMaterial({color:0x8B7355, transparent:true, opacity:0.25});
        }
    });
};

window.addEventListener('DOMContentLoaded', function() {
    var cont=document.getElementById('cv');
    var scene=new THREE.Scene();
    var cam=new THREE.PerspectiveCamera(45,cont.clientWidth/cont.clientHeight,0.1,1000);
    var renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
    renderer.setSize(cont.clientWidth,cont.clientHeight);
    cont.appendChild(renderer.domElement);

    var ctrl=new THREE.OrbitControls(cam,renderer.domElement);
    ctrl.enableDamping=true; ctrl.dampingFactor=0.05; ctrl.maxPolarAngle=Math.PI;
    ctrl.minDistance=1; ctrl.maxDistance=10; ctrl.enableZoom=false;

    renderer.domElement.addEventListener('wheel',function(e){
        e.preventDefault();
        var rect=renderer.domElement.getBoundingClientRect();
        var mouse=new THREE.Vector2(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1);
        var ray=new THREE.Raycaster(); ray.setFromCamera(mouse,cam);
        var t3d;
        if(_skeleton){var h=ray.intersectObjects([_skeleton],true);if(h.length)t3d=h[0].point.clone();}
        if(!t3d)t3d=ray.ray.at(cam.position.distanceTo(ctrl.target),new THREE.Vector3());
        var dir=new THREE.Vector3().subVectors(t3d,cam.position);
        var dist=cam.position.distanceTo(ctrl.target);
        var step=dir.length()*0.12;
        if(e.deltaY<0&&dist>ctrl.minDistance)cam.position.addScaledVector(dir.normalize(),step);
        else if(e.deltaY>0&&dist<ctrl.maxDistance)cam.position.addScaledVector(dir.normalize(),-step);
        ctrl.update();
    },{passive:false});

    scene.add(new THREE.AmbientLight(0xfff8f0,0.9));
    var dl=new THREE.DirectionalLight(0xfff4e8,0.7); dl.position.set(5,10,7.5); scene.add(dl);

    var draco=new THREE.DRACOLoader(); draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    var loader=new THREE.GLTFLoader(); loader.setDRACOLoader(draco);
    loader.load('../models/overview-skeleton.glb', function(gltf){
        _skeleton=gltf.scene; scene.add(_skeleton);
        var box=new THREE.Box3().setFromObject(_skeleton);
        var center=box.getCenter(new THREE.Vector3()); var size=box.getSize(new THREE.Vector3());
        ctrl.target.copy(center);
        var fov=cam.fov*(Math.PI/180); var maxDim=Math.max(size.x,size.y,size.z);
        cam.position.set(center.x,center.y,center.z+Math.abs(maxDim/2/Math.tan(fov/2))*1.5);
        cam.lookAt(center); ctrl.update();
        window.reset3D();
    });
    
    function animate(){ requestAnimationFrame(animate); ctrl.update(); renderer.render(scene,cam); } 
    animate();
    
    var ro=new ResizeObserver(function(){ 
        cam.aspect=cont.clientWidth/cont.clientHeight; 
        cam.updateProjectionMatrix(); 
        renderer.setSize(cont.clientWidth,cont.clientHeight); 
    }); 
    ro.observe(cont);
});
