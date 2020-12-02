import Phaser  from 'phaser';

interface State {
  objs?: Phaser.GameObjects.Group;
  draggable?: Phaser.GameObjects.Sprite;
  count: number;
}

export let ExampleScene = class ExampleScene extends Phaser.Scene {
  state: State;

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig, state: State) {
    super(config);
    // @ts-ignore
    state._config = config;
    this.state = state;
  }

  preload() {
    this.load.image('orb', 'assets/sprites/orb-blue.png');
    this.load.image('orb-red', 'assets/sprites/orb-red.png');
  }

  create() {
    console.log(this.state);
    const dx = this.state.draggable?.x || 20;
    const dy = this.state.draggable?.y || 20;

    const draggable = this.add.sprite(dx, dy, 'orb');
    var shape = new Phaser.Geom.Circle(20, 20, 20);
    draggable.setInteractive(shape, Phaser.Geom.Circle.Contains);
    this.input.setDraggable(draggable);

    draggable.on('pointerover', function () {
      draggable.setTint(0x7878ff);
    });

    draggable.on('pointerout', function () {
      draggable.clearTint();
    });

    draggable.on(
      'drag',
      function (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {
        draggable.x = dragX;
        draggable.y = dragY;
      },
    );

    this.state.draggable = draggable;

    //  Create 300 sprites (they all start life at 0x0)
    const gConfig: Phaser.Types.GameObjects.Group.GroupCreateConfig = {
      key: 'orb-red',
      frameQuantity: 300,
    };
    this.state.objs = this.add.group(gConfig);

    var circle = new Phaser.Geom.Circle(200, 300, 130);

    //  Randomly position the sprites within the circle
    Phaser.Actions.RandomCircle(this.state.objs.getChildren(), circle);
  }
};

if (import.meta.hot) {
  // Receive any updates from the dev server, and update accordingly.
  import.meta.hot.accept(({ module }) => {
    const thisML: typeof import('.') = module as any;
    try {
      // @ts-ignore
      const game = window.game as Phaser.Game;
      const scenes = game.scene.getScenes();

      const theseScenes = scenes.filter((s) => s instanceof ExampleScene);
      console.log(theseScenes);
      // @ts-ignore
      ExampleScene = thisML.ExampleScene;

      theseScenes.forEach((s) => {
        const sceneAny = s as any;
        const config = sceneAny.state._config;
        const key = typeof config === 'string' ? config : config.key;
        const state = sceneAny.state as State;
        s.game.scene.remove(key);

        game.scene.add(key, new ExampleScene(config, state), true);
      });

      console.log('Swapped');
    } catch (err) {
      console.error(err);
      // If you have trouble accepting an update, mark it as invalid (reload the page).
      // import.meta.hot.invalidate();
    }
  });
  // Optionally, clean up any side-effects in the module before loading a new copy.
  import.meta.hot.dispose(() => {});
}
