import { Character, createCharacter, resolveCharacter } from "./character.js";
import { resolveGameCombos } from "./combo.js";
import {
  createItem,
  generateGridCells,
  getMatchedItems,
  resolveGameItems,
  restartGame,
  validatePositions,
} from "./game.utils.js";
import { resolveGameEvent } from "./gameEvent.js";
import { TILE_VALUES } from "./tiles.js";
import { copyObject } from "./utils.js";

const COMBO_FACTOR = 0.4;
const AVAILABLE_VALUES = TILE_VALUES;

export class Game {
  listeners = [];
  selected = [];
  destroy = [];

  combos = [];

  maxActions = 1;
  turnActionCounter = 0;
  turnCounter = 0;

  character = null;

  event = null;

  disabled = false;

  gridSize = 6;
  grid = null;

  values;

  score = 0;
  counter = 0;

  playing = false;

  get canAct() {
    return !this.turnEnd && this.turnActionCounter < this.maxActions;
  }

  constructor(props = {}) {
    Object.assign(this, props);

    this.playing = true;

    if (!this.grid) {
      this.restart();
    }

    if (!this.values) {
      this.values = AVAILABLE_VALUES;
    }

    if (!this.combos) {
      this.combos = [];
    }

    // todo: show character creation screen
    this.character = this.character ? new Character(this.character) : createCharacter(this);

    setTimeout(() => this.update(), 0);
  }

  restart() {
    restartGame(this);
    this.values = AVAILABLE_VALUES;

    generateGridCells(this);

    // todo: show character creation screen
    this.character = createCharacter(this);

    this.setPlay(true);
    this.update();
  }

  update() {
    let ok = this.playing && !!this.event;

    // todo: use generator to navigate through steps
    if (ok) {
      ok = resolveCharacter(this);
    }

    if (ok) {
      ok = this.resolveTurn();
    }

    if (ok && this.validateTurnEnd()) {
      ok = resolveGameEvent(this);
    }

    this.disabled = !ok || !this.canAct;

    this.dispatch();
  }

  dispatch() {
    const json = this.json();

    this.listeners.forEach((it) => {
      if (it.name === "update" && it.callback) {
        it.callback(json);
      }
    });
  }

  addCoins(value) {
    if (!this.coins) {
      this.coins = 0;
    }

    this.coins += value || 0;
  }

  resolveTurn() {
    if (!resolveGameItems(this)) {
      return false;
    }

    if (!this.updatePositions()) {
      return false;
    }

    if (!this.updateSpawn()) {
      return false;
    }

    if (!this.validate()) {
      return false;
    }

    return resolveGameCombos(this);
  }

  startEvent(event) {
    this.event = event;
    this.turnCounter = 0;
    this.turnActionCounter = 0;
    this.turnEnd = false;

    this.update();
  }

  validateTurnStart() {
    // todo: validate next turn
    return true;
  }

  startNextTurn() {
    this.turnActionCounter = 0;
    this.turnCounter++;
    this.turnEnd = false;
  }

  validateTurnEnd() {
    return this.turnEnd;
  }

  setPlay() {
    this.playing = !this.playing;

    this.dispatch();
  }

  togglePlay() {
    this.setPlay(!this.playing);
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
          this.addCombos(matched.map((it) => this.findByIndex(it).item));

          matched.forEach((ind) => this.markToDestroy(ind));
          this.score += Math.floor(matched.length * COMBO_FACTOR);
        }
      }
    }

    return !this.checkMatches();
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

  addCombos(items) {
    const action = {
      value: items[0].value,
      counter: items.length,
    };

    this.combos.push(action);
  }

  updateSpawn() {
    const targetCells = [...new Array(this.gridSize)].map((_, x) => {
      return this.findByPosition({ x, y: 0 });
    });

    const emptyCells = targetCells.filter((cell) => !cell.item);

    if (!emptyCells.length) {
      return true;
    }

    emptyCells.forEach((cell) => {
      const item = createItem(this);

      this.setCellItem(cell, item);
    });

    return false;
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

    return validatePositions(this);
  }

  click(cell) {
    if (this.disabled) {
      return;
    }

    if (this.selected.includes(cell.index)) {
      this.selected = this.selected.filter((it) => it !== cell.index);
    } else {
      const index = this.selected.length % this.maxActions;

      this.selected.splice(index, 1, cell.index);
    }

    this.dispatch();
  }

  move({ x, y }) {
    if (x === 0 && y === 0) {
      return;
    }

    if (this.disabled) {
      return;
    }

    if (!this.selected.length) {
      return;
    }

    const selectedCells = this.selected
      .map((index) => {
        return this.findByIndex(index);
      })
      .sort((a, b) => {
        if (x !== 0) {
          return x > 0 ? b.x - a.x : a.x - b.x;
        }

        return y > 0 ? b.y - a.y : a.y - b.y;
      });

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

    this.turnActionCounter += this.selected.length;

    // has actions used this turn
    this.turnEnd = true;

    this.selected = [];

    selectedCells.forEach((cell) => {
      const nextX = cell.x + x;
      const nextY = cell.y + y;

      const targetIndex = this.positionToIndex({ x: nextX, y: nextY });

      this.swap(cell, this.findByIndex(targetIndex));
    });

    this.update();
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
  }

  checkMatches() {
    const lastIndex = this.gridSize - 1;

    for (let row = lastIndex; row >= 0; row--) {
      for (let col = 0; col <= lastIndex; col++) {
        const index = this.positionToIndex({ x: col, y: row });

        const matched = this.getMatched(index);

        if (!!matched.length) {
          return true;
        }
      }
    }

    return false;
  }

  addEventListener(eventName, callback) {
    const event = {
      name: eventName,
      callback,
    };

    this.listeners.push(event);
  }
}
