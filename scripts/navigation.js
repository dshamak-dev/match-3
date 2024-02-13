export function createNavigation(game, parentEl) {
  // parentEl.onclick = play;

  const navEl = document.createElement("nav");

  const scoreEl = document.createElement("div");
  scoreEl.innerText = "score:";
  navEl.append(scoreEl);

  // const restartEl = document.createElement("div");
  // restartEl.innerText = "restart";
  // restartEl.onclick = () => game.reset();
  // navEl.append(restartEl);

  parentEl.append(navEl);

  game.addEventListener("update", (payload) => {
    const { score } = payload;

    scoreEl.setAttribute("data-score", score || 0);
  });
}
