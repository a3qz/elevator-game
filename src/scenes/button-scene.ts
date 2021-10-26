import { Input } from 'phaser';
import { getGameWidth, getGameHeight } from '../helpers';
import { GameButton } from '../ui/game-button';
import { MenuButton } from '../ui/menu-button';
import * as helpers from '../helpers';
import { GameScene } from './game-scene';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Button',
};
export class ButtonSceneData{
    callback:Function;
    startingTime: number;
    buttonCount: number;
}
export class ButtonScene extends Phaser.Scene {
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

  public init(data:ButtonSceneData){
    this.callback = data.callback;
    this.maxTicker = data.buttonCount;
    this.startingTime = data.startingTime;
  }

  public create(): void {

    // This is a nice helper Phaser provides to create listeners for some of the most common keys.
    this.cursorKeys = this.input.keyboard.createCursorKeys();

    this.timer = this.time.addEvent({delay:this.startingTime, callback: ()=>this.callback(ButtonScene.ticker)});
    // debugtext
    this.add.text(200, 100, 'Click every button in order before time runs out.  \nMistakes will be punished!').setDepth(1000);
    this.debugText = this.add.text(0, 200, '').style.setFontSize(450).setDepth(-1).setAlpha(.7);

    this.errorSound = this.sound.add('error');
    this.goodSound = this.sound.add('good');
    ButtonScene.ticker = 0;
    this.punishmentSeconds = 1;
    var list = []
    let buttonIndex = helpers.buttonsPerFloor.slice(0, GameScene.floorNumber).reduce((x, y)=> x+y, 0);
    for(let i = 1; i <= this.maxTicker; i++){
        console.log(i, helpers.xList[buttonIndex+i-1]*30, helpers.yList[buttonIndex+i-1]*30);
        new GameButton(this, helpers.xList[buttonIndex+i-1]*30, helpers.yList[buttonIndex+i-1]*30, `${i}`, () => {
            this.incrementTicker(i);
            console.log(i);
          });
    }

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


    this.debugText.setText(`${this.timer.getOverallRemainingSeconds().toPrecision(2)}`);

  }

  public incrementTicker(button:number){
    if(ButtonScene.ticker+1 == button){
        ButtonScene.ticker++;
        this.goodSound.play();
    }
    else{
        console.log("NO");
        this.errorSound.play();
        const remaining = this.timer.getOverallRemainingSeconds();
        this.timer.remove(false);
        console.log(remaining- this.punishmentSeconds);
        this.timer = this.time.addEvent({delay:(remaining - this.punishmentSeconds)*1000, callback: ()=>this.callback(ButtonScene.ticker)})
    }

    if(ButtonScene.ticker == this.maxTicker){
        this.callback(ButtonScene.ticker);
    }
  }
}
