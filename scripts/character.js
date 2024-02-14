export class Character {
  maxHealth = 10;
  health;
  items = [];
  inventory = [];
  effects = [];
  coins = 0;
  imageUrl = "/public/pack/avatar-0.png";

  constructor(props = null) {
    Object.assign(this, props);

    if (this.health == null) {
      this.health = this.maxHealth;
    }
  }

  resolveAttack({ type, value }) {
    // apply effects to attack
    const nextType = type;
    const nextValue = value + this.getAttackPower();

    return { type: nextType, value: nextValue };
  }

  setDamage({ type, value }) {
    if (!this.health) {
      this.health = 0;
    }

    const blocks = this.getBlocks();
    const blocksUsed = Math.min(value, blocks);

    this.setEffect({ type: "block", value: -blocksUsed });

    const damage = value - blocksUsed;

    this.health -= damage;
  }

  getBlocks() {
    return this.getEffect("block");
  }

  getAttackPower() {
    const value = this.getEffect("power");

    this.setEffect({ type: "power", value: -value });

    return value;
  }

  getEffect(type) {
    const index = this.effects.findIndex((it) => it.type === type);

    if (index === -1) {
      return 0;
    }

    return this.effects[index].value || 0;
  }

  heal({ type, value }) {
    let nextHealth = this.health || 0;

    nextHealth = Math.min(this.maxHealth, nextHealth + value);

    this.health = nextHealth;
  }

  setEffect({ type, value }) {
    if (!this.effects) {
      this.effects = [];
    }

    const effectIndex = this.effects.findIndex((it) => it.type === type);

    if (effectIndex !== -1) {
      const currentValue = this.effects[effectIndex].value || 0;
      const nextValue = currentValue + value;

      this.effects.splice(effectIndex, 1, { type, value: nextValue });
    } else {
      this.effects.push({ type, value });
    }

    this.effects = this.effects.filter((it) => it.value > 0);
  }

  equipItem(item) {
    // use item and its effects
  }

  updateCoins(value) {
    if (!this.coins) {
      this.coins = 0;
    }

    this.coins += value || 0;
  }

  addItem(item) {
    // add to inventory
  }
  removeItem(item) {
    // remove from inventory
  }
}

export function resolveCharacter(game) {
  const { character } = game;

  if (!character || character.health <= 0) {
    game.setPlay(false);

    return false;
  }

  return true;
}

export function createCharacter(game) {
  return new Character();
}

export function createCharacterUI(game, parentEl) {
  const characterEl = document.createElement("div");
  characterEl.classList.add("character");

  // characterMenu
  const characterMenuEl = document.createElement("div");
  characterMenuEl.classList.add("character-menu", "hidden");
  characterEl.append(characterMenuEl);

  // Avatar
  const avatarEl = document.createElement("div");
  avatarEl.classList.add("avatar");

  characterEl.append(avatarEl);

  // Info
  const infoEl = document.createElement("div");
  infoEl.classList.add("character-info");

  characterEl.append(infoEl);

  // Health
  const healthEl = document.createElement("div");
  healthEl.classList.add("health-bar");

  infoEl.append(healthEl);

  // Effects
  const effectCoverEl = document.createElement("div");
  effectCoverEl.classList.add("effects");

  infoEl.append(effectCoverEl);

  // Append
  parentEl.append(characterEl);

  let lastState = null;

  game.addEventListener("update", (payload) => {
    const { character } = payload;

    if (!character) {
      return;
    }

    const currentState = JSON.stringify(character);

    if (lastState === currentState) {
      return;
    }

    lastState = currentState;

    const { imageUrl, maxHealth, health, effects } = character;

    effectCoverEl.innerHTML = "";
    effects.forEach((it) => {
      const el = document.createElement("div");
      el.classList.add("effect");
      el.innerHTML = `<div class="icon ${it.type}"></div><div>${it.value}</div>`;

      effectCoverEl.append(el);
    });

    const healthLeft = health;
    const healthState = healthLeft / maxHealth;

    characterEl.style.setProperty("--avatalUrl", `url(${imageUrl})`);
    healthEl.style.setProperty("--progress", healthState);
    healthEl.setAttribute("data-value", healthLeft);
  });
}
