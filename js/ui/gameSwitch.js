// ============================================================================
// ANATOMLE - the games list, per-game streaks and the "Games" switcher
// (styles in css/notebook.css, .gs-*). Plain script, no dependencies; the
// React helpers only touch React when they are called.
//
//   AnatomleGames.daily / .practice   the games, hrefs relative to games/
//   AnatomleGames.status(id)          { played, streak, best } for a daily
//   AnatomleGames.open(currentId)     the switcher overlay
//   AnatomleGames.navButton(id)       React: the "Games" button for a nav bar
//   AnatomleGames.nextUp(id)          React: "play the other daily" block
//
// Each daily keeps its own streak:
//   Osteomle daily  anatomle_streak_count / _last / _best   (js/core/streak.js)
//   Muscle Mini     anatomle_mini_streak  { count, last, best }
// ============================================================================
(function () {
    function today() { return new Date().toISOString().slice(0, 10); }
    function prevDay(s) { var d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() - 1); return d.toISOString().slice(0, 10); }
    function load(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (_) { return null; } }
    function raw(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }

    var daily = [
        { id: 'bones', name: 'Osteomle', sub: 'daily bone path', href: 'daily.html', tone: 'yellow',
          played: function (d) {
              var s = load('anatomle_daily_v2_' + d);
              return s && (s.phase === 'won' || s.phase === 'lost') ? s.phase : null;
          },
          streak: function () {
              return { count: parseInt(raw('anatomle_streak_count') || '0', 10) || 0,
                       last: raw('anatomle_streak_last'),
                       best: parseInt(raw('anatomle_streak_best') || '0', 10) || 0 };
          } },
        { id: 'mini', name: 'Muscle Mini', sub: 'daily crossword', href: 'muscle-mini.html', tone: 'blue',
          played: function (d) {
              var s = load('anatomle_mini_' + d);
              return s && s.done ? (s.gaveUp ? 'revealed' : 'won') : null;
          },
          streak: function () { return load('anatomle_mini_streak') || { count: 0, last: null, best: 0 }; } }
    ];
    var practice = [
        { id: 'osteo-practice', name: 'Osteomle practice', sub: 'unlimited bone paths', href: 'full-skeleton.html', tone: 'pink' },
        { id: 'cards', name: 'Flash cards', sub: 'bones, muscles or both', href: 'flashcards.html', tone: 'green' }
    ];

    function find(id) {
        return daily.concat(practice).filter(function (g) { return g.id === id; })[0] || null;
    }

    // A streak only counts while its last day is today or yesterday
    function status(id) {
        var g = find(id), d = today();
        if (!g || !g.played) return null;
        var s = g.streak();
        var alive = s.last === d || s.last === prevDay(d);
        return { played: g.played(d), streak: alive ? (s.count || 0) : 0, best: Math.max(s.best || 0, s.count || 0) };
    }

    function streakText(n) { return n > 0 ? '🔥 ' + n + ' day streak' : 'no streak yet'; }
    function playedText(p) { return p === 'won' ? 'done ✓' : p === 'revealed' ? 'revealed' : p ? 'played' : ''; }

    // ── the switcher overlay ────────────────────────────────────────────────
    var ICON = '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">' +
        '<rect x="2" y="2" width="7" height="7" rx="1.5" fill="currentColor"/><rect x="11" y="2" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/>' +
        '<rect x="2" y="11" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="11" y="11" width="7" height="7" rx="1.5" fill="currentColor"/></svg>';

    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

    function item(g, current, extra) {
        var here = g.id === current;
        return '<a class="gs-item tone-' + g.tone + (here ? ' here' : '') + '" href="' + esc(g.href) + '"' + (here ? ' aria-current="page"' : '') + '>' +
            '<span class="gs-name">' + esc(g.name) + '</span>' +
            '<span class="gs-sub">' + esc(g.sub) + (here ? ' · you are here' : '') + '</span>' +
            (extra ? '<span class="gs-meta">' + extra + '</span>' : '') +
            '</a>';
    }

    var openEl = null;
    function close() {
        if (!openEl) return;
        openEl.remove(); openEl = null;
        document.removeEventListener('keydown', onKey);
    }
    function onKey(ev) { if (ev.key === 'Escape') close(); }

    function open(current) {
        close();
        var html = '<div class="g-card gs-card" role="dialog" aria-modal="true" aria-label="Games">' +
            '<span class="tape"></span>' +
            '<button type="button" class="gs-x" aria-label="Close">✕</button>' +
            '<h2>Games</h2>' +
            '<div class="gs-h">today\'s dailies</div><div class="gs-list">' +
            daily.map(function (g) {
                var st = status(g.id), done = playedText(st.played);
                return item(g, current, esc(streakText(st.streak)) + (done ? ' · <b>' + esc(done) + '</b>' : ''));
            }).join('') +
            '</div><div class="gs-h">practice</div><div class="gs-list">' +
            practice.map(function (g) { return item(g, current, ''); }).join('') +
            '</div><a class="nb-btn wide dark gs-home" href="../index.html">← Home</a></div>';
        openEl = document.createElement('div');
        openEl.className = 'g-over gs-over';
        openEl.innerHTML = html;
        openEl.addEventListener('click', function (ev) {
            if (ev.target === openEl || ev.target.closest('.gs-x')) close();
            else if (ev.target.closest('.gs-item.here')) { ev.preventDefault(); close(); }
        });
        document.body.appendChild(openEl);
        document.addEventListener('keydown', onKey);
        var first = openEl.querySelector('.gs-item:not(.here)');
        if (first) first.focus();
    }

    // ── React helpers ───────────────────────────────────────────────────────
    function navButton(current) {
        var e = React.createElement;
        return e('button', { type: 'button', className: 'nb-btn games-btn', title: 'Switch game', 'aria-label': 'Games',
                             onClick: function () { open(current); } },
            e('span', { className: 'gs-ico', dangerouslySetInnerHTML: { __html: ICON } }),
            e('span', { className: 'lbl-long' }, 'Games'));
    }

    // Shown on a daily's end card: the other daily, then the rest of the games
    function nextUp(current) {
        var e = React.createElement, d = today();
        var others = daily.filter(function (g) { return g.id !== current; });
        var todo = others.filter(function (g) { return !g.played(d); });
        var g = todo[0];
        return e('div', { className: 'gs-next' },
            e('div', { className: 'gs-h' }, g ? 'fancy another?' : 'both dailies done today ✓'),
            g ? e('a', { className: 'gs-item tone-' + g.tone, href: g.href },
                    e('span', { className: 'gs-name' }, g.name + ' →'),
                    e('span', { className: 'gs-sub' }, 'today\'s ' + g.sub),
                    e('span', { className: 'gs-meta' }, streakText(status(g.id).streak)))
              : null,
            e('button', { type: 'button', className: 'nb-btn wide gs-more', onClick: function () { open(current); } },
                e('span', { className: 'gs-ico', dangerouslySetInnerHTML: { __html: ICON } }), g ? ' Other games' : ' Practice or switch game'));
    }

    window.AnatomleGames = {
        daily: daily, practice: practice, status: status, today: today,
        streakText: streakText, playedText: playedText,
        open: open, close: close, icon: ICON,
        navButton: navButton, nextUp: nextUp
    };

    // Static pages: any [data-games] button opens the switcher
    document.addEventListener('click', function (ev) {
        var b = ev.target.closest && ev.target.closest('[data-games]');
        if (b) { ev.preventDefault(); open(b.getAttribute('data-games')); }
    });
})();
