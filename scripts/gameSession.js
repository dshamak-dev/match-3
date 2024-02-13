import { Game } from "./game.js";
import { loadGame, saveGame } from "./storage.js";

const preloadedState = loadGame();

export const currentGame = new Game(preloadedState);

currentGame.addEventListener("update", (payload) => {
  saveGame(payload);
  // render(payload);
});