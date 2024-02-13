import { Game } from "./scripts/game.js";
import { addSwipeEvent } from "./scripts/handlers.js";

const storage = localStorage;
const storageKey = "saved";
const initialState = {};
let preloadedState = null;

try {
  const payload = storage.getItem(storageKey);

  if (payload) {
    preloadedState = JSON.parse(payload);
  }
} catch (err) {}

const rootEl = document.getElementById("root");

rootEl.onclick = play;

const game = new Game(preloadedState || initialState);
game.addEventListener("update", (payload) => {
  storage.setItem(storageKey, JSON.stringify(payload));
  render(payload);
});

rootEl.style.setProperty("--cols", game.gridSize);
rootEl.style.setProperty("--rows", game.gridSize);

const infoEl = document.createElement("div");
infoEl.classList.add("info-cover");

const navEl = document.createElement("nav");

const scoreEl = document.createElement("div");
scoreEl.innerText = "score:";
navEl.append(scoreEl);

const restartEl = document.createElement("div");
restartEl.innerText = "restart";
restartEl.onclick = () => game.reset();
navEl.append(restartEl);

infoEl.append(navEl);

// actions el START
const actionsEl = document.createElement("div");
actionsEl.classList.add("action-list");
infoEl.append(actionsEl);
// actions el END

rootEl.append(infoEl);

const gridCover = document.createElement("div");
gridCover.classList.add("grid-wrap");

const gridEl = document.createElement("div");
gridEl.id = "grid";

addSwipeEvent(gridCover, (direction) => {
  game.move(direction);
});

gridCover.append(gridEl);

rootEl.append(gridCover);

const updateRate = 300;
let isPaused = true;
rootEl.classList.toggle("pause", isPaused);

let interval = null;

function play(e) {
  e?.stopPropagation();

  if (!isPaused) {
    return;
  }

  isPaused = false;
  game.update();

  rootEl.classList.remove("pause");
}

function pause(e) {
  e?.stopPropagation();

  // clearInterval(interval);
  interval = null;

  isPaused = true;

  rootEl.classList.add("pause");
}

gridCover.addEventListener("click", (e) => {
  const target = e.target;
  const cellIndex = target.classList.contains("item")
    ? target.getAttribute("data-cell-index")
    : null;

  if (cellIndex) {
    game.click(game.findByIndex(Number(cellIndex)));
  }
});

let lastState = null;
let lastActionsState = null;
let timeout = null;

function render(data) {
  // gridEl.innerHTML = "";

  const currentState = JSON.stringify(data);

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

  const { grid, selected, destroy, disabled, score, actions } = data;

  const currentActionsState = JSON.stringify(actions);
  if (lastActionsState !== currentActionsState) {
    lastActionsState = currentActionsState;

    actionsEl.innerHTML = "";
    actions?.forEach(({ value, counter }) => {
      const el = document.createElement("div");
      el.classList.add("action");
      const elIcon = document.createElement("div");
      elIcon.classList.add("icon");
      elIcon.setAttribute("data-value", value);
      el.append(elIcon);

      el.setAttribute("data-counter", counter);

      actionsEl.append(el);
    });
  }

  const itemIds = grid
    .map(({ item }) => {
      return item?.id?.toString();
    })
    .filter((id) => !!id);

  scoreEl.setAttribute("data-score", score || 0);

  gridEl.classList.toggle("disabled", disabled);

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

      gridEl.append(cellEl);
    }

    if (item) {
      let itemEl = document.querySelector(`.item[data-id="${item.id}"]`);

      if (!itemEl) {
        itemEl = document.createElement("div");
        itemEl.classList.add("item");
        itemEl.setAttribute("data-id", item.id);

        // addSwipeEvent(itemEl, (direction) => {
        //   game.move(direction);
        // });

        gridCover.append(itemEl);
      }

      itemEl.setAttribute("data-cell-index", index);

      // itemEl.onclick = () => {
      //   game.click(cell);
      // };

      itemEl.classList.toggle("selected", isSelected);
      itemEl.classList.toggle("destroy", isDestroy);

      itemEl.style.setProperty("--x", item.x);
      itemEl.style.setProperty("--y", item.y);
      itemEl.setAttribute("data-value", item.value);
    }
  });
}

function isOdd(num) {
  return Number(num) % 2 !== 0;
}
