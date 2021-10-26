import { MenuButton } from '../ui/menu-button';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'MainMenu',
};

/**
 * The initial scene that starts, shows the splash screens, and loads the necessary assets.
 */
export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super(sceneConfig);
  }

  public create(): void {
    this.add
      .text(100, 50, 'Elevating over it \nby a3qz', {
        color: '#FFFFFF',
      })
      .setFontSize(24);

    new MenuButton(this, 300, 400, 'Start Game', () => {
      this.scene.start('Game');
    });
  }
}
