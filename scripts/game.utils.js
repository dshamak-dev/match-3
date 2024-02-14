import { randomArrayItem } from "./utils.js";

export function resolveGameItems(game) {
  if (!game || !game.destroy?.length) {
    return true;
  }

  const nextToDestroyIndex = game.destroy.shift();

  game.score += 1;
  game.removeItem(nextToDestroyIndex);

  return !game.destroy.length;
}

export const getMatchedItems = (grid, cellIndex) => {
  const cell = grid.findByIndex(cellIndex);

  if (!cell || !cell.item) {
    return [];
  }

  const shouldSkip = grid.destroy?.includes(cell.index);

  if (shouldSkip) {
    return [];
  }

  const targetItem = cell.item;

  const matchedX = findAxisQueue(grid, cellIndex, "x");
  const matchedY = findAxisQueue(grid, cellIndex, "y");

  return [].concat(matchedX, matchedY);
};

export const findAxisQueue = (grid, cellIndex, axis) => {
  const cell = grid.findByIndex(cellIndex);

  if (!cell || !cell.item) {
    return [];
  }
  const targetItem = cell.item;

  if (axis !== "x" && axis !== "y") {
    return [];
  }

  const gridSize = grid.gridSize;
  const lastIndex = gridSize - 1;
  let before = cell[axis];
  let after = cell[axis];
  let counter = gridSize;

  const cells = [cell];

  while (counter && before > 0) {
    before -= 1;

    const it = grid.findByIndex(
      grid.positionToIndex({ x: cell.x, y: cell.y, [axis]: before })
    );
    const match = compareItems(targetItem, it.item);

    if (match) {
      cells.unshift(it);
    } else {
      before = -1;
    }

    counter -= 1;
  }

  counter = gridSize;
  while (counter && after < lastIndex) {
    after += 1;

    const it = grid.findByIndex(
      grid.positionToIndex({ x: cell.x, y: cell.y, [axis]: after })
    );
    const match = compareItems(targetItem, it.item);

    if (match) {
      cells.push(it);
    } else {
      after = grid.gridSize;
    }

    counter -= 1;
  }

  // const result = allAtAxis.reduce(
  //   (prev, it) => {
  //     if (!prev.ok) {
  //       return prev;
  //     }

  //     const match = grid.compareItems(targetItem, it.item);

  //     if (!match) {
  //       return { ...prev, ok: false };
  //     }

  //     return { ...prev, list: [...prev.list, it.index] };
  //   },
  //   { ok: true, list: [] }
  // );

  if (cells.length > 2) {
    return cells;
  }

  return [];
};

export const getAllCellsByAxis = (grid, cellIndex, axis) => {
  const cell = grid.findByIndex(cellIndex);

  if (!cell) {
    return [];
  }

  if (axis !== "x" && axis !== "y") {
    return [];
  }

  const lastIndex = grid.gridSize - 1;

  return [...new Array(grid.gridSize)]
    .map((_, index) => {
      const targetIndex = axis === "x" ? index : lastIndex - index;

      return grid.findByIndex(
        grid.positionToIndex({ x: cell.x, y: cell.y, [axis]: targetIndex })
      );
    })
    .sort((a, b) => {
      if (axis === "y") {
        return b.y - a.y;
      }

      return a.x - b.x;
    });
};

export function compareItems(a, b) {
  if (!a || !b) {
    return false;
  }

  return a.value === b.value;
}

// true - all positions are valid
export function validatePositions(grid) {
  // check cols to find top that can go down

  const lastIndex = grid.gridSize - 1;

  for (let y = 0; y >= 0; y--) {
    for (let x = 0; x <= lastIndex; x++) {
      const index = grid.positionToIndex({ x, y });
      const cell = grid.findByIndex(index);
      const afterCell = grid.findByPosition({ x, y: y + 1 });

      if (cell.item && afterCell && !afterCell.item) {
        return false;
      }
    }
  }

  return true;
}

export function createItem(grid) {
  grid.counter++;

  const value = randomArrayItem(grid.values);

  if (!value) {
    console.log(grid.values);
  }

  const item = {
    id: grid.counter,
    value,
  };

  return item;
}

export function restartGame(game) {
  const initial = {
    selected: [],
    destroy: [],

    combos: [],
    event: null,

    maxActions: 2,
    turnActionCounter: 0,
    turnCounter: 0,

    disabled: false,

    gridSize: 6,
    grid: null,

    values: null,

    score: 0,
    counter: 0,

    character: null,
    event: null,
  };

  Object.assign(game, initial);
}

export function generateGridCells(game) {
  game.grid = [];

  const size = game.gridSize;
  const lastIndex = size - 1;

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

      game.grid.push(cell);
    }
  }
}
