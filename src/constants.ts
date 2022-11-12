export class Constants {
  public static readonly CANVAS_WIDTH = 780;
  public static readonly CANVAS_HEIGHT = 780;

  public static readonly GRID_SIZE = 39;
  public static readonly TILE_SIZE = 16;

  public static readonly INPUT = {
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
  public static readonly DIRECTIONS = [
    { x: 0, y: -1 },
    { x: 1, y: -1 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
    { x: -1, y: 1 },
    { x: -1, y: 0 },
    { x: -1, y: -1 },
  ];

public static readonly CARDINAL_DIRECTIONS = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ];
}
