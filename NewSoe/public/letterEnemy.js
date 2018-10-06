function startLetterEnemy() {
    blueEnemies = game.add.group();
    blueEnemies.enableBody = true;
    blueEnemies.physicsBodyType = Phaser.Physics.ARCADE;
    blueEnemies.createMultiple(30, 'enemy-blue');
    blueEnemies.setAll('anchor.x', 0.5);
    blueEnemies.setAll('anchor.y', 0.5);
    blueEnemies.setAll('scale.x', 0.5);
    blueEnemies.setAll('scale.y', 0.5);
    blueEnemies.setAll('angle', 180);
    blueEnemies.forEach(function (enemy) {
        enemy.damageAmount = 40;
    });
}

function startBulletLetterEnemy() {
    blueEnemyBullets = game.add.group();
    blueEnemyBullets.enableBody = true;
    blueEnemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    blueEnemyBullets.createMultiple(30, 'blueEnemyBullet');
    blueEnemyBullets.callAll('crop', null, { x: 90, y: 0, width: 90, height: 70 });
    blueEnemyBullets.setAll('alpha', 0.9);
    blueEnemyBullets.setAll('anchor.x', 0.5);
    blueEnemyBullets.setAll('anchor.y', 0.5);
    blueEnemyBullets.setAll('outOfBoundsKill', true);
    blueEnemyBullets.setAll('checkWorldBounds', true);
    blueEnemyBullets.forEach(function (enemy) {
        enemy.body.setSize(20, 20);
    });
}

function launchBlueEnemy() {
    var startingX = game.rnd.integerInRange(100, game.width - 100);
    var verticalSpeed = 180;
    var spread = 60;
    var frequency = 70;
    var verticalSpacing = 70;
    var numEnemiesInWave = 5;
  
    //  Launch wave
    for (var i = 0; i < numEnemiesInWave; i++) {
      var enemy = blueEnemies.getFirstExists(false);
      if (enemy) {
        enemy.startingX = startingX;
        enemy.reset(game.width / 2, -verticalSpacing * i);
        enemy.body.velocity.y = verticalSpeed;
  
        //  Set up firing
        var bulletSpeed = 400;
        var firingDelay = 2000;
        enemy.bullets = 1;
        enemy.lastShot = 0;
  
        //  Update function for each enemy
        enemy.update = function () {
          //  Wave movement
          this.body.x = this.startingX + Math.sin((this.y) / frequency) * spread;
  
          //  Squish and rotate ship for illusion of "banking"
          bank = Math.cos((this.y + 60) / frequency)
          this.scale.x = 0.5 - Math.abs(bank) / 8;
          this.angle = 180 - bank * 2;
  
          //  Fire
          enemyBullet = blueEnemyBullets.getFirstExists(false);
          if (enemyBullet &&
            this.alive &&
            this.bullets &&
            this.y > game.width / 8 &&
            game.time.now > firingDelay + this.lastShot) {
            this.lastShot = game.time.now;
            this.bullets--;
            enemyBullet.reset(this.x, this.y + this.height / 2);
            enemyBullet.damageAmount = this.damageAmount;
            var angle = game.physics.arcade.moveToObject(enemyBullet, player, bulletSpeed);
            enemyBullet.angle = game.math.radToDeg(angle);
          }
  
          //  Kill enemies once they go off screen
          if (this.y > game.height + 200) {
            this.kill();
            this.y = -20;
          }
        };
      }
    }
    //  Send another wave soon
    blueEnemyLaunchTimer = game.time.events.add(game.rnd.integerInRange(blueEnemySpacing, blueEnemySpacing + 4000), launchBlueEnemy);
  }