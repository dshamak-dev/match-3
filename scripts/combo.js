import { hitEnemy } from "./gameEvent.js";
import { findTileByValue } from "./tiles.js";

export function resolveGameCombos(game) {
  if (game.destroy?.length) {
    return false;
  }

  if (!game.combos?.length) {
    return true;
  }

  const nextCombo = game.combos.shift();

  // todo: apply combo effect
  if (nextCombo && game.character) {
    const tile = findTileByValue(nextCombo.value);

    const { character } = game;

    switch (tile?.type) {
      case "health": {
        character.heal({ type: "draft", value: nextCombo.counter });
        break;
      }
      case "arrow": {
        const attack = character.resolveAttack({
          type: "range",
          value: nextCombo.counter,
        });

        hitEnemy(game, attack);
        break;
      }
      case "sword": {
        const attack = character.resolveAttack({
          type: "melee",
          value: nextCombo.counter,
        });

        hitEnemy(game, attack);
        break;
      }
      case "money": {
        character.updateCoins(nextCombo.counter || 0);
        break;
      }
      case "power":
      case "block": {
        // todo: add bonus effect for next attack
        character.setEffect({ type: tile.type, value: nextCombo.counter || 0 });
        break;
      }
      default: {
        break;
      }
    }
  }

  return !game.combos.length;
}

export function createComboUI(game, parentEl) {
  const actionsEl = document.createElement("div");
  actionsEl.classList.add("action-list");

  parentEl.append(actionsEl);

  let lastActionsState = null;

  game.addEventListener("update", (payload) => {
    const { combos } = payload;

    const currentActionsState = JSON.stringify(combos);

    if (lastActionsState !== currentActionsState) {
      lastActionsState = currentActionsState;

      actionsEl.innerHTML = "";

      combos?.forEach(({ value, counter }) => {
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
