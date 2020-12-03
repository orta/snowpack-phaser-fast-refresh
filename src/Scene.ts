import Phaser  from 'phaser';
import { StateScene } from './StateScene';

interface State {
  draggable?: Phaser.GameObjects.Sprite;
  count: number;
}

export let ExampleScene = class ExampleScene extends StateScene<State> {
  constructor(config: string | Phaser.Types.Scenes.SettingsConfig, state: State) {
    super(config, state)
  }

  preload() {
    this.load.image('orb', 'assets/sprites/orb-blue.png');
    this.load.image('orb-red', 'assets/sprites/orb-red.png');
  }

  create() {
    // Re-use the x, y from state instead of any position
    const dx = this.state.draggable?.x || 20;
    const dy = this.state.draggable?.y || 20;

    // Just a shape which you can drag anywhere which 
    // should retain its position across the 
    const draggable = this.add.sprite(dx, dy, 'orb');
    const shape = new Phaser.Geom.Circle(20, 20, 20);
    draggable.setInteractive(shape, Phaser.Geom.Circle.Contains);
    this.input.setDraggable(draggable);

    draggable.on('pointerover', function () {
      draggable.setTint(0x7878ff);
    });

    draggable.on('pointerout', function () {
      draggable.clearTint();
    });

    draggable.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      draggable.x = dragX;
      draggable.y = dragY;
    });

    this.state.draggable = draggable;

    //  Create 300 sprites (they all start life at 0x0)
    const gConfig: Phaser.Types.GameObjects.Group.GroupCreateConfig = {
      key: 'orb-red',
      frameQuantity: 10,
    };
    const randoSprites = this.add.group(gConfig);

    //  Randomly position the sprites within the circle
    const circle = new Phaser.Geom.Circle(200, 300, 130);
    Phaser.Actions.RandomCircle(randoSprites.getChildren(), circle);
  }
};

if (import.meta.hot) {
  // Receive any updates from the dev server, and update accordingly.
  import.meta.hot.accept(({ module }) => {
    const thisML: typeof import('.') = module as any;
    try {
      // @ts-ignore
      // Pull out the main game instance to grab all the active scenes
      const game = window.game as Phaser.Game;
      const scenes = game.scene.getScenes();

      // Find any which match the current scene
      const theseScenes = scenes.filter((s) => s instanceof ExampleScene);

      // Change this modules version of the Example Scene class
      // @ts-ignore
      ExampleScene = thisML.ExampleScene;

      // Loop through all the known scenes and then delete and restart
      // the scene with the same state 
      theseScenes.forEach(s => {
        const sceneAny = s as any;
        const config = sceneAny.state._config;
        const key = typeof config === 'string' ? config : config.key;
        const state = sceneAny.state as State;
        s.game.scene.remove(key);

        game.scene.add(key, new ExampleScene(config, state), true);
      });

    } catch (err) {
      // If you have trouble accepting an update, mark it as invalid (reload the page).
      console.error(err);
      import.meta.hot.invalidate();
    }
  });
  // Optionally, clean up any side-effects in the module before loading a new copy.
  import.meta.hot.dispose(() => {});
}
