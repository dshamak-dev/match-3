import { Game } from "./scripts/game.js";
import { addSwipeEvent } from "./scripts/handlers.js";

const storage = localStorage;
const storageKey = "saved";
const initialState = { gridSize: 5 };
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
gridEl.style.setProperty("--cols", game.gridSize);
gridEl.style.setProperty("--rows", game.gridSize);

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

// window.requestAnimationFrame(handleUpdate);

// function handleUpdate(time) {
//   const isFirst = !lastUpdate;

//   lastUpdate = time;

//   if (!isFirst) {
//     deltaTime = time - lastUpdate;
//     game.update(deltaTime);
//   }

//   window.requestAnimationFrame(handleUpdate);
// }

function render(data) {
  gridEl.innerHTML = "";

  const { grid, selected, destroy, disabled, score } = data;

  scoreEl.setAttribute('data-score', score || 0);

  gridEl.classList.toggle("disabled", disabled);

  grid.forEach((cell) => {
    const { x, y, index, item } = cell;
    const isSelected = selected.includes(index);
    const isDestroy = destroy?.includes(index);

    const cellEl = document.createElement("div");
    cellEl.classList.add("cell");
    cellEl.style.setProperty("--x", x);
    cellEl.style.setProperty("--y", y);

    if (item) {
      const itemEl = document.createElement("div");
      itemEl.classList.add("item");

      if (isSelected) {
        itemEl.classList.add("selected");
      }

      if (isDestroy) {
        itemEl.classList.add("destroy");
      }

      itemEl.style.setProperty("--x", item.x);
      itemEl.style.setProperty("--y", item.y);

      itemEl.setAttribute("data-id", item.id);
      itemEl.setAttribute("data-value", item.value);

      itemEl.onclick = () => {
        game.click(cell);
      };

      addSwipeEvent(itemEl, (direction) => {
        game.move(direction);
      });

      cellEl.append(itemEl);
    }

    gridEl.append(cellEl);
  });
}
