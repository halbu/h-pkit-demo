import { HPKitDemo } from ".";
import { Constants } from "./constants";
import { Model } from "./model";

export class Renderer {
  private model: Model;

  constructor(_model: Model) {
    this.model = _model;
  }

  public renderModel(): void {
    if (!HPKitDemo.redrawNecessary) {
      return;
    }

    for (var i = 0; i != Constants.GRID_SIZE; ++i) {
      for (var j = 0; j != Constants.GRID_SIZE; ++j) {
        const outerEl = HPKitDemo.elFromId(`${i}-${j}`);
        const innerEl = HPKitDemo.elFromId(`i-${i}-${j}`);
        outerEl.style.border = '1px solid rgb(64, 64, 64, .125)'
        if (this.model.grid[i][j] === true) {
          outerEl.style.backgroundColor = '#000000'
        } else {
          outerEl.style.backgroundColor = '#F2F2F2'
        }
        innerEl.style.backgroundColor = '#f2f2f200'
        innerEl.style.border = '0px solid black'
      }
    }
    
    const originElement = HPKitDemo.elFromId(`${this.model.origin.x}-${this.model.origin.y}`);
    originElement.style.backgroundColor = '#99D9EA'
    originElement.style.border = '1px solid black'
    const goalElement = HPKitDemo.elFromId(`${this.model.goal.x}-${this.model.goal.y}`);
    goalElement.style.backgroundColor = '#B5E61D'
    goalElement.style.border = '1px solid black'

    if(this.model.path) {
      this.model.path.forEach(p => {
        HPKitDemo.elFromId(`i-${p[0]}-${p[1]}`).style.backgroundColor = '#ffff0088'
        HPKitDemo.elFromId(`i-${p[0]}-${p[1]}`).style.border = '1px solid black'
        HPKitDemo.elFromId(`i-${p[0]}-${p[1]}`).style.borderRadius = '2px'
      })
    }

    HPKitDemo.redrawNecessary = false;
  }
}
