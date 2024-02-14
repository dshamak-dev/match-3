import { DEADLANDS_CHAPTER } from "../prefabs/chapter.prefabs.js";
import { copyObject, randomArrayItem } from "./utils.js";

export class Chapter {
  events = [];
  enemies = [];
  history = [];
  counter = 0;

  constructor(props) {
    Object.assign(this, props);
  }

  getAvailableEvents() {
    return this.events.filter((it) => it.level <= this.counter);
  }
  getAvailableEnemy() {
    const lastEnemy = this.history.slice(-1)[0]?.enemy;

    return this.enemies.filter(
      (it) => it.level <= this.counter && it.id !== lastEnemy?.id
    );
  }

  getNextEvent() {
    this.counter++;
    const eventPrefab = randomArrayItem(this.getAvailableEvents());
    const enemy = randomArrayItem(this.getAvailableEnemy());

    const event = {
      ...eventPrefab,
      enemy,
    };

    this.history.push(event);

    return copyObject(event);
  }
}

const CHAPTER_PREFABS = [DEADLANDS_CHAPTER];

export function createChapter(game) {
  const prefab = randomArrayItem(CHAPTER_PREFABS);

  return new Chapter(prefab);
}

export function createChapterUI(game, parentEl) {}
