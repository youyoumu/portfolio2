import { GameOfLife } from "#/lib/game-of-life";

export default function RootPage() {
  const gameOfLife = new GameOfLife({ height: 40, width: 40 });
  gameOfLife.randomize();
  console.log("DEBUG[266]: gameOfLife=", gameOfLife);
  return <div>{gameOfLife.getCode()}</div>;
}
