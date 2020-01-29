var text;
var timedEvent;
// var styleCountdown = { font: 'bold 104px Ubuntu', fill: '#000', boundsAlignH: 'center', boundsAlignV: 'middle' };
var style = { font: 'bold 72px Ubuntu', fill: '#fff', boundsAlignH: 'center', boundsAlignV: 'middle' };

class CountdownHUD extends Phaser.Scene {
  constructor() {
    super({ key: 'CountdownHUD', active: true });
  }

  preload() {
    this.load.spritesheet('Lights', 'assets/png/StartLights.png', { frameWidth: 114, frameHeight: 160 });
  }

  create() {
    // text = this.add.text(671, 300, '', styleCountdown);
    this.lights = this.add.sprite(700, 300, 'Lights');
    var lightSprite = 'Lights';
    this.text1 = this.add.text(326, 50, '1', style);
    this.text2 = this.add.text(551, 50, '2', style);
    this.text3 = this.add.text(781, 50, '3', style);
    this.text4 = this.add.text(1009, 50, '4', style);

    this.anims.create({
      key: 'orange',
      frames: this.anims.generateFrameNumbers(lightSprite, { start: 0, end: 1 }),
      frameRate: 60,
      loop: false
    });

    this.anims.create({
      key: 'green',
      frames: this.anims.generateFrameNumbers(lightSprite, { start: 1, end: 2 }),
      frameRate: 60,
      loop: false
    });

    timedEvent = this.time.addEvent({ delay: 1000, callback: onEvent, callbackScope: this, repeat: 3 });
  }

  update() {
    // text.setText(timedEvent.repeatCount);
  }
}

function onEvent() {
  if (timedEvent.repeatCount == 2) {
    this.lights.anims.play('orange');
  }
  if (timedEvent.repeatCount == 1) {
    this.lights.anims.play('green');
  }
  if (timedEvent.repeatCount == 0) {
    this.scene.stop();
  }
}

//positions for text at 72px 1: 326px, position 2 = 551px, position 3: 781px, position 4:1009px;
