export function createNavigation(game, parentEl) {
  // parentEl.onclick = play;

  const navEl = document.createElement("nav");

  const scoreEl = document.createElement("div");
  scoreEl.innerText = "score:";
  navEl.append(scoreEl);

  const menuBtnEl = document.createElement("div");
  menuBtnEl.classList.add('btn', 'menu-btn');
  menuBtnEl.onclick = (e) => {
    game.togglePlay();
  };
  navEl.append(menuBtnEl);

  const menuEl = createMenu(game, navEl);

  parentEl.append(navEl);

  let lastState = null;

  game.addEventListener("update", (payload) => {
    const { score, playing } = payload;

    const currentState = JSON.stringify({ score, playing });
    const shouldUpdate = currentState !== lastState;

    lastState = currentState;

    if (!shouldUpdate) {
      return;
    }

    scoreEl.setAttribute("data-score", score || 0);


    menuBtnEl.setAttribute('data-type', playing ? 'pause' : 'play');
    menuEl.classList.toggle('hidden', playing);
  });
}

function createMenu(game, parentEl) {
  const menuEl = document.createElement("div");
  menuEl.classList.add('menu');

  const menuContentEl = document.createElement("div");
  menuContentEl.classList.add('menu-content');
  menuEl.append(menuContentEl);

  const continueBtnEl = document.createElement("button");
  continueBtnEl.classList.add('btn');
  continueBtnEl.innerText = "continue";
  continueBtnEl.onclick = () => game.togglePlay();
  menuContentEl.append(continueBtnEl);

  const restartBtnEl = document.createElement("button");
  restartBtnEl.classList.add('btn');
  restartBtnEl.innerText = "restart";
  restartBtnEl.onclick = () => game.restart();
  menuContentEl.append(restartBtnEl);

  parentEl.append(menuEl);

  // restartEl.innerText = "restart";
  // restartEl.onclick = () => game.reset();
  // navEl.append(restartEl);
  return menuEl;
}
