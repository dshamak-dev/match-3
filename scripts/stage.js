import { createGameEventUI } from "./gameEvent.js";

export function createStageUI(game, parentEl) {
  const stageEl = document.createElement("div");
  stageEl.classList.add("stage");
  parentEl.append(stageEl);

  createGameEventUI(game, stageEl);
  // createInventoryUI(game, stageEl);
}