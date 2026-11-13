// ============================================================================
// ANATOMLE - Muscle Pathfinding Game (Myomle)
// ============================================================================
// Requires: React, UPPER_LIMB_MUSCLES (+ derived graph), gameLogic.js,
//           pathGame.js, replayIndex.js, upperLimbEngine.js, pathfindingUI.js
//
// Usage:
//   ReactDOM.createRoot(el).render(React.createElement(MuscleGame, {
//       graph: UPPER_LIMB_BONE_GRAPH, title: '…',
//       minPath: 4, maxPath: 8, bonus: 3, replayCode: 'ul', shareTitle: '…'
//   }));
//
// Rules and scoring are shared with the skeleton games (js/core/pathGame.js).
// The muscle game adds a one-off nerve hint that lights up the nerve
// supplying the target muscle for a few seconds.
// ============================================================================

(function () {
    function MuscleGame(props) {
        var graph = props.graph;
        var game = window.usePathGame({
            graph: graph,
            names: Object.keys(UPPER_LIMB_MUSCLES),
            bonus: props.bonus,
            newPuzzle: function () { return initializeGame(graph, { minLength: props.minPath, maxLength: props.maxPath }); },
            replayCode: props.replayCode,
            shareTitle: props.shareTitle
        });

        var _h = React.useState(false), hintUsed = _h[0], setHintUsed = _h[1];
        var hintTimer = React.useRef(null);
        var htp = window.useFirstVisit ? window.useFirstVisit('upper-limb') : [false, function () {}];

        // A new puzzle gets a fresh hint
        React.useEffect(function () {
            setHintUsed(false);
            clearTimeout(hintTimer.current);
        }, [game.puzzle && game.puzzle.start, game.puzzle && game.puzzle.end]);
        React.useEffect(function () { return function () { clearTimeout(hintTimer.current); }; }, []);

        function handleHint() {
            if (hintUsed || game.phase !== 'playing' || !game.puzzle) return;
            setHintUsed(true);
            if (window.showNerveHint) window.showNerveHint(game.puzzle.end);
            clearTimeout(hintTimer.current);
            hintTimer.current = setTimeout(function () {
                if (window.clearNerveHint) window.clearNerveHint();
            }, 4000);
        }

        var state = Object.assign({}, game.state, { hintUsed: hintUsed });
        var handlers = Object.assign({}, game.handlers, { onHint: handleHint });

        return React.createElement(React.Fragment, null,
            window.HowToModal ? React.createElement(window.HowToModal, { show: htp[0], onClose: htp[1] }) : null,
            React.createElement(window.PathfindingUI, {
                gameTitle: props.title, state: state, handlers: handlers
            })
        );
    }

    window.MuscleGame = MuscleGame;
})();
