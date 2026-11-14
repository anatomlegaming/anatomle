// ============================================================================
// ANATOMLE - Flash cards (games/flashcards.html)
// ----------------------------------------------------------------------------
// One part lights up pink on the 3D model and the camera glides to it. Type
// its name. Hints reveal letters one at a time. A miss (or "Show answer")
// sends the card back a few places so it comes up again soon. Cards you get
// right without help count as learned, remembered in localStorage.
// Plain JS (no React). Needs: hlFx.js, an engine, and the deck's data files.
// ============================================================================
(function () {
    var deck = window.DECK;                       // 'bones' | 'muscles' | 'mixed'
    var KEY = 'anatomle_fc_' + deck;

    // ── The deck ──────────────────────────────────────────────────────────────
    // The mixed deck runs on the arm model: its muscles plus the upper limb
    // bones, which the engine shows only while one is the card.
    var ARM_BONES = {
        'Clavicle': ['Clavicle.r'], 'Scapula': ['Scapula.r.'], 'Humerus': ['Humerus.r'],
        'Radius': ['Radius.r'], 'Ulna': ['Ulna.r'],
        'Scaphoid': ['Scaphoid.r'], 'Lunate': ['Lunate bone.r'], 'Triquetrum': ['Triquetrum.r'], 'Pisiform': ['Pisiform.r'],
        'Trapezium': ['Trapezium.r'], 'Trapezoid': ['Trapezoid.r'], 'Capitate': ['Capitate.r'], 'Hamate': ['Hamate.r'],
        'Metacarpal I': ['1st metacarpal bone.r'], 'Metacarpal II': ['2nd metacarpal bone.r'], 'Metacarpal III': ['3rd metacarpal bone.r'],
        'Metacarpal IV': ['4th metacarpal bone.r'], 'Metacarpal V': ['5th metacarpal bone.r'],
        'Proximal Phalanx (Hand)': ['Proximal phalanx of 1st finger.r', 'Proximal phalanx of 2d finger.r', 'Proximal phalanx of 3rd finger.r', 'Proximal phalanx of 4th finger.r', 'Proximal phalanx of 5th finger.r'],
        'Middle Phalanx (Hand)': ['Middle phalanx of 2d finger.r', 'Middle phalanx of 3rd finger.r', 'Middle phalanx of 4th finger.r', 'Middle phalanx of 5th finger.r'],
        'Distal Phalanx (Hand)': ['Distal phalanx of 1st finger.r', 'Distal phalanx of 2d finger.r', 'Distal phalanx of 3d finger.r', 'Distal phalanx of 4th finger.r', 'Distal phalanx of 5th finger.r']
    };
    if (deck === 'mixed') window.UL_EXTRA_PARTS = ARM_BONES;

    var muscleNames = deck === 'bones' ? [] :
        Object.keys(UPPER_LIMB_MUSCLES).filter(function (n) { return (UPPER_LIMB_MUSCLES[n].meshes || []).length; });
    var boneNames = deck === 'bones' ? Object.keys(SKELETON_GRAPH) : deck === 'mixed' ? Object.keys(ARM_BONES) : [];
    var names = boneNames.concat(muscleNames);
    function isBone(name) { return boneNames.indexOf(name) !== -1; }
    function thingOf(name) { return isBone(name) ? 'bone' : 'muscle'; }

    function fact(name) {
        if (!isBone(name)) {
            var m = UPPER_LIMB_MUSCLES[name];
            return m.supply ? 'Nerve supply: ' + m.supply + '.' : '';
        }
        var d = (window.BONE_DESCRIPTIONS && BONE_DESCRIPTIONS[name]) || '';
        // keep it to a sentence or two
        var cut = d.split(/(?<=\.)\s+/).reduce(function (acc, s) { return acc.length < 120 ? acc + (acc ? ' ' : '') + s : acc; }, '');
        return cut;
    }
    function links(name) {
        var bone = isBone(name);
        var all = (bone ? SKELETON_GRAPH[name] : UPPER_LIMB_BONE_GRAPH[name]) || [];
        var n = all.slice(0, 5);
        if (!n.length) return '';
        return (bone ? 'Joins: ' : 'Shares a bone with: ') + n.join(', ') + (all.length > 5 ? '…' : '');
    }

    var learned = {};
    try { learned = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) {}
    function saveLearned() { try { localStorage.setItem(KEY, JSON.stringify(learned)); } catch (e) {} }

    function shuffle(a) {
        for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
        return a;
    }
    // Unlearned cards first, then the rest
    var queue = shuffle(names.filter(function (n) { return !learned[n]; }))
        .concat(shuffle(names.filter(function (n) { return learned[n]; })));

    // ── Elements ──────────────────────────────────────────────────────────────
    function $(id) { return document.getElementById(id); }
    var input = $('fc-input'), drop = $('fc-drop'), field = $('fc-field');
    var front = $('fc-front'), back = $('fc-back'), mask = $('fc-mask');
    var hintBtn = $('fc-hint'), showBtn = $('fc-show'), nextBtn = $('fc-next');

    input.placeholder = deck === 'mixed' ? 'Type a bone or muscle…' : 'Type a ' + (deck === 'bones' ? 'bone' : 'muscle') + '…';
    document.querySelectorAll('.fc-deck').forEach(function (a) {
        if (a.getAttribute('data-deck') === deck) { a.classList.add('on'); a.setAttribute('aria-current', 'true'); }
    });

    var card = null, hints = 0, done = false, right = 0, streak = 0, sel = -1, sugs = [];

    function score() {
        $('fc-score').innerHTML = '<b>' + right + '</b> right' + (streak > 1 ? ' · ' + streak + ' in a row' : '');
        var n = names.filter(function (x) { return learned[x]; }).length;
        $('fc-learned').textContent = n + ' of ' + names.length + ' learned';
    }

    // "C _ _ _ _ _ _ e" with the first `hints` letters shown
    function masked(name, shown) {
        var k = 0;
        return name.split('').map(function (ch) {
            if (ch === ' ' || ch === '(' || ch === ')' || ch === '-') return ch === ' ' ? '  ' : ch;
            k++;
            return k <= shown ? ch : '_';
        }).join(' ');
    }

    function show3D(type) {
        try { window.update3D && window.update3D([{ name: card, type: type }]); } catch (e) {}
    }

    function next() {
        card = queue.shift();
        hints = 0; done = false;
        front.hidden = false; back.hidden = true;
        mask.textContent = masked(card, 0);
        $('fc-q').textContent = 'Which ' + thingOf(card) + ' is this?';
        hintBtn.hidden = false; showBtn.hidden = false; nextBtn.hidden = true;
        hintBtn.disabled = false;
        input.disabled = false; input.value = ''; closeDrop(); input.focus();
        field.classList.remove('err');
        show3D('end');
        if (window.focusPart) window.focusPart(card);
    }

    var doneAt = 0;
    function finish(correct, gaveUp) {
        done = true; doneAt = performance.now();
        var clean = correct && hints === 0;
        if (correct) { right++; streak++; } else { streak = 0; }
        if (clean) { learned[card] = 1; saveLearned(); }
        else {
            if (learned[card]) { delete learned[card]; saveLearned(); }
            queue.splice(Math.min(3, queue.length), 0, card);   // see it again soon
        }
        show3D(correct ? 'path' : 'bad');
        $('fc-verdict').textContent = correct ? (clean ? '✓ Right!' : '✓ Right, with a hint') : gaveUp ? 'The answer is' : '✗ Not quite. It’s';
        $('fc-verdict').className = 'fc-verdict ' + (correct ? 'ok' : 'bad');
        $('fc-name').textContent = card;
        $('fc-fact').textContent = fact(card);
        $('fc-links').textContent = links(card);
        front.hidden = true; back.hidden = false;
        hintBtn.hidden = true; showBtn.hidden = true; nextBtn.hidden = false;
        input.disabled = true; input.value = ''; closeDrop(); field.classList.remove('err');
        nextBtn.focus();
        score();
    }

    function guess(name) {
        if (done || !name) return;
        finish(name.toLowerCase() === card.toLowerCase(), false);
    }

    // ── Suggestions dropdown (same look as the main games) ────────────────────
    function closeDrop() { drop.hidden = true; drop.innerHTML = ''; sugs = []; sel = -1; }
    function openDrop() {
        var q = input.value.trim().toLowerCase();
        if (!q) { closeDrop(); field.classList.remove('err'); return; }
        sugs = names.filter(function (n) { return n.toLowerCase().indexOf(q) !== -1; });
        sugs.sort(function (x, y) {
            function r(s) { s = s.toLowerCase(); return s === q ? 0 : s.indexOf(q) === 0 ? 1 : 2; }
            return r(x) - r(y);
        });
        sugs = sugs.slice(0, 8);
        field.classList.toggle('err', !sugs.length);
        drop.innerHTML = '';
        sugs.forEach(function (n, i) {
            var d = document.createElement('div');
            d.className = 'g-sug' + (i === sel ? ' sel' : '');
            d.setAttribute('role', 'option');
            d.textContent = n;
            d.addEventListener('mousedown', function (ev) { ev.preventDefault(); });
            d.addEventListener('click', function () { guess(n); });
            drop.appendChild(d);
        });
        drop.hidden = !sugs.length;
    }

    input.addEventListener('input', function () { sel = -1; openDrop(); });
    input.addEventListener('keydown', function (ev) {
        if (ev.key === 'ArrowDown') { ev.preventDefault(); sel = Math.min(sel + 1, sugs.length - 1); openDrop(); }
        else if (ev.key === 'ArrowUp') { ev.preventDefault(); sel = Math.max(sel - 1, 0); openDrop(); }
        else if (ev.key === 'Escape') { input.value = ''; closeDrop(); }
        else if (ev.key === 'Enter') {
            var q = input.value.trim().toLowerCase();
            var exact = sugs.filter(function (n) { return n.toLowerCase() === q; })[0];
            if (sel >= 0 && sugs[sel]) guess(sugs[sel]);
            else if (exact) guess(exact);
            else if (sugs.length === 1) guess(sugs[0]);
        }
    });
    input.addEventListener('blur', function () { setTimeout(closeDrop, 150); });

    hintBtn.addEventListener('click', function () {
        if (done) return;
        hints++;
        mask.textContent = masked(card, hints);
        var letters = card.replace(/[^A-Za-z0-9]/g, '').length;
        if (hints >= letters) finish(false, true);
        input.focus();
    });
    showBtn.addEventListener('click', function () { if (!done) finish(false, true); });
    // the Enter that answered a card must not also skip to the next one
    function goNext() { if (done && performance.now() - doneAt > 350) next(); }
    nextBtn.addEventListener('click', goNext);
    document.addEventListener('keydown', function (ev) {
        if (done && ev.key === 'Enter' && document.activeElement !== nextBtn) { ev.preventDefault(); goNext(); }
    });

    document.querySelectorAll('.theme-toggle').forEach(function (b) { AnatomleTheme.label(b); });
    score();
    function start() { next(); }
    if (window.__modelIsReady) start();
    else window.addEventListener('modelReady', function once() { window.removeEventListener('modelReady', once); setTimeout(start, 200); });
})();
