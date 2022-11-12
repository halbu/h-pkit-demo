import { HPKit } from "h-pkit";
import { Model } from "./model";
import { Renderer } from "./renderer";
import { Constants } from "./constants";
import { InputManager } from "./input-manager";

export class HPKitDemo {
  public static hpkit: HPKit;
  public inputManager: InputManager = new InputManager();
  public model = new Model();
  public renderer: Renderer;

  private timeArray = new Array<number>();
  private state: BuildState = BuildState.IDLE;

  private formState: FormState = FormState.OPEN;
  public chkboxDiagonals = (document.getElementById('chkAllowDiagonals') as any);
  public chkboxStraightLine = (document.getElementById('chkStraightLine') as any);
  public chkboxStringPull = (document.getElementById('chkStringPull') as any);
  public dropdownHeuristic = (document.getElementById('ddHeuristic') as any);
  public inputMoveCostCardinal = (document.getElementById('iMoveCostCardinal') as any);
  public inputMoveCostDiagonal = (document.getElementById('iMoveCostDiagonal') as any);

  public smoothingTypes = ['dual', 'skip', 'noskip'];
  public smoothingTypeIndex = 0;

  constructor() {
    this.init();
  }
  
  public static elFromId = (str: string) => document.getElementById(str);
  public static elFromEvent = (e: Event): HTMLElement => HPKitDemo.elFromId((<any>e.currentTarget).id);
  public static posFromEl = (el: HTMLElement) => el.id.split('-');

  public init(): void {
    HPKitDemo.hpkit = new HPKit();
    this.renderer = new Renderer(this.model);

    // Build cell grid from templates and attach listeners to cells as we go
    for(var i = Constants.GRID_SIZE - 1; i !== -1; --i) {
      let htmlStr = `<div class="row" id="row-${i}">`
      HPKitDemo.elFromId("fcanv").insertAdjacentHTML(`afterbegin`, htmlStr);

      for(var j = Constants.GRID_SIZE - 1; j !== -1; --j) {
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
          } else if (e.button === 0) {
            this.model.origin = {x: Number(pos[0]), y: Number(pos[1])};
          } else if (e.button === 2) {
            this.model.goal = {x: Number(pos[0]), y: Number(pos[1])};
          }
        });

        HPKitDemo.elFromId(`${j}-${i}`).addEventListener("mouseover", (e) => {
          const el = HPKitDemo.elFromEvent(e);
          const pos = HPKitDemo.posFromEl(el);
          if(e.buttons === 1) {
            this.model.origin = {x: Number(pos[0]), y: Number(pos[1])};
          } else if(e.buttons === 2) {
            this.model.goal = {x: Number(pos[0]), y: Number(pos[1])};
          } else if(e.buttons === 4) {
            this.modify(el);
          }
        });
      }
    }

    document.getElementById('ddHeuristic').addEventListener('change', (e) => {
      const nh = (<any>e.target).value;
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
      } else {
        HPKitDemo.hpkit.allowDiagonals(true);
        this.chkboxStraightLine.disabled = false;
        this.chkboxStringPull.disabled = false;
        HPKitDemo.hpkit.preferStraightLinePath(this.chkboxStraightLine.checked);
        HPKitDemo.hpkit.applyStringPulling(this.chkboxStringPull.checked);
      }
    });

    this.chkboxStraightLine.addEventListener('change', (e) => {
      HPKitDemo.hpkit.preferStraightLinePath(this.chkboxStraightLine.checked);
    })

    this.chkboxStringPull.addEventListener('change', (e) => {
      HPKitDemo.hpkit.applyStringPulling(this.chkboxStringPull.checked);
    })

    this.inputMoveCostCardinal.addEventListener('input', (e) => {
      this.applyNewMoveCosts();
    })

    this.inputMoveCostDiagonal.addEventListener('input', (e) => {
      this.applyNewMoveCosts();
    })

    this.renderLoop();
  }

  public toggleFormVisibility(): void {
    if (this.formState === FormState.OPEN) {
      HPKitDemo.elFromId('formInner').style.display = 'none';
      HPKitDemo.elFromId('btnToggleVis').innerText = '►';
      this.formState = FormState.CLOSED;
    } else if (this.formState === FormState.CLOSED) {
      HPKitDemo.elFromId('formInner').style.display = 'block';
      HPKitDemo.elFromId('btnToggleVis').innerText = '◄';
      this.formState = FormState.OPEN;
    }
  }

  public modify(el: HTMLElement) {
    let pos = HPKitDemo.posFromEl(el);
    this.model.grid[pos[0]][pos[1]] = (this.state === BuildState.ADDING) ? true : false;
  }

  public applyNewMoveCosts(): void {
    const mc = Number(this.inputMoveCostCardinal.value);
    const md = Number(this.inputMoveCostDiagonal.value);
    HPKitDemo.hpkit.setMoveCosts(mc, md);
  }

  public renderLoop(): void {
    let dt = performance.now();
    this.model.findPath();
    dt = performance.now() - dt;
    
    this.handleInput();

    this.renderer.renderModel();

    const numFrameTimesToStore = 120;

    this.timeArray.push(dt);
    if (this.timeArray.length > numFrameTimesToStore) {
      this.timeArray.shift();
    }

    let avgDt = this.timeArray.reduce((partial, e) => partial + e, 0) / numFrameTimesToStore;

    HPKitDemo.elFromId('timerElement').innerText = `Updating at 60FPS with an average pathfinding time of ${avgDt.toFixed(2)} milliseconds`;

    this.inputManager.clearInput();
    this.awaitNextFrame();
  }

  public awaitNextFrame(): void {
    window.requestAnimationFrame(() => {
      this.renderLoop();
    });
  }

  public randomise(): void {
    this.model.randomise();
  }

  public reset(): void {
    this.model.setup();
    if (this.chkboxStraightLine.checked) this.chkboxStraightLine.click();
    if (this.chkboxStringPull.checked) this.chkboxStringPull.click();
    if (!this.chkboxDiagonals.checked) this.chkboxDiagonals.click();
    this.dropdownHeuristic.selectedIndex = 0;
    HPKitDemo.hpkit.setHeuristic(this.dropdownHeuristic.value);
    this.inputMoveCostDiagonal.value = 1.41;
    this.inputMoveCostCardinal.value = 1;
    this.applyNewMoveCosts();
  }

  public clear(): void {
    this.model.clear();
  }
  
  public handleInput(): void {
    switch (this.inputManager.KP) {
      case Constants.INPUT.Keys.D: this.chkboxDiagonals.click(); break;
      case Constants.INPUT.Keys.S: this.chkboxStraightLine.click(); break;
      case Constants.INPUT.Keys.P: this.chkboxStringPull.click(); break;
      // case Constants.INPUT.Keys.K: {
      //   this.smoothingTypeIndex = ((this.smoothingTypeIndex + 1) % this.smoothingTypes.length);
      //   HPD.hpkit.setSmoothingType(this.smoothingTypes[this.smoothingTypeIndex]);
      //   console.log(`smoothing type set to ${this.smoothingTypes[this.smoothingTypeIndex]}`)
      //   break;
      // }
      case Constants.INPUT.Keys.H: {
        this.dropdownHeuristic.selectedIndex++;
        if (this.dropdownHeuristic.selectedIndex === -1) this.dropdownHeuristic.selectedIndex = 0;
        HPKitDemo.hpkit.setHeuristic(this.dropdownHeuristic.value);
        break;
      }
    }
    this.inputManager.clearInput();
  }
}

enum BuildState {
  IDLE,
  ADDING,
  REMOVING
}

enum FormState {
  OPEN,
  CLOSED
}