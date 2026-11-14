// ============================================================================
// ANATOMLE - 3D highlight colours and guess animations (shared by both engines)
// ----------------------------------------------------------------------------
// HL.apply(mesh, type)  colour a mesh for a game state. When the state changes
//                       the colour is "drawn in" from the bottom of the mesh up,
//                       like a highlighter stroke. Wrong guesses also shake.
// HL.tick()             call once per frame from the render loop. Returns true
//                       when something changed and the scene needs a redraw.
// HL.invalidate()       ask for a redraw on the next frame (camera moved, etc).
// HL.enable(renderer)   turn on the clipping the fill animation needs.
// HL.camera(opts)       smooth orbit / zoom / pan setup shared by both models.
// Colours follow the page theme (light / dark) and update on 'anatomle-theme'.
// ============================================================================
(function () {
    var PALETTES = {
        light: {
            ghost: 0x4E5A78, ghostOpacity: 0.62,
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

    // Materials are shared: one per theme and state, instead of a new one
    // for every mesh on every guess. Only the fill animation makes its own
    // (it needs per-mesh clipping planes) and frees them when it ends.
    var cache = {};

    function newGhost(opacityScale) {
        var p = pal();
        return new THREE.MeshStandardMaterial({
            color: p.ghost, roughness: 0.85, metalness: 0,
            transparent: true, opacity: p.ghostOpacity * (opacityScale || window.HL.ghostScale || 1), depthWrite: false
        });
    }

    function ghostMaterial(opacityScale) {
        var k = theme() + ':ghost:' + (opacityScale || window.HL.ghostScale || 1);
        return cache[k] || (cache[k] = newGhost(opacityScale));
    }

    function typeMaterial(type) {
        var p = pal(), c = p[type] !== undefined ? p[type] : p.path;
        var k = theme() + ':' + (p[type] !== undefined ? type : 'path');
        return cache[k] || (cache[k] = new THREE.MeshStandardMaterial({
            color: c, emissive: c, emissiveIntensity: p.emissive,
            roughness: 0.6, metalness: 0, transparent: false, opacity: 1
        }));
    }

    // The lit-up version used while the player hovers a row in the route list
    function hoverMaterial() {
        var k = theme() + ':hover';
        return cache[k] || (cache[k] = new THREE.MeshStandardMaterial({
            color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.4, roughness: 0.6, metalness: 0
        }));
    }

    var dirty = true;
    function invalidate() { dirty = true; }

    var anims = [];   // running fills and shakes

    function endFill(a) {
        if (a.overlay.parent) a.overlay.parent.remove(a.overlay);
        a.om.dispose();
        a.gm.dispose();
    }

    function stopAnims(mesh) {
        anims = anims.filter(function (a) {
            if (a.mesh !== mesh) return true;
            if (a.kind === 'fill') endFill(a);
            if (a.kind === 'shake') a.mesh.position.copy(a.home);
            return false;
        });
    }

    // Fill, like a progress bar: the mesh is split by a level that rises from
    // the bottom to the top. Below the level it has the new colour, above it
    // keeps the old grey, so the two never overlap.
    function fill(mesh, mat, duration, delay, ghostScale) {
        var box = new THREE.Box3().setFromObject(mesh);
        if (box.isEmpty()) { mesh.material = mat; return; }
        var below = new THREE.Plane(new THREE.Vector3(0, -1, 0), box.min.y);   // keeps y <= level
        var above = new THREE.Plane(new THREE.Vector3(0, 1, 0), -box.min.y);   // keeps y >= level
        var gm = newGhost(ghostScale);
        gm.clippingPlanes = [above];
        mesh.material = gm;
        var om = mat.clone();
        om.clippingPlanes = [below];
        om.emissiveIntensity = mat.emissiveIntensity + 0.25;   // the fresh ink glows a little
        var overlay = new THREE.Mesh(mesh.geometry, om);
        mesh.add(overlay);
        anims.push({ kind: 'fill', mesh: mesh, overlay: overlay, below: below, above: above, final: mat, om: om, gm: gm,
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

    // gentle start and finish, steady in the middle, like a loading bar
    function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

    function tick() {
        if (!anims.length) { var d = dirty; dirty = false; return d; }
        dirty = false;
        var now = performance.now();
        anims = anims.filter(function (a) {
            var t = (now - a.t0) / a.dur;
            if (t < 0) return true;
            if (a.kind === 'fill') {
                if (t >= 1) {
                    endFill(a);
                    a.mesh.material = a.final;
                    return false;
                }
                var lvl = a.y0 + (a.y1 - a.y0) * ease(t);
                a.below.constant = lvl;
                a.above.constant = -lvl;
                a.om.emissiveIntensity = a.final.emissiveIntensity + 0.25 * (1 - t);
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
        return true;
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
        dirty = true;

        if (!type) { mesh.material = ghostMaterial(opts.ghostScale); return true; }

        var m = typeMaterial(type);
        var animate = !reduceMotion && !opts.instant && was !== undefined && (was === 'ghost' || was === 'reveal');
        if (!animate) { mesh.material = m; return true; }

        var delay = (opts.order || 0) * 90;
        if (type === 'bad') { fill(mesh, m, 550, delay, opts.ghostScale); shake(mesh, delay + 520); }
        else fill(mesh, m, type === 'reveal' ? 800 : 1300, delay, opts.ghostScale);
        return true;
    }

    // A small "drawing the model… 40%" note over the 3D area while it loads
    function loadNote(cont) {
        var el = document.createElement('div');
        el.className = 'cv-load';
        el.setAttribute('role', 'status');
        el.textContent = 'drawing the model…';
        cont.appendChild(el);
        return {
            progress: function (ev) {
                if (ev && ev.lengthComputable && ev.total) el.textContent = 'drawing the model… ' + Math.round(ev.loaded / ev.total * 100) + '%';
            },
            done: function () { if (el.parentNode) el.parentNode.removeChild(el); },
            fail: function () { el.classList.add('err'); el.textContent = 'The 3D model didn’t load. Check your connection and refresh the page.'; }
        };
    }

    // ── Camera ──────────────────────────────────────────────────────────────
    // Turntable feel: dragging sideways spins the model, dragging up/down
    // tilts it only so far (never top-down), and it is slow enough to aim.
    // Right-drag moves it, but it can never be dragged out of view.
    // The mouse wheel zooms smoothly towards whatever is under the cursor
    // (trackpads and mouse wheels feel the same); pinch zooms on touch.
    // opts: { cam, ctrl, dom, pickables: fn -> meshes, onUser: fn }
    // Returns { step(), fly(toPos, toTarget, ms), cancel(), setRange(size) }.
    function camera(o) {
        var cam = o.cam, ctrl = o.ctrl, dom = o.dom;
        ctrl.enableDamping = true;
        ctrl.dampingFactor = 0.16;
        ctrl.rotateSpeed = 0.45;           // a drag the height of the view turns ~80°
        ctrl.panSpeed = 0.7;
        ctrl.zoomSpeed = 0.8;
        ctrl.enableZoom = true;            // pinch on touch; the wheel is handled below
        ctrl.screenSpacePanning = true;
        ctrl.minPolarAngle = Math.PI / 2 - 1.0;   // look down/up at most ~57°
        ctrl.maxPolarAngle = Math.PI / 2 + 1.0;
        var bounds = null;                 // the target may not leave the model
        dom.style.cursor = 'grab';
        dom.addEventListener('pointerdown', function () { dom.style.cursor = 'grabbing'; });
        window.addEventListener('pointerup', function () { dom.style.cursor = 'grab'; });
        dom.addEventListener('contextmenu', function (e) { e.preventDefault(); });

        // How to move it, until the player first does
        var hint = document.createElement('div');
        hint.className = 'cv-hint';
        hint.innerHTML = '<b>drag</b> to turn · <b>scroll</b> to zoom · <b>double-click</b> to jump to a spot';
        if (matchMedia('(pointer: coarse)').matches) hint.innerHTML = '<b>drag</b> to turn · <b>pinch</b> to zoom · <b>two fingers</b> to move';
        dom.parentNode.appendChild(hint);
        function used() { if (hint.parentNode) { hint.classList.add('gone'); setTimeout(function () { if (hint.parentNode) hint.parentNode.removeChild(hint); }, 400); } }

        var goal = null;                   // distance we are easing towards
        var pivot = new THREE.Vector3();   // point that stays put while zooming
        var ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
        var lastPick = 0, flight = null;

        function cancel() { flight = null; }
        ctrl.addEventListener('start', function () { cancel(); used(); if (o.onUser) o.onUser(); });

        // Capture on the parent, so OrbitControls' own (jumpy) wheel zoom never runs
        dom.parentNode.addEventListener('wheel', function (e) {
            if (e.target !== dom) return;
            e.preventDefault(); e.stopPropagation();
            cancel(); used(); if (o.onUser) o.onUser();
            var dy = e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 400 : 1);
            dy = Math.max(-120, Math.min(120, dy));
            var d = cam.position.distanceTo(ctrl.target);
            var from = goal === null ? d : goal;
            goal = Math.min(ctrl.maxDistance, Math.max(ctrl.minDistance, from * Math.exp(dy * 0.003)));
            if (dy > 0) { pivot.copy(ctrl.target); }            // zoom out from the middle
            else if (performance.now() - lastPick > 180) {      // zoom in towards the cursor
                lastPick = performance.now();
                var hit = pick(e);
                if (hit) pivot.copy(hit);
                else {
                    // nothing under the cursor: use the point at the model's depth,
                    // so the zoom doesn't slide sideways through a gap between bones
                    plane.setFromNormalAndCoplanarPoint(cam.getWorldDirection(tmp), ctrl.target);
                    if (!ray.ray.intersectPlane(plane, pivot)) pivot.copy(ctrl.target);
                }
            }
            dirty = true;
        }, { passive: false, capture: true });

        // The point on the model under the cursor. Thin bones are hard to hit
        // exactly, so if the cursor is just off one, look a few pixels around.
        var NEAR = [[0, 0], [6, 0], [-6, 0], [0, 6], [0, -6], [12, 0], [-12, 0], [0, 12], [0, -12], [9, 9], [-9, 9], [9, -9], [-9, -9]];
        function pick(e) {
            if (!o.pickables) return null;
            var r = dom.getBoundingClientRect(), list = o.pickables();
            for (var i = 0; i < NEAR.length; i++) {
                mouse.set(((e.clientX + NEAR[i][0] - r.left) / r.width) * 2 - 1, -((e.clientY + NEAR[i][1] - r.top) / r.height) * 2 + 1);
                ray.setFromCamera(mouse, cam);
                var hits = ray.intersectObjects(list, false);
                if (hits.length) return hits[0].point.clone();
            }
            mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
            ray.setFromCamera(mouse, cam);   // leave the centre ray for the fallback
            return null;
        }
        var plane = new THREE.Plane();

        // Double-click (or double-tap) a spot to glide right up to it
        dom.addEventListener('dblclick', function (e) {
            var hit = pick(e);
            if (!hit) return;
            used(); if (o.onUser) o.onUser();
            var dir = cam.position.clone().sub(ctrl.target).normalize();
            var dist = Math.max(ctrl.minDistance * 1.6, Math.min(cam.position.distanceTo(ctrl.target), size * 0.3));
            fly(hit.clone().add(dir.multiplyScalar(dist)), hit, 650);
        });

        function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
        var tmp = new THREE.Vector3();

        function keepInView() {
            if (!bounds || bounds.containsPoint(ctrl.target)) return;
            var d = bounds.clampPoint(ctrl.target, tmp).sub(ctrl.target).multiplyScalar(0.25);
            cam.position.add(d);
            ctrl.target.add(d);
            dirty = true;
        }

        function step() {
            keepInView();
            if (flight) {
                var t = Math.min((performance.now() - flight.t0) / flight.ms, 1), k = ease(t);
                cam.position.lerpVectors(flight.p0, flight.p1, k);
                ctrl.target.lerpVectors(flight.q0, flight.q1, k);
                if (t >= 1) flight = null;
                dirty = true;
                return;
            }
            if (goal === null) return;
            var d = cam.position.distanceTo(ctrl.target);
            var next = d + (goal - d) * 0.2;
            if (Math.abs(goal - next) < d * 0.002) { next = goal; }
            var s = next / d;
            cam.position.sub(pivot).multiplyScalar(s).add(pivot);
            ctrl.target.sub(pivot).multiplyScalar(s).add(pivot);
            if (next === goal) goal = null;
            dirty = true;
        }

        function fly(toPos, toTarget, ms) {
            goal = null;
            flight = { p0: cam.position.clone(), p1: toPos.clone(), q0: ctrl.target.clone(), q1: toTarget.clone(),
                       t0: performance.now(), ms: reduceMotion ? 1 : (ms || 900) };
            dirty = true;
        }

        // zoom limits that fit the model, and a near plane that never cuts it
        var size = 1;
        function setRange(sz, box) {
            size = sz;
            if (box) bounds = box.clone().expandByScalar(size * 0.05);
            ctrl.minDistance = sz * 0.08;
            ctrl.maxDistance = sz * 2.6;
            cam.near = sz * 0.004; cam.far = sz * 50;
            cam.updateProjectionMatrix();
        }

        return { step: step, fly: fly, cancel: cancel, setRange: setRange };
    }

    var renderers = [];
    function enable(renderer) { renderer.localClippingEnabled = true; renderers.push(renderer); }

    window.HL = {
        apply: apply, tick: tick, invalidate: invalidate, enable: enable, loadNote: loadNote, camera: camera,
        ghostMaterial: ghostMaterial, typeMaterial: typeMaterial, hoverMaterial: hoverMaterial,
        theme: theme, palette: pal,
        // for debugging in the console: what is animating right now
        active: function () { return anims.map(function (a) { return a.kind + ':' + (a.mesh.name || '') + ':' + (a.below ? (-a.above.constant).toFixed(3) : ''); }); }
    };
})();
