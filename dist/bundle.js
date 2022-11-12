var hpkitLib;
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 932:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Constants = void 0;
class Constants {
}
exports.Constants = Constants;
Constants.CANVAS_WIDTH = 780;
Constants.CANVAS_HEIGHT = 780;
Constants.GRID_SIZE = 39;
Constants.TILE_SIZE = 16;
Constants.INPUT = {
    None: -1,
    Keys: {
        A: 65,
        B: 66,
        C: 67,
        D: 68,
        E: 69,
        F: 70,
        G: 71,
        H: 72,
        I: 73,
        J: 74,
        K: 75,
        L: 76,
        M: 77,
        N: 78,
        O: 79,
        P: 80,
        Q: 81,
        R: 82,
        S: 83,
        T: 84,
        U: 85,
        V: 86,
        W: 87,
        X: 88,
        Y: 89,
        Z: 90,
        Tab: 9,
        Alt: 18,
        Numpad0: 96,
        Numpad1: 97,
        Numpad2: 98,
        Numpad3: 99,
        Numpad4: 100,
        Numpad5: 101,
        Numpad6: 102,
        Numpad7: 103,
        Numpad8: 104,
        Numpad9: 105,
        NumpadMultiply: 106,
        NumpadAdd: 107,
        Numrow0: 48,
        Numrow1: 49,
        Numrow2: 50,
        Numrow3: 51,
        Numrow4: 52,
        Numrow5: 53,
        Numrow6: 54,
        Numrow7: 55,
        Numrow8: 56,
        Numrow9: 57,
        Escape: 27,
        Space: 32
    },
    Mouse: {
        Left: 1000,
        Middle: 1001,
        Right: 1002
    }
};
// positional offsets for the 8 principal directions, starting at N (up) and proceeding clockwise
Constants.DIRECTIONS = [
    { x: 0, y: -1 },
    { x: 1, y: -1 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
    { x: -1, y: 1 },
    { x: -1, y: 0 },
    { x: -1, y: -1 },
];
Constants.CARDINAL_DIRECTIONS = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
];


/***/ }),

/***/ 591:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HPKitDemo = void 0;
const h_pkit_1 = __webpack_require__(80);
const model_1 = __webpack_require__(328);
const renderer_1 = __webpack_require__(657);
const constants_1 = __webpack_require__(932);
const input_manager_1 = __webpack_require__(728);
class HPKitDemo {
    constructor() {
        this.inputManager = new input_manager_1.InputManager();
        this.model = new model_1.Model();
        this.timeArray = new Array();
        this.state = BuildState.IDLE;
        this.formState = FormState.OPEN;
        this.chkboxDiagonals = document.getElementById('chkAllowDiagonals');
        this.chkboxStraightLine = document.getElementById('chkStraightLine');
        this.chkboxStringPull = document.getElementById('chkStringPull');
        this.dropdownHeuristic = document.getElementById('ddHeuristic');
        this.inputMoveCostCardinal = document.getElementById('iMoveCostCardinal');
        this.inputMoveCostDiagonal = document.getElementById('iMoveCostDiagonal');
        this.smoothingTypes = ['dual', 'skip', 'noskip'];
        this.smoothingTypeIndex = 0;
        this.init();
    }
    init() {
        HPKitDemo.hpkit = new h_pkit_1.HPKit();
        this.renderer = new renderer_1.Renderer(this.model);
        // Build cell grid from templates and attach listeners to cells as we go
        for (var i = constants_1.Constants.GRID_SIZE - 1; i !== -1; --i) {
            let htmlStr = `<div class="row" id="row-${i}">`;
            HPKitDemo.elFromId("fcanv").insertAdjacentHTML(`afterbegin`, htmlStr);
            for (var j = constants_1.Constants.GRID_SIZE - 1; j !== -1; --j) {
                htmlStr = `<div class="cell" id="${j}-${i}"><div class="inner-cell" id="i-${j}-${i}"></div></div>`;
                HPKitDemo.elFromId(`row-${i}`).insertAdjacentHTML(`afterbegin`, htmlStr);
                HPKitDemo.elFromId(`${j}-${i}`).addEventListener("mouseup", (e) => {
                    this.state = BuildState.IDLE;
                });
                HPKitDemo.elFromId(`${j}-${i}`).addEventListener("mousedown", (e) => {
                    const el = HPKitDemo.elFromEvent(e);
                    const pos = HPKitDemo.posFromEl(el);
                    if (e.button === 1) {
                        this.state = this.model.grid[pos[0]][pos[1]] ? BuildState.REMOVING : BuildState.ADDING;
                        this.modify(el);
                    }
                    else if (e.button === 0) {
                        this.model.origin = { x: Number(pos[0]), y: Number(pos[1]) };
                    }
                    else if (e.button === 2) {
                        this.model.goal = { x: Number(pos[0]), y: Number(pos[1]) };
                    }
                });
                HPKitDemo.elFromId(`${j}-${i}`).addEventListener("mouseover", (e) => {
                    const el = HPKitDemo.elFromEvent(e);
                    const pos = HPKitDemo.posFromEl(el);
                    if (e.buttons === 1) {
                        this.model.origin = { x: Number(pos[0]), y: Number(pos[1]) };
                    }
                    else if (e.buttons === 2) {
                        this.model.goal = { x: Number(pos[0]), y: Number(pos[1]) };
                    }
                    else if (e.buttons === 4) {
                        this.modify(el);
                    }
                });
            }
        }
        document.getElementById('ddHeuristic').addEventListener('change', (e) => {
            const nh = e.target.value;
            HPKitDemo.hpkit.setHeuristic(nh);
        });
        this.chkboxDiagonals.addEventListener('change', (e) => {
            // If we've disallowed diagonal movement, we must necessarily disable
            // straight line preference and string pulling. We need to finesse the
            // order of operations here as `h-pkit` will helpfully throw an error if
            // you select mutually exclusive options.
            if (!this.chkboxDiagonals.checked) {
                this.chkboxStraightLine.disabled = true;
                this.chkboxStringPull.disabled = true;
                HPKitDemo.hpkit.preferStraightLinePath(false);
                HPKitDemo.hpkit.applyStringPulling(false);
                HPKitDemo.hpkit.allowDiagonals(false);
            }
            else {
                HPKitDemo.hpkit.allowDiagonals(true);
                this.chkboxStraightLine.disabled = false;
                this.chkboxStringPull.disabled = false;
                HPKitDemo.hpkit.preferStraightLinePath(this.chkboxStraightLine.checked);
                HPKitDemo.hpkit.applyStringPulling(this.chkboxStringPull.checked);
            }
        });
        this.chkboxStraightLine.addEventListener('change', (e) => {
            HPKitDemo.hpkit.preferStraightLinePath(this.chkboxStraightLine.checked);
        });
        this.chkboxStringPull.addEventListener('change', (e) => {
            HPKitDemo.hpkit.applyStringPulling(this.chkboxStringPull.checked);
        });
        this.inputMoveCostCardinal.addEventListener('input', (e) => {
            this.applyNewMoveCosts();
        });
        this.inputMoveCostDiagonal.addEventListener('input', (e) => {
            this.applyNewMoveCosts();
        });
        this.renderLoop();
    }
    toggleFormVisibility() {
        if (this.formState === FormState.OPEN) {
            HPKitDemo.elFromId('formInner').style.display = 'none';
            HPKitDemo.elFromId('btnToggleVis').innerText = '►';
            this.formState = FormState.CLOSED;
        }
        else if (this.formState === FormState.CLOSED) {
            HPKitDemo.elFromId('formInner').style.display = 'block';
            HPKitDemo.elFromId('btnToggleVis').innerText = '◄';
            this.formState = FormState.OPEN;
        }
    }
    modify(el) {
        let pos = HPKitDemo.posFromEl(el);
        this.model.grid[pos[0]][pos[1]] = (this.state === BuildState.ADDING) ? true : false;
    }
    applyNewMoveCosts() {
        const mc = Number(this.inputMoveCostCardinal.value);
        const md = Number(this.inputMoveCostDiagonal.value);
        HPKitDemo.hpkit.setMoveCosts(mc, md);
    }
    renderLoop() {
        let dt = performance.now();
        this.model.findPath();
        dt = performance.now() - dt;
        this.handleInput();
        this.renderer.renderModel();
        this.timeArray.push(dt);
        if (this.timeArray.length > 60) {
            this.timeArray.shift();
        }
        let avgDt = this.timeArray.reduce((partial, e) => partial + e, 0) / 60;
        this.inputManager.clearInput();
        this.awaitNextFrame();
    }
    awaitNextFrame() {
        window.requestAnimationFrame(() => {
            this.renderLoop();
        });
    }
    randomise() {
        this.model.randomise();
    }
    reset() {
        this.model.setup();
        if (this.chkboxStraightLine.checked)
            this.chkboxStraightLine.click();
        if (this.chkboxStringPull.checked)
            this.chkboxStringPull.click();
        if (!this.chkboxDiagonals.checked)
            this.chkboxDiagonals.click();
        this.dropdownHeuristic.selectedIndex = 0;
        HPKitDemo.hpkit.setHeuristic(this.dropdownHeuristic.value);
        this.inputMoveCostDiagonal.value = 1.41;
        this.inputMoveCostCardinal.value = 1;
        this.applyNewMoveCosts();
    }
    clear() {
        this.model.clear();
    }
    handleInput() {
        switch (this.inputManager.KP) {
            case constants_1.Constants.INPUT.Keys.D:
                this.chkboxDiagonals.click();
                break;
            case constants_1.Constants.INPUT.Keys.S:
                this.chkboxStraightLine.click();
                break;
            case constants_1.Constants.INPUT.Keys.P:
                this.chkboxStringPull.click();
                break;
            // case Constants.INPUT.Keys.K: {
            //   this.smoothingTypeIndex = ((this.smoothingTypeIndex + 1) % this.smoothingTypes.length);
            //   HPD.hpkit.setSmoothingType(this.smoothingTypes[this.smoothingTypeIndex]);
            //   console.log(`smoothing type set to ${this.smoothingTypes[this.smoothingTypeIndex]}`)
            //   break;
            // }
            case constants_1.Constants.INPUT.Keys.H: {
                this.dropdownHeuristic.selectedIndex++;
                if (this.dropdownHeuristic.selectedIndex === -1)
                    this.dropdownHeuristic.selectedIndex = 0;
                HPKitDemo.hpkit.setHeuristic(this.dropdownHeuristic.value);
                break;
            }
        }
        this.inputManager.clearInput();
    }
}
exports.HPKitDemo = HPKitDemo;
HPKitDemo.elFromId = (str) => document.getElementById(str);
HPKitDemo.elFromEvent = (e) => HPKitDemo.elFromId(e.currentTarget.id);
HPKitDemo.posFromEl = (el) => el.id.split('-');
var BuildState;
(function (BuildState) {
    BuildState[BuildState["IDLE"] = 0] = "IDLE";
    BuildState[BuildState["ADDING"] = 1] = "ADDING";
    BuildState[BuildState["REMOVING"] = 2] = "REMOVING";
})(BuildState || (BuildState = {}));
var FormState;
(function (FormState) {
    FormState[FormState["OPEN"] = 0] = "OPEN";
    FormState[FormState["CLOSED"] = 1] = "CLOSED";
})(FormState || (FormState = {}));


/***/ }),

/***/ 728:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InputManager = void 0;
const constants_1 = __webpack_require__(932);
class InputManager {
    constructor() {
        this.KB = {};
        this.KP = constants_1.Constants.INPUT.None;
        this.attachListeners();
    }
    attachListeners() {
        window.onkeydown = e => {
            if (e.keyCode === constants_1.Constants.INPUT.Keys.Alt) {
                e.preventDefault();
            }
            this.KB[e.keyCode] = true;
            this.KP = e.keyCode;
        };
        window.onkeyup = e => {
            this.KB[e.keyCode] = false;
        };
        document.addEventListener("contextmenu", e => { e.preventDefault(); }, false);
    }
    clearInput() {
        this.KP = constants_1.Constants.INPUT.None;
    }
}
exports.InputManager = InputManager;


/***/ }),

/***/ 328:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Model = void 0;
const _1 = __webpack_require__(591);
const constants_1 = __webpack_require__(932);
class Model {
    constructor() {
        this.setup();
    }
    setup() {
        this.grid = new Array();
        for (let i = 0; i != constants_1.Constants.GRID_SIZE; ++i) {
            this.grid.push(new Array());
            for (let j = 0; j != constants_1.Constants.GRID_SIZE; ++j) {
                this.grid[i].push(false);
            }
        }
        for (var i = 0; i != 11; ++i) {
            this.grid[14 + i][19] = true;
            this.grid[12][14 + i] = true;
            this.grid[13][14 + i] = true;
            this.grid[25][14 + i] = true;
            this.grid[26][14 + i] = true;
        }
        for (var i = 0; i != 12; ++i) {
            this.grid[27 + i][14] = true;
            this.grid[11 - i][24] = true;
        }
        this.grid[19][19] = false;
        this.origin = { x: 10, y: 14 };
        this.goal = { x: 28, y: 24 };
    }
    clear() {
        for (let i = 0; i != constants_1.Constants.GRID_SIZE; ++i) {
            for (let j = 0; j != constants_1.Constants.GRID_SIZE; ++j) {
                this.grid[i][j] = false;
            }
        }
    }
    newRandomPosition() {
        return {
            x: Math.floor(Math.random() * constants_1.Constants.GRID_SIZE),
            y: Math.floor(Math.random() * constants_1.Constants.GRID_SIZE)
        };
    }
    randomise() {
        for (let i = 0; i != constants_1.Constants.GRID_SIZE; ++i) {
            for (let j = 0; j != constants_1.Constants.GRID_SIZE; ++j) {
                this.grid[i][j] = (Math.random() < 0.25);
            }
        }
        this.origin = this.newRandomPosition();
        this.goal = this.newRandomPosition();
        while (this.grid[this.origin.x][this.origin.y]) {
            this.origin = this.newRandomPosition();
        }
        while (this.grid[this.goal.x][this.goal.y]) {
            this.goal = this.newRandomPosition();
        }
    }
    findPath() {
        this.path = _1.HPKitDemo.hpkit.getPath(this.origin.x, this.origin.y, this.goal.x, this.goal.y, (x, y) => x >= 0 &&
            x < constants_1.Constants.GRID_SIZE &&
            y >= 0 &&
            y < constants_1.Constants.GRID_SIZE &&
            !this.grid[x][y]);
    }
}
exports.Model = Model;


/***/ }),

/***/ 657:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Renderer = void 0;
const _1 = __webpack_require__(591);
const constants_1 = __webpack_require__(932);
class Renderer {
    constructor(_model) {
        this.model = _model;
    }
    renderModel() {
        for (var i = 0; i != constants_1.Constants.GRID_SIZE; ++i) {
            for (var j = 0; j != constants_1.Constants.GRID_SIZE; ++j) {
                const outerEl = _1.HPKitDemo.elFromId(`${i}-${j}`);
                const innerEl = _1.HPKitDemo.elFromId(`i-${i}-${j}`);
                outerEl.style.border = '1px solid rgb(64, 64, 64, .125)';
                if (this.model.grid[i][j] === true) {
                    outerEl.style.backgroundColor = '#000000';
                }
                else {
                    outerEl.style.backgroundColor = '#F2F2F2';
                }
                innerEl.style.backgroundColor = '#f2f2f200';
                innerEl.style.border = '0px solid black';
            }
        }
        const originElement = _1.HPKitDemo.elFromId(`${this.model.origin.x}-${this.model.origin.y}`);
        originElement.style.backgroundColor = '#99D9EA';
        originElement.style.border = '1px solid black';
        const goalElement = _1.HPKitDemo.elFromId(`${this.model.goal.x}-${this.model.goal.y}`);
        goalElement.style.backgroundColor = '#B5E61D';
        goalElement.style.border = '1px solid black';
        if (this.model.path) {
            this.model.path.forEach(p => {
                _1.HPKitDemo.elFromId(`i-${p[0]}-${p[1]}`).style.backgroundColor = '#ffff0088';
                _1.HPKitDemo.elFromId(`i-${p[0]}-${p[1]}`).style.border = '1px solid black';
                _1.HPKitDemo.elFromId(`i-${p[0]}-${p[1]}`).style.borderRadius = '2px';
            });
        }
    }
}
exports.Renderer = Renderer;


/***/ }),

/***/ 284:
/***/ ((__unused_webpack_module, exports) => {


exports.__esModule = true;
exports.HPBinaryHeap = void 0;
/**
 * Binary heap implementation from Eloquent Javascript:
 * https://eloquentjavascript.net/1st_edition/appendix2.html
 * Translated to Typescript and expanded upon a bit
 */
var HPBinaryHeap = /** @class */ (function () {
    function HPBinaryHeap(scoreFn, equalityFn) {
        this.content = new Array();
        this.scoreFn = scoreFn;
        this.equalityFn = equalityFn;
    }
    HPBinaryHeap.prototype.contains = function (n) {
        var len = this.content.length;
        for (var i = 0; i !== len; ++i) {
            var testElement = this.content[i];
            if (this.equalityFn(testElement, n)) {
                return true;
            }
        }
        return false;
    };
    HPBinaryHeap.prototype.inspect = function (n) {
        var len = this.content.length;
        for (var i = 0; i !== len; ++i) {
            var testElement = this.content[i];
            if (this.equalityFn(testElement, n)) {
                return testElement;
            }
        }
        return null;
    };
    HPBinaryHeap.prototype.modify = function (n) {
        var len = this.content.length;
        for (var i = 0; i !== len; ++i) {
            if (this.equalityFn(this.content[i], n)) {
                this.content[i] = n;
                if (i === len - 1) {
                    break;
                }
                this.bubbleUp(i);
                this.sinkDown(i);
                return;
            }
        }
        return null;
    };
    HPBinaryHeap.prototype.push = function (n) {
        this.content.push(n);
        this.bubbleUp(this.content.length - 1);
    };
    HPBinaryHeap.prototype.pop = function () {
        var result = this.content[0];
        var end = this.content.pop();
        if (this.content.length > 0) {
            this.content[0] = end;
            this.sinkDown(0);
        }
        return result;
    };
    HPBinaryHeap.prototype.remove = function (n) {
        var len = this.content.length;
        for (var i = 0; i < len; i++) {
            if (!this.equalityFn(this.content[i], n)) {
                continue;
            }
            var end = this.content.pop();
            if (i === len - 1) {
                break;
            }
            this.content[i] = end;
            this.bubbleUp(i);
            this.sinkDown(i);
            break;
        }
    };
    HPBinaryHeap.prototype.size = function () {
        return this.content.length;
    };
    HPBinaryHeap.prototype.bubbleUp = function (n) {
        // Fetch the element that has to be moved.
        var element = this.content[n];
        var score = this.scoreFn(element);
        // When at 0, an element can not go up any further.
        while (n > 0) {
            // Compute the parent element's index, and fetch it.
            var parentN = (n - 1) >>> 1;
            var parent_1 = this.content[parentN];
            // If the parent has a lesser score, things are in order and we are done.
            if (score >= this.scoreFn(parent_1)) {
                break;
            }
            // Otherwise, swap the parent with the current element and continue.
            this.content[parentN] = element;
            this.content[n] = parent_1;
            n = parentN;
        }
    };
    HPBinaryHeap.prototype.sinkDown = function (n) {
        // Look up the target element and its score.
        var len = this.content.length, element = this.content[n], elemScore = this.scoreFn(element);
        while (true) {
            // Compute the indices of the child elements.
            var child2N = (n + 1) << 1;
            var child1N = child2N - 1;
            // This is used to store the new position of the element, if any.
            var swap = null;
            var child1Score = null;
            // If the first child exists (is inside the array)...
            if (child1N < len) {
                // Look it up and compute its score.
                var child1 = this.content[child1N];
                child1Score = this.scoreFn(child1);
                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore) {
                    swap = child1N;
                }
            }
            // Do the same checks for the other child.
            if (child2N < len) {
                var child2 = this.content[child2N], child2Score = this.scoreFn(child2);
                if (child2Score < (swap === null ? elemScore : child1Score)) {
                    swap = child2N;
                }
            }
            // No need to swap further, we are done.
            if (swap === null) {
                break;
            }
            // Otherwise, swap and continue.
            this.content[n] = this.content[swap];
            this.content[swap] = element;
            n = swap;
        }
    };
    return HPBinaryHeap;
}());
exports.HPBinaryHeap = HPBinaryHeap;
//# sourceMappingURL=hpkit-binary-heap.js.map

/***/ }),

/***/ 61:
/***/ ((__unused_webpack_module, exports) => {


exports.__esModule = true;
exports.HPBresenham = void 0;
var HPBresenham = /** @class */ (function () {
    function HPBresenham() {
    }
    /**
     * One-directional Bresenham visibility test. If a Bresenham line can be
     * plotted from origin to goal that does not pass through any blocked cell,
     * returns true
     * @param x0 Origin x
     * @param y0 Origin y
     * @param x1 Goal x
     * @param y1 Goal x
     * @param cb Passability callback
     */
    HPBresenham.brs = function (x0, y0, x1, y1, cb) {
        var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
        var sx = (x0 < x1) ? 1 : -1, sy = (y0 < y1) ? 1 : -1;
        var err = dx - dy;
        while (true) {
            if (cb(x0, y0) === false)
                return false;
            if (x0 === x1 && y0 === y1)
                return true;
            var e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
    };
    /**
     * Bi-directional Bresenham visibility test. If a Bresenham line can be drawn
     * from either origin to goal, or from goal to origin, returns true
     * @param x0 Origin x
     * @param y0 Origin y
     * @param x1 Goal x
     * @param y1 Goal x
     * @param cb Passability callback
     */
    HPBresenham.dbrs = function (x0, y0, x1, y1, cb, bd) {
        return this.brs(x0, y0, x1, y1, cb) || this.brs(x1, y1, x0, y0, cb);
    };
    /**
     * Get Bresenham line between points as array of tuples. Returns null if no
     * such line exists
     * @param x0 Origin x
     * @param y0 Origin y
     * @param x1 Goal x
     * @param y1 Goal x
     * @param cb Passability callback
     */
    HPBresenham.plotBrsLine = function (x0, y0, x1, y1, cb) {
        var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
        var sx = (x0 < x1) ? 1 : -1, sy = (y0 < y1) ? 1 : -1;
        var err = dx - dy;
        if (!cb(x1, y1))
            return null;
        var points = new Array();
        var step = 0;
        while (step++ < 9999 /* sanity constant */) {
            if (cb(x0, y0) === false)
                return null;
            points.push([x0, y0]);
            if ((x0 === x1) && (y0 === y1)) {
                break;
            }
            var err2 = 2 * err;
            if (err2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (err2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
        return points;
    };
    /**
     * Gets a Bresenham line between two points as an array of tuples, if it
     * exists. Optionally can attempt to find this line in both directions
     * (Bresenham lines can be asymmetrical so occasionally a valid line will be
     * found in the inbound direction where no valid line exists in the outbound
     * direction). Returns null if no valid Bresenham line can be found
     * @param x0 Origin x
     * @param y0 Origin y
     * @param x1 Goal x
     * @param y1 Goal x
     * @param cb Passability callback
     * @param bd Bidirectional boolean. If true, will attempt to find a line in
     *           both directions
     */
    HPBresenham.getLine = function (x0, y0, x1, y1, cb, bd) {
        var outbound = this.plotBrsLine(x0, y0, x1, y1, cb);
        if (outbound) {
            return outbound;
        }
        if (bd) {
            var inbound = this.plotBrsLine(x1, y1, x0, y0, cb);
            if (inbound) {
                return inbound.reverse();
            }
        }
        return null;
    };
    return HPBresenham;
}());
exports.HPBresenham = HPBresenham;
//# sourceMappingURL=hpkit-bresenham.js.map

/***/ }),

/***/ 991:
/***/ ((__unused_webpack_module, exports) => {


exports.__esModule = true;
exports.HPHeuristic = void 0;
var HPHeuristic = /** @class */ (function () {
    function HPHeuristic() {
    }
    HPHeuristic.manhattan = function (dx, dy) {
        return dx + dy;
    };
    HPHeuristic.euclidean = function (dx, dy) {
        return Math.sqrt(dx * dx + dy * dy);
    };
    HPHeuristic.octile = function (dx, dy) {
        return (dx + dy) + (HPHeuristic.SQRT2MINUS2) * Math.min(dx, dy);
    };
    HPHeuristic.chebyshev = function (dx, dy) {
        return Math.max(dx, dy);
    };
    HPHeuristic.SQRT2MINUS2 = (Math.SQRT2 - 2);
    return HPHeuristic;
}());
exports.HPHeuristic = HPHeuristic;
//# sourceMappingURL=hpkit-heuristic.js.map

/***/ }),

/***/ 801:
/***/ ((__unused_webpack_module, exports) => {


exports.__esModule = true;
exports.HPNode = void 0;
var HPNode = /** @class */ (function () {
    // public static readonly TWOTOPWR8 = 32768;
    function HPNode(x, y, parent, diag) {
        this.x = x;
        this.y = y;
        this.parent = parent;
        this.g = this.parent ? this.parent.g + (diag ? HPNode.costDiagonal : HPNode.costCardinal) : 0;
        this.m = this.parent ? this.parent.m + 1 : 0;
        // this.id = ((x + HPNode.TWOTOPWR8) << 16) | (y + HPNode.TWOTOPWR8);
        this.id = (x << 16) | y;
    }
    HPNode.costCardinal = 1;
    HPNode.costDiagonal = Math.SQRT2;
    return HPNode;
}());
exports.HPNode = HPNode;
//# sourceMappingURL=hpkit-node.js.map

/***/ }),

/***/ 953:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.HPStringPull = void 0;
var hpkit_bresenham_1 = __webpack_require__(61);
var HPStringPull = /** @class */ (function () {
    function HPStringPull() {
    }
    HPStringPull.stringPull = function (p, cb, skip) {
        /**
         * There are two basic methods by which we can apply string-pull
         * post-processing. We can raycast as far ahead as possible, splice in a
         * straight line to the furthest visible node, skip ahead to that node and
         * continue (splicing in a path from `n` to `n+i` and then continuing from
         * `n+i`); _or_ we can splice in said path and continue iterating from where
         * we were before (splicing in a path from `n` to `n+i`, then continuing
         * from `n+1`).
         *
         * Each method in isolation exhibits undesirable behaviour given certain
         * edge cases.
         *
         * Method #1 - in which we splice in a Bresenham line and then set `i` to
         * the index value that represents the end of that line - can sometimes
         * 'miss' points where a human agent would have turned onto a new heading by
         * virtue of seeing nodes generated by A* that lie 'past' the natural
         * turning point. This causes the string-pulling algorithm to fail to
         * naturalise some segments of the path.
         *
         * Method #2 - in which we splice in a Bresenham line from index i to i+n
         * and then continue stepping through the path from i+1 onwards - will never
         * 'miss' a turn (as it raycasts from every node, even those that have been
         * spliced in by a previous raycast) but generates slightly non-straight
         * paths in certain edge cases, generally when pathing in secondary
         * intercardinal directions, causing paths that should be straight lines to
         * adopt a slight curve.
         *
         * The simplest way to generate the straightest path possible is to apply
         * both methods sequentially. In our first pass we apply method #2, stepping
         * node by node through the path, raycasting as far as possible, splicing in
         * straight lines wherever one is found and never skipping ahead. This
         * ensures that the raycasting can never 'miss' a turning, although it does
         * in some cases produce slightly curved paths. In our second pass we apply
         * method #1, iterating again from the beginning, and wherever we find a
         * straight-line path, we splice it in and skip directly to the end of the
         * segment. This straightens out any curved artifacts from the first pass,
         * meaning that the final product is a naturalised path that changes heading
         * as soon as it is appropriate to do so, and does not take slightly curved
         * paths when travelling across open ground.
         */
        skip = skip || false;
        // Doing const len = p.length is very slightly more performant here, but if
        // the user selects crazy movement cost values it can be the case that the
        // naturalised path is shorter than the A*-generated path. To avoid
        // iterating off the end of the array in those cases we always check
        // p.length directly when called for
        for (var i = 0; i < p.length; ++i) {
            var foundPullableSegment = false;
            var sei = void 0; // Segment end index
            for (var j = i + 1; j <= p.length; ++j) {
                if (j === p.length) {
                    if (foundPullableSegment) {
                        var pulledSegment = hpkit_bresenham_1.HPBresenham.getLine(p[i][0], p[i][1], p[p.length - 1][0], p[p.length - 1][1], cb, true);
                        p.splice.apply(p, __spreadArray([i, (j - 1)], pulledSegment, false));
                    }
                    return p;
                }
                if (hpkit_bresenham_1.HPBresenham.dbrs(p[i][0], p[i][1], p[j][0], p[j][1], cb)) {
                    foundPullableSegment = true;
                    sei = j;
                }
                else if (foundPullableSegment) {
                    var pulledSegment = hpkit_bresenham_1.HPBresenham.getLine(p[i][0], p[i][1], p[sei][0], p[sei][1], cb, true);
                    p.splice.apply(p, __spreadArray([i, (sei - i)], pulledSegment, false));
                    if (!skip) {
                        i = sei - 1;
                    }
                    break;
                }
            }
        }
        return p;
    };
    // Map the eight compass direction to that direction plus the two adjacent directions
    HPStringPull.translationMap = {
        "-1": {
            "-1": [[-1, -1], [-1, 0], [0, -1]],
            "0": [[-1, 0], [-1, -1], [-1, 1]],
            "1": [[-1, 1], [-1, 0], [0, 1]]
        },
        "0": {
            "-1": [[0, -1], [1, -1], [1, 1]],
            "0": [],
            "1": [[0, 1], [-1, 1], [1, 1]]
        },
        "1": {
            "-1": [[1, 1], [1, 0], [0, 1]],
            "0": [[1, 0], [1, -1], [1, 1]],
            "1": [[1, 1], [0, 1], [1, 0]]
        }
    };
    return HPStringPull;
}());
exports.HPStringPull = HPStringPull;
//# sourceMappingURL=hpkit-string-pulling.js.map

/***/ }),

/***/ 80:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


exports.__esModule = true;
exports.HPKit = void 0;
var hpkit_node_1 = __webpack_require__(801);
var hpkit_binary_heap_1 = __webpack_require__(284);
var hpkit_heuristic_1 = __webpack_require__(991);
var hpkit_bresenham_1 = __webpack_require__(61);
var hpkit_string_pulling_1 = __webpack_require__(953);
var SmoothingType;
(function (SmoothingType) {
    SmoothingType[SmoothingType["SKIP"] = 0] = "SKIP";
    SmoothingType[SmoothingType["NOSKIP"] = 1] = "NOSKIP";
    SmoothingType[SmoothingType["TWIN_PASS"] = 2] = "TWIN_PASS";
})(SmoothingType || (SmoothingType = {}));
var HPKit = /** @class */ (function () {
    function HPKit() {
        this.preferBresenham = false;
        this.pullStrings = false;
        this.permitDiagonals = true;
        this.enforceMaxCost = false;
        this.maxCost = Number.MAX_SAFE_INTEGER;
        this.enforceMaxMoves = false;
        this.maxMoves = Number.MAX_SAFE_INTEGER;
        // Using naturalisation post-processing options other than TWIN_PASS will
        // result in non-natural paths in some rare edge cases. They are included here
        // as options that you can force if you know what you're doing and are
        // interested in experimenting with how and why they fail. They are not for
        // production use. Do not change this except to tinker on a development build.
        this.smoothingType = SmoothingType.TWIN_PASS;
        this.abs = function (n) { return ((n ^ (n >> 31)) - (n >> 31)); };
        this.heuristic = function (dx, dy) { return hpkit_heuristic_1.HPHeuristic.octile(dx, dy); };
        // public setSmoothingType(pref: string): void {
        //   switch(pref.toLowerCase()) {
        //     case 'skip': this.smoothingType = SmoothingType.SKIP; break;
        //     case 'noskip': this.smoothingType = SmoothingType.NOSKIP; break;
        //     case 'no-skip': this.smoothingType = SmoothingType.NOSKIP; break;
        //     case 'no_skip': this.smoothingType = SmoothingType.NOSKIP; break;
        //     case 'twin': this.smoothingType = SmoothingType.TWIN_PASS; break;
        //     case 'twinpass': this.smoothingType = SmoothingType.TWIN_PASS; break;
        //     case 'twin-pass': this.smoothingType = SmoothingType.TWIN_PASS; break;
        //     case 'twin_pass': this.smoothingType = SmoothingType.TWIN_PASS; break;
        //     case 'dual': this.smoothingType = SmoothingType.TWIN_PASS; break;
        //     default: break;
        //   };
        // }
    }
    HPKit.prototype.retracePath = function (pathEnd) {
        var path = new Array();
        var trace = pathEnd;
        while (trace.parent !== null) {
            path.push([trace.x, trace.y]);
            trace = trace.parent;
        }
        return path.reverse();
    };
    HPKit.prototype.getPath = function (ox, oy, tx, ty, walkableCallback) {
        this.open = new hpkit_binary_heap_1.HPBinaryHeap(function (n) { return n.f; }, function (a, b) { return a.id === b.id; });
        this.closed = new Map();
        this.cb = walkableCallback;
        if (!this.cb(tx, ty))
            return null;
        if (this.preferBresenham) {
            var brsTest = hpkit_bresenham_1.HPBresenham.dbrs(ox, oy, tx, ty, this.cb);
            if (brsTest) {
                var path = hpkit_bresenham_1.HPBresenham.getLine(ox, oy, tx, ty, this.cb, true);
                path.shift();
                return path;
            }
        }
        this.open.push(new hpkit_node_1.HPNode(ox, oy, null, false));
        while (this.open.size() > 0) {
            var currentNode = this.open.pop();
            this.closed.set(currentNode.id, true);
            if (currentNode.x === tx && currentNode.y === ty) {
                var unpulledPath = this.retracePath(currentNode);
                if (this.pullStrings) {
                    // String pulling should start from the origin, not from the first
                    // point of the found path. As a fudge, we unshift the origin onto the
                    // front of the path, apply post-processing, and then shift it off
                    // again at the end
                    unpulledPath.unshift([ox, oy]);
                    // Apply the selected type of path naturalisation post-processing
                    var pulledPath = void 0;
                    if (this.smoothingType === SmoothingType.TWIN_PASS) {
                        pulledPath = hpkit_string_pulling_1.HPStringPull.stringPull(unpulledPath, this.cb, true);
                        pulledPath = hpkit_string_pulling_1.HPStringPull.stringPull(pulledPath, this.cb, false);
                    }
                    else if (this.smoothingType === SmoothingType.SKIP) {
                        pulledPath = hpkit_string_pulling_1.HPStringPull.stringPull(unpulledPath, this.cb, false);
                    }
                    else if (this.smoothingType === SmoothingType.NOSKIP) {
                        pulledPath = hpkit_string_pulling_1.HPStringPull.stringPull(unpulledPath, this.cb, true);
                    }
                    pulledPath.shift();
                    return pulledPath;
                }
                return unpulledPath;
            }
            else {
                for (var i = -1; i <= 1; ++i) {
                    for (var j = -1; j <= 1; ++j) {
                        if (i === 0 && j === 0)
                            continue;
                        var isDiagonal = !((i + j) & 1);
                        if (!this.permitDiagonals && isDiagonal)
                            continue;
                        var nx = currentNode.x + i;
                        var ny = currentNode.y + j;
                        if (!this.cb(nx, ny))
                            continue;
                        if (this.closed.has((nx << 16) | ny))
                            continue;
                        if (this.enforceMaxCost) {
                            var testG = currentNode.g + (isDiagonal ? hpkit_node_1.HPNode.costDiagonal : hpkit_node_1.HPNode.costCardinal);
                            if (testG > this.maxCost)
                                continue;
                        }
                        if (this.enforceMaxMoves) {
                            if (currentNode.m >= this.maxMoves)
                                continue;
                        }
                        var neighbour = new hpkit_node_1.HPNode(nx, ny, currentNode, isDiagonal);
                        var match = this.open.inspect(neighbour);
                        if (match) {
                            if (match.g > neighbour.g) {
                                neighbour.h = this.heuristic(this.abs(neighbour.x - tx), this.abs(neighbour.y - ty));
                                neighbour.f = neighbour.g + neighbour.h;
                                this.open.modify(neighbour);
                            }
                        }
                        else {
                            neighbour.h = this.heuristic(this.abs(neighbour.x - tx), this.abs(neighbour.y - ty));
                            neighbour.f = neighbour.g + neighbour.h;
                            this.open.push(neighbour);
                        }
                    }
                }
            }
        }
        return null;
    };
    /**
     * Configuration methods after this point
     */
    HPKit.prototype.allowDiagonals = function (pref) {
        if (!pref && this.pullStrings) {
            throw new Error("Can't prohibit diagonal movement while string pulling is enabled.");
        }
        if (!pref && this.preferBresenham) {
            throw new Error("Can't prohibit diagonal movement while straight-line pathing is enabled.");
        }
        this.permitDiagonals = pref;
    };
    HPKit.prototype.setHeuristic = function (heuristic) {
        switch (heuristic.toLowerCase()) {
            case "manhattan":
                this.heuristic = hpkit_heuristic_1.HPHeuristic.manhattan;
                break;
            case "octile":
                this.heuristic = hpkit_heuristic_1.HPHeuristic.octile;
                break;
            case "euclidean":
                this.heuristic = hpkit_heuristic_1.HPHeuristic.euclidean;
                break;
            case "chebyshev":
                this.heuristic = hpkit_heuristic_1.HPHeuristic.chebyshev;
                break;
            default: throw new Error("Unrecognised heuristic requested.");
        }
    };
    HPKit.prototype.setMoveCosts = function (costCardinal, costDiagonal) {
        hpkit_node_1.HPNode.costCardinal = costCardinal;
        hpkit_node_1.HPNode.costDiagonal = costDiagonal;
    };
    HPKit.prototype.setMaxCost = function (maxCost) {
        if (maxCost < 0)
            throw new Error("Can't specify a negative value for maximum path cost.");
        this.enforceMaxCost = maxCost > 0;
        this.maxCost = maxCost;
    };
    HPKit.prototype.setMaxMoves = function (maxNodes) {
        if (maxNodes < 0)
            throw new Error("Can't specify a negative value for maximum nodes traversed.");
        this.enforceMaxMoves = maxNodes > 0;
        this.maxMoves = maxNodes;
    };
    HPKit.prototype.preferStraightLinePath = function (pref) {
        if (!this.permitDiagonals && pref) {
            throw new Error("Direct line-of-sight pathing can't be enabled while diagonal movement is prohibited.");
        }
        this.preferBresenham = pref;
    };
    HPKit.prototype.applyStringPulling = function (pref) {
        if (!this.permitDiagonals && pref) {
            throw new Error("String pulling can't be enabled while diagonal movement is prohibited.");
        }
        this.pullStrings = pref;
    };
    return HPKit;
}());
exports.HPKit = HPKit;
//# sourceMappingURL=hpkit.js.map

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(591);
/******/ 	hpkitLib = __webpack_exports__;
/******/ 	
/******/ })()
;