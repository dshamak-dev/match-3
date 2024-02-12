import {
  createItem,
  getMatchedItems,
  validatePositions,
} from "./game.utils.js";
import { copyObject, randomArrayItem } from "./utils.js";

const COMBO_FACTOR = 0.4;

export class Game {
  listeners = [];
  selected = [];
  destroy = [];

  maxSelected = 1;
  disabled = false;

  gridSize = 6;
  grid = null;

  values = [1, 2, 3, 4, 5, 6];

  score = 0;
  counter = 0;

  constructor(props = {}) {
    Object.assign(this, props);

    if (!this.grid) {
      this.reset();
    }

    setTimeout(() => this.update(), 0);
  }

  reset() {
    const size = this.gridSize;
    const lastIndex = size - 1;
    this.grid = [];

    let index = -1;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        index++;
        const closest = [];

        if (x > 0) {
          closest.push({ x: x - 1, y });
        }
        if (x < lastIndex) {
          closest.push({ x: x + 1, y });
        }
        if (y > 0) {
          closest.push({ x: x, y: y - 1 });
        }
        if (y < lastIndex) {
          closest.push({ x: x, y: y + 1 });
        }

        const cell = {
          id: index,
          index,
          x,
          y,
          closest,
          item: null,
        };

        this.grid.push(cell);
      }
    }

    this.generateItems();
  }

  update() {
    this.disabled = !!this.destroy?.length;

    if (this.destroy?.length) {
      const nextToDestroyIndex = this.destroy.shift();

      this.score += 1;
      this.removeItem(nextToDestroyIndex);
    } else {
      this.updatePositions();

      if (validatePositions(this)) {
        this.validate();

        this.updateSpawn();
      }
    }

    const json = this.json();

    this.listeners.forEach((it) => {
      if (it.name === "update" && it.callback) {
        it.callback(json);
      }
    });
  }

  json() {
    const { grid, ...other } = this;
    const json = { ...other, grid };

    return copyObject(json);
  }

  validate() {
    const lastIndex = this.gridSize - 1;
    // todo: validate and destroy matches
    for (let row = lastIndex; row >= 0; row--) {
      for (let col = 0; col <= lastIndex; col++) {
        const index = this.positionToIndex({ x: col, y: row });

        const matched = this.getMatched(index);

        if (matched?.length) {
          matched.forEach((ind) => this.markToDestroy(ind));
          this.score += Math.floor(matched.length * COMBO_FACTOR);
        }
      }
    }

    // this.update();
  }

  getMatched(index) {
    const matched = getMatchedItems(this, index);

    if (typeof matched[0] === "object") {
      return matched.map(({ index }) => index);
    }

    return matched;
  }

  getAllAtAxis(index, axis) {
    const cell = this.findByIndex(index);

    return [...new Array(this.gridSize)].map((_, index) => {
      return this.findByIndex(
        this.positionToIndex({ x: cell.x, y: cell.y, [axis]: index })
      );
    });
  }

  compareItems(a, b) {
    if (!a || !b) {
      return false;
    }

    return a.value === b.value;
  }

  markToDestroy(cellIndex) {
    // todo: apply item effect on destroy
    this.destroy.push(cellIndex);
  }

  removeItem(cellIndex) {
    const cell = this.findByIndex(cellIndex);

    if (!cell || !cell.item) {
      return;
    }

    cell.item = null;
  }

  updateSpawn() {
    const targetCells = [...new Array(this.gridSize)].map((_, x) => {
      return this.findByPosition({ x, y: 0 });
    });

    const emptyCells = targetCells.filter((cell) => !cell.item);

    if (!emptyCells.length) {
      return;
    }

    emptyCells.forEach((cell) => {
      const item = createItem(this);

      this.setCellItem(cell, item);
    });

    // this.update();
  }

  updatePositions() {
    // todo: check empty cells and move down
    const lastIndex = this.gridSize - 1;
    for (let y = lastIndex - 1; y >= 0; y--) {
      for (let x = 0; x <= lastIndex; x++) {
        const index = this.positionToIndex({ x, y });
        const cell = this.findByIndex(index);
        const afterCell = this.findByIndex(
          this.positionToIndex({ x, y: y + 1 })
        );

        if (cell.item && afterCell && !afterCell.item) {
          this.setCellItem(afterCell, cell.item);
          this.removeItem(index);
        }
      }
    }

    // if (!validatePositions(this)) {
    //   this.updatePositions();
    // }
  }

  click(cell) {
    if (this.disabled) {
      return;
    }

    if (this.selected.includes(cell.index)) {
      this.selected = this.selected.filter((it) => it !== cell.index);
    } else {
      const index = this.selected.length % this.maxSelected;

      this.selected.splice(index, 1, cell.index);
    }

    this.update();
  }

  // left, right, up, down
  move({ x, y }) {
    if (this.disabled) {
      return;
    }

    if (!this.selected.length) {
      return;
    }

    const selectedCells = this.selected.map((index) => this.grid[index]);
    const canMove = selectedCells.every((cell) => {
      if (!cell.item) {
        return false;
      }

      const nextX = cell.x + x;
      const nextY = cell.y + y;

      return !!cell.closest.find((it) => {
        return it.x === nextX && it.y === nextY;
      });
    });

    if (!canMove) {
      return;
    }

    this.selected = [];

    selectedCells.forEach((cell) => {
      const nextX = cell.x + x;
      const nextY = cell.y + y;

      const targetIndex = this.positionToIndex({ x: nextX, y: nextY });

      this.swap(cell, this.findByIndex(targetIndex));
    });
  }

  findByIndex(index) {
    return this.grid[index];
  }

  findByPosition({ x, y }) {
    return this.findByIndex(this.positionToIndex({ x, y }));
  }

  positionToIndex({ x, y }) {
    const _x = Math.floor(x);
    const _y = Math.floor(y);

    return _y * this.gridSize + _x;
  }

  swap(a, b) {
    if (!a.item || !b.item) {
      return;
    }

    this.setCellItem(a, b.item);
    this.setCellItem(b, a.item);

    this.update();
  }

  setCellItem(cell, item) {
    const nextItem = copyObject(item);
    nextItem.x = cell.x;
    nextItem.y = cell.y;

    const updated = copyObject(this.grid[cell.index]);
    updated.item = nextItem;

    this.grid[cell.index] = updated;
  }

  generateItems() {
    this.grid.forEach((cell) => {
      if (!cell.item) {
        const item = createItem(this);

        this.setCellItem(cell, item);
      }
    });

    const lastIndex = this.gridSize;
    for (let row = lastIndex; row >= 0; row--) {
      for (let col = 0; col <= lastIndex; col++) {
        const index = this.positionToIndex({ x: col, y: row });

        const matched = this.getMatched(index);

        if (matched?.length) {
          return this.generateItems();
        }
      }
    }
  }

  addEventListener(eventName, callback) {
    const event = {
      name: eventName,
      callback,
    };

    this.listeners.push(event);
  }
}
