import { createCharacterUI } from "./character.js";

export function createNavigation(game, parentEl) {
  const navEl = document.createElement("nav");

  const characterCoverEl = document.createElement("div");
  characterCoverEl.classList.add("relative");
  createCharacterUI(game, characterCoverEl);
  navEl.append(characterCoverEl);

  const menuBtnEl = document.createElement("div");
  menuBtnEl.classList.add("btn", "menu-btn");
  menuBtnEl.onclick = (e) => {
    game.togglePlay();
  };
  navEl.append(menuBtnEl);

  const { menuEl, menuContentEl, continueBtnEl, restartBtnEl } = createMenu(game, navEl);

  parentEl.append(navEl);

  let lastState = null;

  game.addEventListener("update", (payload) => {
    const { character, playing } = payload;

    const currentState = JSON.stringify({ playing, character });
    const shouldUpdate = currentState !== lastState;

    lastState = currentState;

    if (!shouldUpdate) {
      return;
    }

    const isGameOver = !character || character.health <= 0;
    const title = isGameOver ? 'game over' : 'pause';

    menuContentEl.setAttribute("data-title", title);

    menuBtnEl.setAttribute("data-type", playing ? "pause" : "play");

    continueBtnEl.classList.toggle('hidden', isGameOver);
    menuEl.classList.toggle("hidden", playing);
  });
}

function createMenu(game, parentEl) {
  const menuEl = document.createElement("div");
  menuEl.classList.add("menu");

  const menuContentEl = document.createElement("div");
  menuContentEl.classList.add("menu-content");
  menuEl.append(menuContentEl);

  const continueBtnEl = document.createElement("button");
  continueBtnEl.classList.add("btn");
  continueBtnEl.innerText = "continue";
  continueBtnEl.onclick = () => game.togglePlay();
  menuContentEl.append(continueBtnEl);

  const restartBtnEl = document.createElement("button");
  restartBtnEl.classList.add("btn");
  restartBtnEl.innerText = "restart";
  restartBtnEl.onclick = () => {
    game.restart();
  };
  menuContentEl.append(restartBtnEl);

  parentEl.append(menuEl);

  // restartEl.innerText = "restart";
  // restartEl.onclick = () => game.reset();
  // navEl.append(restartEl);
  return { menuEl, menuContentEl, continueBtnEl, restartBtnEl };
}
