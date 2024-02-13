import { createGameEventUI } from "./scripts/gameEvent.js";
import { currentGame } from "./scripts/gameSession.js";
import { createNavigation } from "./scripts/navigation.js";
import { createTilesUI } from "./scripts/tiles.js";

const rootEl = document.getElementById("root");

const game = currentGame;

rootEl.style.setProperty("--cols", game.gridSize);
rootEl.style.setProperty("--rows", game.gridSize);

createNavigation(game, rootEl);

const outputEl = document.createElement("div");
outputEl.classList.add("output-cover");
rootEl.append(outputEl);

createGameEventUI(game, rootEl);


createTilesUI(game, rootEl);

