export const GAME_CONFIG = {
  ctaUrl: "https://example.com",
  gameField: {
    shelves: {
      order: [
        ["white"],
        ["yellow", "yellow"],
        ["pink", "pink", "pink"],
        ["blue", "blue", "blue", "blue"],
        ["green", "green", "green", "green", "green"],
        ["orange", "orange", "orange", "orange", "orange", "orange"],
      ],
      spacing: 20,
    },
    cats: {
      randomOrder: false,
      order: [
        [],
        ["orange", "green"],
        ["orange", "green", "blue"],
        ["orange", "green", "blue", "pink"],
        ["orange", "green", "blue", "pink", "yellow"],
        ["orange", "green", "blue", "pink", "yellow", "white"],
      ]
    }
  }
};
