import { Input } from 'phaser';
import { getGameWidth, getGameHeight } from '../helpers';
import * as helpers from '../helpers';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

export class GameScene extends Phaser.Scene {
  public speed = 400;
  public minTime = 700;
  public maxTime = 800;

  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  //private image: Phaser.Physics.Arcade.Sprite;
  private frameSprite: Phaser.Physics.Arcade.Sprite;
  private leftDoorSprite: Phaser.Physics.Arcade.Sprite;
  private rightDoorSprite: Phaser.Physics.Arcade.Sprite;

  public static floorNumber: number = 0;

  private ticker = 0;
  private nextOpening = Phaser.Math.Between(this.minTime, this.maxTime);

  private backgroundMusic: Phaser.Sound.BaseSound;
  private dingSound: Phaser.Sound.BaseSound;
  private openSound: Phaser.Sound.BaseSound;
  private closeSound: Phaser.Sound.BaseSound;

  private debugText: Phaser.GameObjects.Text;

  private doorDirection = 0; // 0 = closed, 1 = opening, 2 = open, 3 = closing

  private timer: Phaser.Time.TimerEvent;

  private lastSceneSuccess = 0;

  constructor() {
    super(sceneConfig);
  }

  public create(): void {
    // Add a player sprite that can be moved around. Place him in the middle of the screen.
    //this.image = this.physics.add.sprite(getGameWidth(this) / 2, getGameHeight(this) / 2, 'man');

    this.frameSprite = this.physics.add.sprite(getGameWidth(this) / 2, getGameHeight(this) / 2, 'frame').setDepth(999);
    this.leftDoorSprite = this.physics.add.sprite(getGameWidth(this) / 2, getGameHeight(this) / 2, 'leftdoor');
    this.rightDoorSprite = this.physics.add.sprite(getGameWidth(this) / 2, getGameHeight(this) / 2, 'rightdoor');
    this.leftDoorSprite.setX(getGameWidth(this) / 2);
    this.rightDoorSprite.setX(getGameWidth(this) / 2);
    // This is a nice helper Phaser provides to create listeners for some of the most common keys.
    this.cursorKeys = this.input.keyboard.createCursorKeys();

    this.backgroundMusic = this.sound.add('elevator-0');
    this.dingSound = this.sound.add('ding');
    this.openSound = this.sound.add('open');
    this.closeSound = this.sound.add('close');
    this.backgroundMusic.play({loop:true});

    this.timer = this.time.addEvent({delay:10000});
    // debugtext
    this.debugText = this.add.text(getGameWidth(this) / 2 -25 , 5, '').setDepth(1000).setColor("0x000000");
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

    // We normalize the velocity so that the player is always moving at the same speed, regardless of direction.
    const normalizedVelocity = velocity.normalize();
    //this.image.setVelocity(normalizedVelocity.x * this.speed, normalizedVelocity.y * this.speed);
    
    this.ticker++;

    //this.debugText.setText(`${GameScene.floorNumber}, ${this.doorDirection}, ${this.cursorKeys.space.isDown}, ${this.ticker}:${this.nextOpening}, ${this.leftDoorSprite.getTopLeft().x} ${this.timer.getElapsedSeconds()}`);
    this.debugText.setText(`Floor ${GameScene.floorNumber+1}`);

    switch(this.doorDirection){
      case 0: // doors closed
        if(this.ticker >= this.nextOpening ){
          this.dingSound.play();
          this.openSound.play();
          this.transitionDoors();
        }
        break;
      case 1: // doors opening
        this.openDoors();
        if(this.leftDoorSprite.getTopLeft().x < -400){
          this.transitionDoors();
          this.scene.run("Button", {callback:(highest:number)=>{
            console.log("highest", highest);
            this.scene.stop("Button");
            this.lastSceneSuccess = helpers.buttonsPerFloor[GameScene.floorNumber] - highest;
            this.transitionDoors();
            this.closeSound.play();
          }, startingTime: helpers.timePerFloor[GameScene.floorNumber]*1000, buttonCount: helpers.buttonsPerFloor[GameScene.floorNumber]});
        }
        break;
      case 2: // doors open
      // need to draw game image here (or possibly above)

        if(this.cursorKeys.space.isDown){
          this.scene.stop("Button");
          this.transitionDoors();
        }
        break;
      case 3: // doors closing
        this.closeDoors();
        if(this.leftDoorSprite.getTopLeft().x >= -5){
          this.transitionDoors();
          this.ticker = 0;
          this.nextOpening = Phaser.Math.Between(this.minTime, this.maxTime);

          if(this.lastSceneSuccess == 0){
            GameScene.floorNumber += 1;
          }
          else{
            //GameScene.floorNumber -= this.lastSceneSuccess;
            GameScene.floorNumber -= helpers.punishments[GameScene.floorNumber];
            if(GameScene.floorNumber < 0){
              console.log("you fell");
              GameScene.floorNumber = 0;
            }
          }

          if(GameScene.floorNumber == 11){
            this.scene.start("victory");
            this.backgroundMusic.pause();
          }
        }
        break;
    }

  }

  public openDoors():void {
    const leftVelocity = new Phaser.Math.Vector2(0, 0);
    const rightVelocity = new Phaser.Math.Vector2(0, 0);

    leftVelocity.x = -1;
    rightVelocity.x = 1;

    // We normalize the velocity so that the player is always moving at the same speed, regardless of direction.
    const leftNormalizedVelocity = leftVelocity.normalize();
    this.leftDoorSprite.setVelocity(leftNormalizedVelocity.x * this.speed, leftNormalizedVelocity.y * this.speed);
    const rightNormalizedVelocity = rightVelocity.normalize();
    this.rightDoorSprite.setVelocity(rightNormalizedVelocity.x * this.speed, rightNormalizedVelocity.y * this.speed);
    
  }
  public closeDoors():void {
    /*
    const leftVelocity = new Phaser.Math.Vector2(0, 0);
    const rightVelocity = new Phaser.Math.Vector2(0, 0);

    leftVelocity.x = 1;
    rightVelocity.x = -1;

    // We normalize the velocity so that the player is always moving at the same speed, regardless of direction.
    const leftNormalizedVelocity = leftVelocity.normalize();
    this.leftDoorSprite.setVelocity(leftNormalizedVelocity.x * this.speed, leftNormalizedVelocity.y * this.speed);

    const rightNormalizedVelocity = rightVelocity.normalize();
    this.rightDoorSprite.setVelocity(rightNormalizedVelocity.x * this.speed, rightNormalizedVelocity.y * this.speed);
    if(this.leftDoorSprite.getTopLeft().x > -40){
      this.freezeDoors();
      this.leftDoorSprite.x = (getGameWidth(this) / 2 -3);
      this.rightDoorSprite.setX(getGameWidth(this) / 2 + 3);
    }*/

    this.leftDoorSprite.x+= 4;
    this.rightDoorSprite.x-=4;

  }
  public transitionDoors(){
    this.doorDirection++;
    if (this.doorDirection > 3){
      this.doorDirection = 0;
    }
    this.freezeDoors();
  }

  public freezeDoors():void{
    const velocity = new Phaser.Math.Vector2(0, 0);
    const normalizedVelocity = velocity.normalize();
    this.leftDoorSprite.setVelocity(0, 0);
    this.rightDoorSprite.setVelocity(0, 0);
  }
}
