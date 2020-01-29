var positions = [362, 587, 817, 1045];
let gameObjectlvl2 = 25;
let speedlvl2 = 2;

class Level2 extends Phaser.Scene {
  constructor() {
    super({ key: 'Level2' });
  }

  preload() {

  }

  create() {
    //create game objects
    this.background = this.add.tileSprite(700, 350, config.width, config.height, 'road');

    switch (config.carColor) {
      case 'yellow':
        this.car = this.physics.add.sprite(817, 550, 'carSpriteYellow');
        var carSprite = 'carSpriteYellow';
        break;
      case 'green':
        this.car = this.physics.add.sprite(817, 550, 'carSpriteGreen');
        var carSprite = 'carSpriteGreen';
        break;
      case 'red':
        this.car = this.physics.add.sprite(817, 550, 'carSpriteRed');
        var carSprite = 'carSpriteRed';
        break;
      case 'purple':
        this.car = this.physics.add.sprite(817, 550, 'carSpritePurple');
        var carSprite = 'carSpritePurple';
        break;
      case 'orange':
        this.car = this.physics.add.sprite(817, 550, 'carSpriteOrange');
        var carSprite = 'carSpriteOrange';
        break;
      case 'blue':
        this.car = this.physics.add.sprite(817, 550, 'carSpriteBlue');
        var carSprite = 'carSpriteBlue';
        break;
    }
    this.top = this.physics.add.image(1300, 50, 'top');
    this.platforms = this.physics.add.group();

    //animations for the car, used when the car moves left or right
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers(carSprite, { start: 1, end: 2 }),
      frameRate: 4,
      loop: false
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers(carSprite, { start: 3, end: 2 }),
      frameRate: 4,
      loop: false
    });

    //make coin and obstacle group (need/easier for collision physics)
    this.coins = this.physics.add.group();
    this.obstacles = this.physics.add.group();

    //map generation
    //spawn x amount of random coins and obstacles with x = gameObjects variable
    for (var i = 0; i <= gameObjectlvl2; i++) {
      let randomValue = Math.random();
      let YvalueNew = Yvalue - i * obstacleGap;
      let randomx = positions[Math.floor(Math.random() * positions.length)];
      if (i < gameObjectlvl2) {
        // console.log(i, gameObjectlvl2, randomValue);
        if (randomValue <= 0.2) {
          //make coin
          var coin = this.physics.add.sprite(randomx, YvalueNew, 'coin');
          this.coins.add(coin);
        }
        if (randomValue > 0.2 && randomValue <= 0.3) {
          //make obstacle variant #1 (rock)
          var rock = this.physics.add.sprite(randomx, YvalueNew, 'rock');
          this.obstacles.add(rock);
        }
        if (randomValue > 0.3 && randomValue <= 0.36) {
          //make obstacle + coin scene #1
          let roadblock = this.physics.add.sprite(362, YvalueNew, 'roadblock');
          let roadblock2 = this.physics.add.sprite(817, YvalueNew, 'roadblock');
          let coin = this.physics.add.sprite(587, YvalueNew, 'coin');
          this.coins.add(coin);
          this.obstacles.add(roadblock);
          this.obstacles.add(roadblock2);
        }
        if (randomValue > 0.36 && randomValue <= 0.43) {
          //make obstacle + coin scene #2
          let cone = this.physics.add.sprite(587, YvalueNew, 'cone');
          let cone2 = this.physics.add.sprite(1045, YvalueNew, 'cone');
          let coin = this.physics.add.sprite(817, YvalueNew, 'coin');
          this.coins.add(coin);
          this.obstacles.add(cone);
          this.obstacles.add(cone2);
        }
        if (randomValue > 0.43 && randomValue <= 0.5) {
          //make obstacle + coin scene #3
          let rock = this.physics.add.sprite(362, YvalueNew, 'rock');
          let coin = this.physics.add.sprite(587, YvalueNew, 'coin');
          this.coins.add(coin);
          this.obstacles.add(rock);
        }
        if (randomValue > 0.5 && randomValue <= 0.55) {
          //make obstacle + coin scene #4
          let roadblock = this.physics.add.sprite(1045, YvalueNew, 'roadblock');
          let coin = this.physics.add.sprite(362, YvalueNew, 'coin');
          this.coins.add(coin);
          this.obstacles.add(roadblock);
        }
        if (randomValue > 0.55 && randomValue <= 0.6) {
          //make obstacle + coin scene #5
          let rock = this.physics.add.sprite(587, YvalueNew, 'rock');
          let coin = this.physics.add.sprite(817, YvalueNew, 'coin');
          this.coins.add(coin);
          this.obstacles.add(rock);
        }
        if (randomValue > 0.6 && randomValue <= 0.65) {
          //make obstacle + coin scene #6
          let cone = this.physics.add.sprite(817, YvalueNew, 'cone');
          let coin = this.physics.add.sprite(1045, YvalueNew, 'coin');
          this.coins.add(coin);
          this.obstacles.add(cone);
        }
        if (randomValue > 0.65 && randomValue <= 0.7) {
          //make obstacle + coin scene #7
          let cone = this.physics.add.sprite(587, YvalueNew, 'cone');
          let coin = this.physics.add.sprite(1045, YvalueNew, 'coin');
          this.coins.add(coin);
          this.obstacles.add(cone);
        }
        if (randomValue > 0.7 && randomValue <= 0.76) {
          //make obstacle coin scene #8
          let roadblock = this.physics.add.sprite(817, YvalueNew, 'roadblock');
          let coin = this.physics.add.sprite(362, YvalueNew, 'coin');
          this.coins.add(coin);
          this.obstacles.add(roadblock);
        }
        if (randomValue > 0.76 && randomValue <= 0.8) {
          //make obstacle variant #2 (cone)
          var cone = this.physics.add.sprite(randomx, YvalueNew, 'cone');
          this.obstacles.add(cone);
        }
        if (randomValue > 0.8 && randomValue <= 0.85) {
          //make obstacle variant #3 (roadblock)
          var roadblock = this.physics.add.sprite(randomx, YvalueNew, 'roadblock');
          this.obstacles.add(roadblock);
        }
        if (randomValue > 0.85 && randomValue <= 0.9) {
          //make 2 obstacles scene #1
          let cone = this.physics.add.sprite(587, YvalueNew, 'cone');
          let cone2 = this.physics.add.sprite(817, YvalueNew, 'cone');
          this.obstacles.add(cone);
          this.obstacles.add(cone2);
        }
        if (randomValue > 0.9 && randomValue <= 0.95) {
          //make 2 obstacles scene #2
          let roadblock = this.physics.add.sprite(1045, YvalueNew, 'roadblock');
          let cone = this.physics.add.sprite(362, YvalueNew, 'cone');
          this.obstacles.add(cone);
          this.obstacles.add(roadblock);
        }
        if (randomValue > 0.95 && randomValue <= 1) {
          //make 3 obstacles scene #1
          let roadblock = this.physics.add.sprite(1045, YvalueNew, 'roadblock');
          let cone = this.physics.add.sprite(817, YvalueNew, 'cone');
          let cone2 = this.physics.add.sprite(362, YvalueNew, 'cone');
          this.obstacles.add(cone);
          this.obstacles.add(cone2);
          this.obstacles.add(roadblock);
        }
      } else {
        this.platforms.create(702, YvalueNew, 'finish');
      }
    }

    //inputs from keyboard or makey makey
    this.input.keyboard.on(
      'keydown_W',
      function(event) {
        if (this.car.x == 587) {
          //console.log(this.car.x);
          this.car.anims.play('left');
          var tween = this.tweens.add(
            {
              targets: this.car,
              x: 362,
              y: 550,
              duration: 250,
              ease: 'linear'
            },
            this
          );
        }
      },
      this
    );

    this.input.keyboard.on(
      'keydown_Z',
      function(event) {
        if (this.car.x == 587) {
          //console.log(this.car.x);
          this.car.anims.play('left');
          var tween = this.tweens.add(
            {
              targets: this.car,
              x: 362,
              y: 550,
              duration: 250,
              ease: 'linear'
            },
            this
          );
        }
      },
      this
    );

    this.input.keyboard.on(
      'keydown_A',
      function(event) {
        if (this.car.x == 362) {
          this.car.anims.play('right');
          var tween = this.tweens.add(
            {
              targets: this.car,
              x: 587,
              y: 550,
              duration: 250,
              ease: 'linear'
            },
            this
          );
        }
        if (this.car.x == 817) {
          this.car.anims.play('left');
          var tween = this.tweens.add(
            {
              targets: this.car,
              x: 587,
              y: 550,
              duration: 250,
              ease: 'linear'
            },
            this
          );
        }
      },
      this
    );

    this.input.keyboard.on(
      'keydown_Q',
      function(event) {
        if (this.car.x == 362) {
          this.car.anims.play('right');
          var tween = this.tweens.add(
            {
              targets: this.car,
              x: 587,
              y: 550,
              duration: 250,
              ease: 'linear'
            },
            this
          );
        }
        if (this.car.x == 817) {
          this.car.anims.play('left');
          var tween = this.tweens.add(
            {
              targets: this.car,
              x: 587,
              y: 550,
              duration: 250,
              ease: 'linear'
            },
            this
          );
        }
      },
      this
    );

    this.input.keyboard.on(
      'keydown_S',
      function(event) {
        if (this.car.x == 587) {
          this.car.anims.play('right');
          var tween = this.tweens.add(
            {
              targets: this.car,
              x: 817,
              y: 550,
              duration: 250,
              ease: 'linear'
            },
            this
          );
        }
        if (this.car.x == 1045) {
          this.car.anims.play('left');
          var tween = this.tweens.add(
            {
              targets: this.car,
              x: 817,
              y: 550,
              duration: 250,
              ease: 'linear'
            },
            this
          );
        }
      },
      this
    );

    this.input.keyboard.on(
      'keydown_D',
      function(event) {
        if (this.car.x == 817) {
          this.car.anims.play('right');
          var tween = this.tweens.add(
            {
              targets: this.car,
              x: 1045,
              y: 550,
              duration: 250,
              ease: 'linear'
            },
            this
          );
        }
      },
      this
    );

    this.physics.add.collider(this.coins, this.top, function(top, coin) {
      coin.destroy();
      //gives points for collecting coins
      points += 10;
      // console.log(points);
      DomScore.innerHTML = `Score: ${points}`;
      //reset velocity after collision
      top.setVelocity(0);
    });

    this.physics.add.overlap(this.car, this.coins, coinCollisionHandler, null, this);

    this.physics.add.collider(this.car, this.obstacles, function(car, obstacle) {
      obstacle.destroy();
      if (points != 0) {
        points -= 10;
      }
      DomScore.innerHTML = `Score: ${points}`;
      car.setVelocityY(0);
    });

    this.physics.add.overlap(this.car, this.platforms, collisionHandler, null, this);

    this.events.on('pause', function() {
      // console.log('Level 2 paused');
      points += 20;
      DomScore.innerHTML = `Score: ${points}`;
      getVragen();
    });
  }

  //move obstacle function
  moveObstacle(obstacle, speedlvl2) {
    obstacle.y += speedlvl2;
    if (obstacle.y > config.height) {
      this.resetObstacle(obstacle);
    }
  }

  DestroyAtBottom(element) {
    if (element.y > config.height) {
      element.destroy();
      // console.log('destroy');
    }
  }

  //this is a loop, so dont put too much in it because it will run it a lot
  update() {
    //make coins obstacles and finish line move at the same speedlvl2 as the background
    Phaser.Actions.Call(this.coins.getChildren(), function(go) {
      go.y += speedlvl2;
    });

    Phaser.Actions.Call(this.obstacles.getChildren(), function(go) {
      go.y += speedlvl2;
    });

    Phaser.Actions.Call(this.platforms.getChildren(), function(go) {
      go.y += speedlvl2;
    });
    //moving background
    this.background.tilePositionY -= speedlvl2;

    //stop obstacles and coins from moving down when bottom of the screen is reached to prevent lag
    this.obstacles.children.entries.find(function(obstacle) {
      //console.log(obstacle.body.y);
      if (obstacle.body.y > 700) {
        obstacle.body.destroy();
      }
    });

    this.coins.children.entries.find(function(coin) {
      if (coin.body.y > 700) {
        coin.body.destroy();
      }
    });
  }
}

function collisionHandler(car, finish) {
  this.scene.pause();
}

function coinCollisionHandler(car, coin) {
  this.physics.moveToObject(coin, this.top, 2000);

  //make it so the car doesnt move after a collision
  car.setVelocityY(0);
}

//position 1: 362px, position 2 = 587px, position 3: 817px, position 4:1045px; +- correct :p
