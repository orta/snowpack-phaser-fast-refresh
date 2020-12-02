import Phaser from  "phaser"
import { ExampleScene } from "./Scene";

var config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  parent: 'phaser-example',
  scene: new ExampleScene("123", { count: 0 })
};

var game = new Phaser.Game(config);
// @ts-ignore
window.game = game
