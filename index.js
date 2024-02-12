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

const navEl = document.createElement("nav");

const scoreEl = document.createElement("div");
scoreEl.innerText = "score:";
navEl.append(scoreEl);

const toggleEl = document.createElement("div");
toggleEl.innerText = "play";
toggleEl.onclick = togglePlay;
navEl.append(toggleEl);

const restartEl = document.createElement("div");
restartEl.innerText = "restart";
restartEl.onclick = () => game.reset();
navEl.append(restartEl);

infoEl.append(navEl);

rootEl.append(infoEl);

const gridCover = document.createElement("div");
gridCover.classList.add("grid-wrap");

const gridEl = document.createElement("div");
gridEl.id = "grid";

addSwipeEvent(gridEl, (direction) => {
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
  toggleEl.innerText = "pause";
  interval = setInterval(() => {
    game.update();
  }, updateRate);

  rootEl.classList.remove("pause");
}

function pause(e) {
  e?.stopPropagation();

  clearInterval(interval);
  interval = null;

  isPaused = true;
  toggleEl.innerText = "play";

  rootEl.classList.add("pause");
}

function togglePlay(e) {
  if (interval) {
    pause(e);
  } else {
    play(e);
  }
}

function render(data) {
  // gridEl.innerHTML = "";

  const { grid, selected, destroy, disabled, score } = data;

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

        addSwipeEvent(itemEl, (direction) => {
          game.move(direction);
        });

        gridCover.append(itemEl);
      }

      itemEl.onclick = () => {
        game.click(cell);
      };

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
