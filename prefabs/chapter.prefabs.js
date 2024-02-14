import { concatObjects, randomId } from "../scripts/utils.js";

export const DEADLANDS_CHAPTER = {
  enemies: [
    {
      health: 20,
      damage: 1,
      hits: 0,
      imageUrl: "https://www.freeiconspng.com/thumbs/ghost-png/ghost-png-3.png",
      level: 1,
    },
    {
      health: 15,
      damage: 3,
      hits: 0,
      imageUrl:
        "https://mystickermania.com/cdn/stickers/pokemon/pkm-gastly-shows-tongue-512x512.png",
      level: 2,
    },
    {
      level: 1,
      health: 30,
      damage: 2,
      hits: 0,
      imageUrl:
        "https://png.pngtree.com/png-clipart/20211024/original/pngtree-cartoon-robot-concept-esport-logo-design-png-image_6863087.png",
    },
    {
      level: 3,
      health: 45,
      damage: 3,
      hits: 0,
      imageUrl:
        "https://i.pinimg.com/originals/80/6d/ea/806dea7c71b5c02affd2b051784a3647.png",
    },
  ].map((it) => {
    return concatObjects(it, { id: randomId() });
  }),
  events: [{ type: "battle", level: 1 }].map((it) => {
    return concatObjects(it, { id: randomId() });
  }),
};
