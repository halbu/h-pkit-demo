import { HPKitDemo } from ".";
import { Constants } from "./constants";

export class Model {
  public grid: Array<Array<boolean>>;
  public origin: {x: number, y: number};
  public goal: {x: number, y: number};
  public path: any;

  constructor() {
    this.setup();
  }

  public setup(): void {
    this.grid = new Array<Array<boolean>>();
    for (let i = 0; i != Constants.GRID_SIZE; ++i) {
      this.grid.push(new Array<boolean>());
      for (let j = 0; j != Constants.GRID_SIZE; ++j) {
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

    this.origin = {x : 10, y : 14};
    this.goal = {x : 28, y : 24};
  }

  public clear(): void {
    for (let i = 0; i != Constants.GRID_SIZE; ++i) {
      for (let j = 0; j != Constants.GRID_SIZE; ++j) {
        this.grid[i][j] = false;
      }
    }
  }

  public newRandomPosition(): any {
    return {
      x : Math.floor(Math.random() * Constants.GRID_SIZE),
      y : Math.floor(Math.random() * Constants.GRID_SIZE)
    };
  }

  public randomise(): void {
    for (let i = 0; i != Constants.GRID_SIZE; ++i) {
      for (let j = 0; j != Constants.GRID_SIZE; ++j) {
        this.grid[i][j] = (Math.random() < 0.25);
      }
    }

    this.origin = this.newRandomPosition();
    this.goal = this.newRandomPosition();

    while(this.grid[this.origin.x][this.origin.y]) {
      this.origin = this.newRandomPosition();
    }
    while(this.grid[this.goal.x][this.goal.y]) {
      this.goal = this.newRandomPosition();
    }
  }

  public findPath(): void {
    this.path = HPKitDemo.hpkit.getPath(this.origin.x, this.origin.y, this.goal.x, this.goal.y,
      (x, y) => x >= 0 &&
        x < Constants.GRID_SIZE &&
        y >= 0 &&
        y < Constants.GRID_SIZE &&
        !this.grid[x][y]
    )
  }
}
