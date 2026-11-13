// ============================================================================
// ANATOMLE - light / dark theme
// Load in <head> so the page never flashes the wrong colours.
// Saves the choice in localStorage; first visit follows the device setting.
// Fires 'anatomle-theme' on window when it changes (the 3D engines listen).
// Pages without their own toggle get a small round button in the top corner.
// ============================================================================
(function () {
    var KEY = 'anatomle_theme';
    var root = document.documentElement;

    function saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
    function initial() {
        var s = saved();
        if (s === 'dark' || s === 'light') return s;
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    function get() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
    function set(t) {
        root.setAttribute('data-theme', t);
        try { localStorage.setItem(KEY, t); } catch (e) {}
        document.querySelectorAll('.theme-toggle').forEach(label);
        window.dispatchEvent(new CustomEvent('anatomle-theme', { detail: t }));
    }
    function toggle() { set(get() === 'dark' ? 'light' : 'dark'); }
    function label(btn) {
        var dark = get() === 'dark';
        btn.textContent = dark ? '☀' : '☾';
        btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
        btn.title = dark ? 'Light mode' : 'Dark mode';
    }

    root.setAttribute('data-theme', initial());

    window.AnatomleTheme = { get: get, set: set, toggle: toggle, label: label };

    document.addEventListener('DOMContentLoaded', function () {
        if (document.body.classList.contains('game') || document.querySelector('[data-own-theme-toggle]')) return;
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'nb-btn theme-toggle theme-fab';
        b.onclick = toggle;
        label(b);
        document.body.appendChild(b);
    });
})();
