// ============================================================================
// ANATOMLE - 3D highlight colours and guess animations (shared by both engines)
// ----------------------------------------------------------------------------
// HL.apply(mesh, type)  colour a mesh for a game state. When the state changes
//                       the colour is "drawn in" from the bottom of the mesh up,
//                       like a highlighter stroke. Wrong guesses also shake.
// HL.tick()             call once per frame from the render loop.
// HL.enable(renderer)   turn on the clipping the fill animation needs.
// Colours follow the page theme (light / dark) and update on 'anatomle-theme'.
// ============================================================================
(function () {
    var PALETTES = {
        light: {
            ghost: 0x7C87A3, ghostOpacity: 0.5,
            start: 0x23935A, path: 0x45B873, end: 0xD9549A,
            detour: 0xE2AE2A, bad: 0xD6455A, reveal: 0x8566D9,
            emissive: 0.12
        },
        dark: {
            ghost: 0x8792AE, ghostOpacity: 0.34,
            start: 0x3DBA75, path: 0x5ACB88, end: 0xE36AA8,
            detour: 0xE8BC45, bad: 0xE05A6C, reveal: 0x9C82E6,
            emissive: 0.18
        }
    };

    function theme() {
        return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }
    function pal() { return PALETTES[theme()]; }

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function ghostMaterial(opacityScale) {
        var p = pal();
        return new THREE.MeshStandardMaterial({
            color: p.ghost, roughness: 0.85, metalness: 0,
            transparent: true, opacity: p.ghostOpacity * (opacityScale || window.HL.ghostScale || 1), depthWrite: false
        });
    }

    function typeMaterial(type) {
        var p = pal(), c = p[type] !== undefined ? p[type] : p.path;
        return new THREE.MeshStandardMaterial({
            color: c, emissive: c, emissiveIntensity: p.emissive,
            roughness: 0.6, metalness: 0, transparent: false, opacity: 1
        });
    }

    var anims = [];   // running fills and shakes

    function stopAnims(mesh) {
        anims = anims.filter(function (a) {
            if (a.mesh !== mesh) return true;
            if (a.overlay && a.overlay.parent) a.overlay.parent.remove(a.overlay);
            if (a.kind === 'shake') a.mesh.position.copy(a.home);
            return false;
        });
    }

    // Fill: an overlay copy of the mesh with the new colour, clipped by a plane
    // that sweeps from the bottom of the mesh to the top.
    function fill(mesh, mat, duration, delay) {
        var box = new THREE.Box3().setFromObject(mesh);
        if (box.isEmpty()) { mesh.material = mat; return; }
        var plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), box.min.y);
        var om = mat.clone();
        om.clippingPlanes = [plane];
        om.polygonOffset = true; om.polygonOffsetFactor = -2; om.polygonOffsetUnits = -2;
        var overlay = new THREE.Mesh(mesh.geometry, om);
        overlay.renderOrder = 2;
        mesh.add(overlay);
        anims.push({ kind: 'fill', mesh: mesh, overlay: overlay, plane: plane, final: mat,
                     y0: box.min.y, y1: box.max.y, t0: performance.now() + (delay || 0), dur: duration });
    }

    function shake(mesh, delay) {
        var box = new THREE.Box3().setFromObject(mesh);
        var size = box.getSize(new THREE.Vector3());
        var ws = new THREE.Vector3(1, 1, 1);
        if (mesh.parent) mesh.parent.getWorldScale(ws);
        var amp = Math.max(size.x, size.y, size.z) * 0.06 / (ws.x || 1);
        anims.push({ kind: 'shake', mesh: mesh, home: mesh.position.clone(), amp: amp,
                     t0: performance.now() + (delay || 0), dur: 520 });
    }

    function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

    function tick() {
        if (!anims.length) return;
        var now = performance.now();
        anims = anims.filter(function (a) {
            var t = (now - a.t0) / a.dur;
            if (t < 0) return true;
            if (a.kind === 'fill') {
                if (t >= 1) {
                    if (a.overlay.parent) a.overlay.parent.remove(a.overlay);
                    a.mesh.material = a.final;
                    return false;
                }
                a.plane.constant = a.y0 + (a.y1 - a.y0) * ease(t) + 1e-4;
                return true;
            }
            if (a.kind === 'shake') {
                if (t >= 1) { a.mesh.position.copy(a.home); return false; }
                var off = Math.sin(t * Math.PI * 7) * a.amp * (1 - t);
                a.mesh.position.set(a.home.x + off, a.home.y, a.home.z);
                return true;
            }
            return false;
        });
    }

    // type: null (ghost) or start / end / path / detour / bad / reveal.
    // order: position among the meshes changed in this update, used to
    // stagger several fills a little.
    function apply(mesh, type, opts) {
        opts = opts || {};
        var key = type || 'ghost';
        if (mesh._hlType === key && !opts.force) return false;
        var was = mesh._hlType;
        mesh._hlType = key;
        stopAnims(mesh);

        if (!type) { mesh.material = ghostMaterial(opts.ghostScale); return true; }

        var m = typeMaterial(type);
        var animate = !reduceMotion && !opts.instant && was !== undefined && (was === 'ghost' || was === 'reveal');
        if (!animate) { mesh.material = m; return true; }

        // the base stays a ghost while the colour is drawn in over it
        if (was !== 'ghost') mesh.material = ghostMaterial(opts.ghostScale);
        var delay = (opts.order || 0) * 90;
        if (type === 'bad') { fill(mesh, m, 380, delay); shake(mesh, delay + 300); }
        else fill(mesh, m, type === 'reveal' ? 600 : 850, delay);
        return true;
    }

    var renderers = [];
    function enable(renderer) { renderer.localClippingEnabled = true; renderers.push(renderer); }

    window.HL = {
        apply: apply, tick: tick, enable: enable, shake: shake,
        ghostMaterial: ghostMaterial, typeMaterial: typeMaterial,
        theme: theme, palette: pal
    };
})();
