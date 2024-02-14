import { copyObject, randomArrayItem } from "./utils.js";

export function resolveGameEvent(game) {
  if (!game.event) {
    return false;
  }

  const { event, character } = game;
  const { enemy } = event;
  // todo: validate and resolve existing event
  let resolved = true;

  if (enemy && enemy.hits >= enemy.health) {
    game.event.closed = true;

    return false;
  }

  if (character) {
    character.setDamage({ type: "melee", value: enemy.damage || 0 });
  }

  if (resolved) {
    game.startNextTurn();
  }

  return resolved;
}

// types: melee / range / magic
export function hitEnemy(game, { type, value }) {
  if (!game || !game.event) {
    return;
  }

  const { enemy } = game.event;

  if (!enemy) {
    return;
  }

  switch (type) {
    case "melee":
    case "range":
    case "magic": {
      if (!enemy.hits) {
        enemy.hits = 0;
      }

      enemy.hits += value || 0;
    }
  }
}

const EVENTS = [
  {
    type: "battle",
    enemy: {
      health: 20,
      damage: 1,
      hits: 0,
      imageUrl: "https://www.freeiconspng.com/thumbs/ghost-png/ghost-png-3.png",
    },
  },
  {
    type: "battle",
    enemy: {
      health: 30,
      damage: 2,
      hits: 0,
      imageUrl:
        "https://png.pngtree.com/png-clipart/20211024/original/pngtree-cartoon-robot-concept-esport-logo-design-png-image_6863087.png",
    },
  },
  {
    type: "battle",
    enemy: {
      health: 45,
      damage: 2,
      hits: 0,
      imageUrl:
        "https://i.pinimg.com/originals/80/6d/ea/806dea7c71b5c02affd2b051784a3647.png",
    },
  },
];

export function createEvent() {
  return copyObject(randomArrayItem(EVENTS));
}

export function createGameEventUI(game, parentEl) {
  const eventEl = document.createElement("div");
  eventEl.classList.add("event");

  const eventSummaryEl = document.createElement("div");
  eventSummaryEl.classList.add("event-summary", "hidden");

  const eventStartBtnEl = document.createElement("button");
  eventStartBtnEl.classList.add("event-start", "btn");
  eventStartBtnEl.innerText = "go next";

  eventStartBtnEl.onclick = (e) => {
    game.startEvent(createEvent());
  };

  eventSummaryEl.append(eventStartBtnEl);

  eventEl.append(eventSummaryEl);

  parentEl.append(eventEl);

  let lastState = null;

  game.addEventListener("update", (payload) => {
    const { event } = payload;

    const currentState = JSON.stringify({ event });

    if (lastState === currentState) {
      return;
    }

    lastState = currentState;

    const isActiveEvent = !!event && !event.closed;

    eventSummaryEl.classList.toggle("hidden", isActiveEvent);

    renderEvent(game, eventEl);
  });
}

export function renderEvent(game, parentEl) {
  const { event } = game;

  let enemyEl = parentEl.querySelector(".enemy");

  if (!event || !parentEl) {
    if (enemyEl) {
      enemyEl.classList.add("hidden");
    }

    return;
  }

  // todo: support no-battle events
  const { enemy } = event;

  if (!enemyEl) {
    enemyEl = document.createElement("div");
    enemyEl.classList.add("enemy", "bounce");

    parentEl.append(enemyEl);
  }

  enemyEl.classList.remove("hidden");
  enemyEl.style.setProperty("--imageUrl", `url(${enemy.imageUrl})`);

  let enemyStatsEl = parentEl.querySelector(".enemy-stats");
  let enemyProps = parentEl.querySelector(".props");
  let enemyHealthBar = parentEl.querySelector(".health-bar");

  if (!enemyStatsEl) {
    enemyStatsEl = document.createElement("div");
    enemyStatsEl.classList.add("enemy-stats");

    parentEl.append(enemyStatsEl);
  }

  if (!enemyProps) {
    enemyProps = document.createElement("div");
    enemyProps.classList.add("props");
    enemyStatsEl.append(enemyProps);
  }

  if (!enemyHealthBar) {
    enemyHealthBar = document.createElement("div");
    enemyHealthBar.classList.add("health-bar");
    enemyStatsEl.append(enemyHealthBar);
  }

  const { hits = 0, health, damage } = enemy;

  const healthLeft = health - hits;
  const healthState = !hits ? 1 : healthLeft / health;

  enemyProps.innerHTML = `<div><div class="icon sword"></div><div>${damage}</div></div>`;

  enemyHealthBar.style.setProperty("--progress", healthState);
  enemyHealthBar.setAttribute("data-value", healthLeft);
}
