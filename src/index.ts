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

  public static redrawNecessary: boolean = true;

  private lastFrameTime: number = 0;
  private deltaTime: number = 0;

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
            this.tryMoveOrigin(Number(pos[0]), Number(pos[1]));
          } else if (e.button === 2) {
            this.tryMoveGoal(Number(pos[0]), Number(pos[1]));
          }
        });

        HPKitDemo.elFromId(`${j}-${i}`).addEventListener("mouseover", (e) => {
          const el = HPKitDemo.elFromEvent(e);
          const pos = HPKitDemo.posFromEl(el);
          if(e.buttons === 1) {
            this.tryMoveOrigin(Number(pos[0]), Number(pos[1]));
          } else if(e.buttons === 2) {
            this.tryMoveGoal(Number(pos[0]), Number(pos[1]));
          } else if(e.buttons === 4) {
            this.modify(el);
          }
        });
      }
    }

    document.getElementById('ddHeuristic').addEventListener('change', (e) => {
      const nh = (<any>e.target).value;
      HPKitDemo.hpkit.setHeuristic(nh);
      HPKitDemo.redrawNecessary = true;
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
      HPKitDemo.redrawNecessary = true;
    });

    this.chkboxStraightLine.addEventListener('change', (e) => {
      HPKitDemo.hpkit.preferStraightLinePath(this.chkboxStraightLine.checked);
      HPKitDemo.redrawNecessary = true;
    })

    this.chkboxStringPull.addEventListener('change', (e) => {
      HPKitDemo.hpkit.applyStringPulling(this.chkboxStringPull.checked);
      HPKitDemo.redrawNecessary = true;
    })

    this.inputMoveCostCardinal.addEventListener('input', (e) => {
      this.applyNewMoveCosts();
      HPKitDemo.redrawNecessary = true;
    })

    this.inputMoveCostDiagonal.addEventListener('input', (e) => {
      this.applyNewMoveCosts();
      HPKitDemo.redrawNecessary = true;
    })

    setTimeout(() => {
      this.lastFrameTime = performance.now();
      window.requestAnimationFrame(() => this.renderLoop());
    }, 100);
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
    if (this.state === BuildState.ADDING && !this.model.grid[pos[0]][pos[1]]) {
      this.model.grid[pos[0]][pos[1]] = true;
      HPKitDemo.redrawNecessary = true;
    } else if (this.state === BuildState.REMOVING && this.model.grid[pos[0]][pos[1]]) {
      this.model.grid[pos[0]][pos[1]] = false;
      HPKitDemo.redrawNecessary = true;
    }
  }

  public applyNewMoveCosts(): void {
    const mc = Number(this.inputMoveCostCardinal.value);
    const md = Number(this.inputMoveCostDiagonal.value);
    HPKitDemo.hpkit.setMoveCosts(mc, md);
  }

  public async renderLoop(): Promise<void> {
    this.deltaTime = performance.now() - this.lastFrameTime;
    
    while (this.deltaTime < Constants.MILLIS_PER_FRAME) {
      await this.sleep(Constants.MILLIS_PER_FRAME - this.deltaTime);
      this.deltaTime = performance.now() - this.lastFrameTime;
    }

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
    
    this.lastFrameTime = performance.now();
    window.requestAnimationFrame(() => this.renderLoop());
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public tryMoveOrigin(x: number, y: number): void {
    if (x !== this.model.origin.x || y !== this.model.origin.y) {
      this.model.origin.x = x;
      this.model.origin.y = y;
      HPKitDemo.redrawNecessary = true;
    }
  }

  public tryMoveGoal(x: number, y: number): void {
    if (x !== this.model.goal.x || y !== this.model.goal.y) {
      this.model.goal.x = x;
      this.model.goal.y = y;
      HPKitDemo.redrawNecessary = true;
    }
  }

  public randomise(): void {
    this.model.randomise();
    HPKitDemo.redrawNecessary = true;
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
    HPKitDemo.redrawNecessary = true;
  }

  public clear(): void {
    this.model.clear();
    HPKitDemo.redrawNecessary = true;
  }
  
  public handleInput(): void {
    switch (this.inputManager.KP) {
      case Constants.INPUT.Keys.D: {
        this.chkboxDiagonals.click();    
        HPKitDemo.redrawNecessary = true;
        break;
      }
      case Constants.INPUT.Keys.S: {
        this.chkboxStraightLine.click();
        HPKitDemo.redrawNecessary = true;
        break;
      }
      case Constants.INPUT.Keys.P: {
        this.chkboxStringPull.click();
        HPKitDemo.redrawNecessary = true;
        break;
      }
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
        HPKitDemo.redrawNecessary = true;
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