import { currentGame } from "./scripts/gameSession.js";
import { createNavigation } from "./scripts/navigation.js";
import { createStageUI } from "./scripts/stage.js";
import { createTilesUI } from "./scripts/tiles.js";

const rootEl = document.getElementById("root");

const game = currentGame;

rootEl.style.setProperty("--cols", game.gridSize);
rootEl.style.setProperty("--rows", game.gridSize);

createNavigation(game, rootEl);

createStageUI(game, rootEl);

createTilesUI(game, rootEl);

