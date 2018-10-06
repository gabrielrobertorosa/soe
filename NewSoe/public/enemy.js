function startEnemy() {
    greenEnemies = game.add.group();
    greenEnemies.enableBody = true;
    greenEnemies.physicsBodyType = Phaser.Physics.ARCADE;
    greenEnemies.createMultiple(5, 'enemy-green');
    greenEnemies.setAll('anchor.x', 0.5);
    greenEnemies.setAll('anchor.y', 0.5);
    greenEnemies.setAll('scale.x', 0.5);
    greenEnemies.setAll('scale.y', 0.5);
    greenEnemies.setAll('angle', 180);
    greenEnemies.forEach(function (enemy) {
        addEnemyEmitterTrail(enemy);
        enemy.body.setSize(enemy.width * 3 / 4, enemy.height * 3 / 4);
        enemy.damageAmount = 20;
        enemy.events.onKilled.add(function () {
            enemy.trail.kill();
        });
    });
    game.time.events.add(1000, launchGreenEnemy);
}

function launchGreenEnemy() {
    var ENEMY_SPEED = 300;
  
    var enemy = greenEnemies.getFirstExists(false);
    if (enemy) {
      enemy.reset(game.rnd.integerInRange(0, game.width), -20);
      enemy.body.velocity.x = game.rnd.integerInRange(-300, 300);
      enemy.body.velocity.y = ENEMY_SPEED;
      enemy.body.drag.x = 100;
  
      enemy.trail.start(false, 800, 1);
  
      //  Update function for each enemy ship to update rotation etc
      enemy.update = function () {
        enemy.angle = 180 - game.math.radToDeg(Math.atan2(enemy.body.velocity.x, enemy.body.velocity.y));
  
        enemy.trail.x = enemy.x;
        enemy.trail.y = enemy.y - 10;
  
        //  Kill enemies once they go off screen
        if (enemy.y > game.height + 200) {
          enemy.kill();
          enemy.y = -20;
        }
      }
    }
  
    //  Send another enemy soon
    greenEnemyLaunchTimer = game.time.events.add(game.rnd.integerInRange(greenEnemySpacing, greenEnemySpacing + 1000), launchGreenEnemy);
  }