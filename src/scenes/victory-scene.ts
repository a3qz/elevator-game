import { Input } from 'phaser';
import { getGameWidth, getGameHeight } from '../helpers';
import { GameButton } from '../ui/game-button';
import { MenuButton } from '../ui/menu-button';
import * as helpers from '../helpers';
import { GameScene } from './game-scene';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'victory',
};
export class ButtonSceneData{
    callback:Function;
    startingTime: number;
    buttonCount: number;
}
export class VictoryScene extends Phaser.Scene {
  public speed = 600;
  public minTime = 200;
  public maxTime = 1100;

  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  

  private static ticker;
  private maxTicker;
  private punishmentSeconds;
  private startingTime;


  private debugText: Phaser.GameObjects.Text;

  private timer: Phaser.Time.TimerEvent;
  private errorSound: Phaser.Sound.BaseSound;
  private goodSound: Phaser.Sound.BaseSound;

  private callback: Function;

  constructor() {
    super(sceneConfig);
  }

  public create(): void {

    // This is a nice helper Phaser provides to create listeners for some of the most common keys.
    this.cursorKeys = this.input.keyboard.createCursorKeys();

    // debugtext
    this.add.text(200, 100, 'Click every button in order before time runs out.  \nMistakes will be punished!').setDepth(1000);
    this.debugText = this.add.text(0, 200, 'YOU WIN').style.setFontSize(300).setDepth(-1).setAlpha(.7);

  }

  public update(): void {
    // Every frame, we create a new velocity for the sprite based on what keys the player is holding down.
    const velocity = new Phaser.Math.Vector2(0, 0);

    if (this.cursorKeys.left.isDown) {
      velocity.x -= 1;
    }
    if (this.cursorKeys.right.isDown) {
      velocity.x += 1;
    }
    if (this.cursorKeys.up.isDown) {
      velocity.y -= 1;
    }
    if (this.cursorKeys.down.isDown) {
      velocity.y += 1;
    }
  }
}
