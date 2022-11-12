import { Constants } from "./constants";

export class InputManager {
  // tslint:disable-next-line:no-any
  public KB: any;
  public KP: number;

  constructor() {
    this.KB = {};
    this.KP = Constants.INPUT.None;

    this.attachListeners();
  }

  public attachListeners(): void {
    window.onkeydown = e => {
      if (e.keyCode === Constants.INPUT.Keys.Alt) {
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

  public clearInput(): void {
    this.KP = Constants.INPUT.None;
  }
}
