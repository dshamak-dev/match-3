import { createComboUI } from "./combo.js";
import { addSwipeEvent } from "./handlers.js";

export const TILES = [
  {
    value: 1,
    type: "power",
    imageUrl: "",
  },
  {
    value: 2,
    type: "block",
    imageUrl: "",
  }, {
    value: 3,
    type: "arrow",
    imageUrl: "",
  }, {
    value: 4,
    type: "health",
    imageUrl: "",
  }, {
    value: 5,
    type: "sword",
    imageUrl: "",
  }, {
    value: 6,
    type: "money",
    imageUrl: "",
  }
];

export const TILE_VALUES = TILES.map((it) => it.value);

export function findTileByValue(value) {
  return TILES.find((it) => it.value === value);
}

export function createTilesUI(game, parentEl) {
  const gridCover = document.createElement("div");
  gridCover.classList.add("grid-wrap");

  createComboUI(game, gridCover);

  const gridEl = document.createElement("div");
  gridEl.id = "grid";

  addSwipeEvent(gridCover, (direction) => {
    game.move(direction);
  });

  gridCover.append(gridEl);

  parentEl.append(gridCover);

  gridCover.addEventListener("click", (e) => {
    const target = e.target;
    const cellIndex = target.classList.contains("item")
      ? target.getAttribute("data-cell-index")
      : null;

    if (cellIndex) {
      game.click(game.findByIndex(Number(cellIndex)));
    }
  });

  game.addEventListener("update", (payload) => {
    renderTiles(game, gridEl);
  });
}

const updateRate = 300;
let lastState = null;
let lastActionsState = null;
let timeout = null;

function isOdd(num) {
  return Number(num) % 2 !== 0;
}

function renderTiles(game, parentEl) {
  const currentState = JSON.stringify(game.json());

  clearTimeout(timeout);
  timeout = null;

  if (currentState !== lastState) {
    lastState = currentState;
  } else {
    return;
  }

  timeout = setTimeout(() => {
    game.update();
  }, updateRate);

  const { grid, selected, destroy, disabled } = game;

  const itemIds = grid
    .map(({ item }) => {
      return item?.id?.toString();
    })
    .filter((id) => !!id);

  parentEl.classList.toggle("disabled", disabled);

  [...document.querySelectorAll(`.item`)].forEach((elem) => {
    const id = elem.getAttribute("data-id");

    if (!itemIds.includes(id)) {
      elem.remove();
    }
  });

  grid.forEach((cell) => {
    const { x, y, index, item } = cell;
    const isSelected = selected.includes(index);
    const isDestroy = destroy?.includes(index);

    let cellEl = document.querySelector(`.cell[data-index="${index}"]`);

    if (!cellEl) {
      cellEl = document.createElement("div");

      cellEl.setAttribute("data-index", index);
      cellEl.classList.add("cell");

      cellEl.style.setProperty("--x", x);
      cellEl.style.setProperty("--y", y);

      const highlight = isOdd(y) ? !isOdd(x) : isOdd(x);
      cellEl.classList.toggle("highlight", highlight);

      parentEl.append(cellEl);
    }

    if (item) {
      let itemEl = document.querySelector(`.item[data-id="${item.id}"]`);

      if (!itemEl) {
        itemEl = document.createElement("div");
        itemEl.classList.add("item");
        itemEl.setAttribute("data-id", item.id);

        parentEl.append(itemEl);
      }

      itemEl.setAttribute("data-cell-index", index);

      itemEl.classList.toggle("selected", isSelected);
      itemEl.classList.toggle("destroy", isDestroy);

      itemEl.style.setProperty("--x", item.x);
      itemEl.style.setProperty("--y", item.y);
      itemEl.setAttribute("data-value", item.value);
    }
  });
}
