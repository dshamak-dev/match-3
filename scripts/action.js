export function createActionUI(game, parentEl) {
  const actionsEl = document.createElement("div");
  actionsEl.classList.add("action-list");

  parentEl.append(actionsEl);

  let lastActionsState = null;

  game.addEventListener("update", (payload) => {
    const { actions } = payload;

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
  });
}
