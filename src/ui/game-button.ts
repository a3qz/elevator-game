import * as Phaser from 'phaser';
import * as Helpers from '../helpers';
import { GameScene } from '../scenes/game-scene';

const padding = 10;
const minimumWidth = 30;
const minimumHeight = 30;

export class GameButton extends Phaser.GameObjects.Rectangle {
  private label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, text: string, onClick?: () => void) {
    super(scene, x, y);
    scene.add.existing(this);
    this.setOrigin(0, 0);

    this.label = scene.add
      .text(x + padding, y + padding, text)
      .setFontSize(18)
      .setAlign('center');

    const labelWidth = this.label.width + padding;
    const labelHeight = this.label.height + padding;

    this.width = labelWidth >= minimumWidth ? labelWidth : minimumWidth;
    this.height = labelHeight >= minimumHeight ? labelHeight : minimumHeight;

    this.setInteractive({ useHandCursor: true })
      .on('pointerover', this.enterMenuButtonHoverState)
      .on('pointerout', this.enterMenuButtonRestState)
      .on('pointerdown', this.enterMenuButtonActiveState)
      .on('pointerup', this.enterMenuButtonHoverState);

    if (onClick) {
      this.on('pointerup', onClick);
    }

    this.enterMenuButtonRestState();
  }

  private enterMenuButtonHoverState() {
    this.label.setColor('#FFFFFF');
    this.setFillStyle(Helpers.fillColors[GameScene.floorNumber]);
  }

  private enterMenuButtonRestState() {
    this.label.setColor('#000000');
    this.setFillStyle(Helpers.fillColors[GameScene.floorNumber]);
  }

  private enterMenuButtonActiveState() {
    this.label.setColor('#BBBBBB');
    this.setFillStyle(Helpers.fillColors[GameScene.floorNumber], .5);
  }
}
