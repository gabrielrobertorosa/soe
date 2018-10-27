var player,
  greenEnemies,
  blueEnemies,
  enemyBullets,
  starfield,
  cursors,
  bank,
  shipTrail,
  explosions,
  playerDeath,
  bullets,
  fireButton,
  bulletTimer = 0,
  shields,
  word,
  score = 0,
  scoreText,
  greenEnemyLaunchTimer,
  greenEnemySpacing = 1000,
  blueEnemyLaunchTimer,
  blueEnemyLaunched = false,
  blueEnemySpacing = 2500,
  gameOver,
  game,
  ACCLERATION = 600,
  DRAG = 400,
  MAXSPEED = 400;

var bossLaunchTimer,
  bossLaunched = false,
  bossSpacing = 20000,
  bossBulletTimer = 0,
  bossYdirection = -1;

jQuery.getJSON("words.json", function (data) {
  arrayOfWord = data.nouns;
  game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, 'canvasTest', { preload: preload, create: create, update: update, render: render });
});

function preload() {
  game.load.image("starfield", "./assets/starfield.png");
  game.load.image("ship", "./assets/spaceship.png");
  game.load.image("bullet1", "./assets/bullet1.png");
  game.load.image("bullet", "./assets/bullet.png");
  game.load.image('blueEnemyBullet', '/assets/enemy-blue-bullet.png');
  game.load.image("enemy-green", "/assets/enemy.png");
  game.load.image("enemy-blue", "/assets/specialEnemy.png");
  game.load.spritesheet("explosion", "/assets/explode.png", 128, 128);
  game.load.bitmapFont('spacefont', '/assets/font.png', '/assets/font.xml');
  game.load.image('boss', './assets/boss.png');
  game.load.image('deathRay', './assets/death-ray.png');
}

function create() {
  //  The scrolling starfield background
  starfield = game.add.tileSprite(0, 0, window.innerWidth, window.innerHeight, 'starfield');
  startBulletPlayer();
  startPlayer();
  startEnemy();
  startBulletLetterEnemy();
  startLetterEnemy();
  createBoss();
  setBossConfiguration();
  setBossBooster();
  
  cursors = game.input.keyboard.createCursorKeys();
  fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  
  startPlayerShipTrail();
  setExplosionPool();
  playerExplosion();
  bigExplosionBoss();

  
  //  Shields stat
  shields = game.add.bitmapText(game.world.width - 290, 10, 'spacefont', '' + player.health + '%', 30);
  shields.render = function () {
    shields.text = 'Shields ' + Math.max(player.health, 0) + '%';
  };
  shields.render();

  //  word stat
  word = game.add.bitmapText(10, window.innerHeight -90, 'spacefont', '_ _ _', 30, );
  word.render = function (x) {
    word.text = x;
  };
  //word.render("");
  
  //  Score
  scoreText = game.add.bitmapText(30, 10, 'spacefont', '', 30);
  scoreText.render = function () {
    scoreText.text = 'Score ' + score;
  };
  scoreText.render();
  
  //  Game over text
  gameOver = game.add.bitmapText(game.world.centerX, game.world.centerY, 'spacefont', 'GAME OVER!', 100);
  gameOver.x = gameOver.x - gameOver.textWidth / 2;
  gameOver.y = gameOver.y - gameOver.textHeight / 3;
  gameOver.visible = false;
  sort();
}

function update() {
  //  Scroll the background
  starfield.tilePosition.y += 2;

  //  Reset the player, then check for movement keys
  setPlayerMovement();

  //  Stop at screen edges
  if (player.x > game.width - 50) {
    player.x = game.width - 50;
    player.body.velocity.x = 0;
  }
  if (player.x < 50) {
    player.x = 50;
    player.body.velocity.x = 0;
  }

  //TODO: eixo y
  if (player.y > game.height - 50) {
    player.y = game.height - 50;
    player.body.velocity.y = 0;
  }
  if (player.y < 50) {
    player.y = 50;
    player.body.velocity.y = 0;
  }



  //  Fire bullet
  keepBullet();

  //  Keep the shipTrail lined up with the ship
  keepShipTrail();

  //  Check collisions
  game.physics.arcade.overlap(player, greenEnemies, shipCollide, null, this);
  game.physics.arcade.overlap(greenEnemies, bullets, hitEnemy, null, this);
  game.physics.arcade.overlap(player, blueEnemies, shipCollide, null, this);
  game.physics.arcade.overlap(blueEnemies, bullets, hitEnemy, null, this);
  game.physics.arcade.overlap(boss, bullets, hitEnemy, bossHitTest, this);
  game.physics.arcade.overlap(player, boss.rayLeft, enemyHitsPlayer, null, this);
  game.physics.arcade.overlap(player, boss.rayRight, enemyHitsPlayer, null, this);
  game.physics.arcade.overlap(blueEnemyBullets, player, enemyHitsPlayer, null, this);

  //  Game over?
  checkGameOver();
}

function render() { }

function addEnemyEmitterTrail(enemy) {
  var enemyTrail = game.add.emitter(enemy.x, player.y - 10, 100);
  enemyTrail.width = 10;
  enemyTrail.makeParticles('explosion', [1, 2, 3, 4, 5]);
  enemyTrail.setXSpeed(20, -20);
  enemyTrail.setRotation(50, -50);
  enemyTrail.setAlpha(0.4, 0, 800);
  enemyTrail.setScale(0.01, 0.1, 0.01, 0.1, 1000, Phaser.Easing.Quintic.Out);
  enemy.trail = enemyTrail;
}

function restart() {
  //  Reset the enemies
  greenEnemies.callAll('kill');
  game.time.events.remove(greenEnemyLaunchTimer);
  game.time.events.add(1000, launchGreenEnemy);
  blueEnemies.callAll('kill');
  blueEnemyBullets.callAll('kill');
  game.time.events.remove(blueEnemyLaunchTimer);
  boss.kill();
  booster.kill();
  game.time.events.remove(bossLaunchTimer);

  blueEnemies.callAll('kill');
  game.time.events.remove(blueEnemyLaunchTimer);
  //  Revive the player
  player.weaponLevel = 1;
  player.revive();
  player.health = 100;
  shields.render();
  score = 0;
  scoreText.render();

  //  Hide the text
  gameOver.visible = false;

  //  Reset pacing
  greenEnemySpacing = 1000;
  blueEnemyLaunched = false;
  bossLaunched = false;
  sort();
}

function setExplosionPool() {
  explosions = game.add.group();
  explosions.enableBody = true;
  explosions.physicsBodyType = Phaser.Physics.ARCADE;
  explosions.createMultiple(30, 'explosion');
  explosions.setAll('anchor.x', 0.5);
  explosions.setAll('anchor.y', 0.5);
  explosions.forEach(function (explosion) {
    explosion.animations.add('explosion');
  });
}

