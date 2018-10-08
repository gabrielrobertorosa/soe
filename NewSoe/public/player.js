function startPlayer() {
    player = game.add.sprite(400, 500, 'ship');
    //CHANGE 
    player.health = 100;
    player.anchor.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.weaponLevel = 1
    player.events.onKilled.add(function () {
        shipTrail.kill();
    });
    player.events.onRevived.add(function () {
        shipTrail.start(false, 5000, 10);
    });
}

function startBulletPlayer() {
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);
}

function startPlayerShipTrail() {
    //  Add an emitter for the ship's trail
    shipTrail = game.add.emitter(player.x, player.y + 10, 600);
    shipTrail.width = 15;
    shipTrail.makeParticles('bullet');
    shipTrail.setXSpeed(30, -30);
    shipTrail.setYSpeed(200, 180);
    shipTrail.setRotation(50, -50);
    shipTrail.setAlpha(1, 0.01, 800);
    shipTrail.setScale(0.05, 0.4, 0.05, 0.4, 2000, Phaser.Easing.Quintic.Out);
    shipTrail.start(false, 5000, 10);
}

function keepShipTrail() {
    shipTrail.x = player.x;
    shipTrail.y = player.y + 35;
}

function playerExplosion() {
    playerDeath = game.add.emitter(player.x, player.y);
    playerDeath.width = 50;
    playerDeath.height = 50;
    playerDeath.makeParticles('explosion', [0, 1, 2, 3, 4, 5, 6, 7], 10);
    playerDeath.setAlpha(0.9, 0, 800);
    playerDeath.setScale(0.1, 0.6, 0.1, 0.6, 1000, Phaser.Easing.Quintic.Out);
}

function enemyHitsPlayer(player, bullet) {
    bullet.kill();

    player.damage(bullet.damageAmount);
    shields.render()

    if (player.alive) {
        var explosion = explosions.getFirstExists(false);
        explosion.reset(player.body.x + player.body.halfWidth, player.body.y + player.body.halfHeight);
        explosion.alpha = 0.7;
        explosion.play('explosion', 30, false, true);
    } else {
        playerDeath.x = player.x;
        playerDeath.y = player.y;
        playerDeath.start(false, 1000, 10, 10);
    }
}

function hitEnemy(enemy, bullet) {
    var explosion = explosions.getFirstExists(false);
    explosion.reset(bullet.body.x + bullet.body.halfWidth, bullet.body.y + bullet.body.halfHeight);
    explosion.body.velocity.y = enemy.body.velocity.y;
    explosion.alpha = 0.7;
    explosion.play('explosion', 30, false, true);
    if (enemy.finishOff && enemy.health < 5) {
        enemy.finishOff();
    } else {
        enemy.damage(enemy.damageAmount);
    }
    bullet.kill();

    // Increase score
    score += enemy.damageAmount * 10;
    scoreText.render();

    //  Pacing

    //  Enemies come quicker as score increases
    greenEnemySpacing *= 0.9;

    //  Blue enemies come in after a score of 1000
    if (!blueEnemyLaunched && score > 1000) {
        blueEnemyLaunched = true;
        launchBlueEnemy();
        //  Slow green enemies down now that there are other enemies
        greenEnemySpacing *= 2;
    }

    //  Launch boss
    if (!bossLaunched && score > 15000) {
        greenEnemySpacing = 5000;
        blueEnemySpacing = 12000;
        //  dramatic pause before boss
        game.time.events.add(2000, function () {
            bossLaunched = true;
            launchBoss();
        });
    }

    //  Weapon upgrade
    if (score > 5000 && player.weaponLevel < 2) {
        player.weaponLevel = 2;
    }
}

function shipCollide(player, enemy) {
    enemy.kill();

    player.damage(enemy.damageAmount);
    shields.render();

    if (player.alive) {
        var explosion = explosions.getFirstExists(false);
        explosion.reset(player.body.x + player.body.halfWidth, player.body.y + player.body.halfHeight);
        explosion.alpha = 0.7;
        explosion.play('explosion', 30, false, true);
    } else {
        playerDeath.x = player.x;
        playerDeath.y = player.y;
        playerDeath.start(false, 1000, 10, 10);
    }
}

function fireBullet() {
    switch (player.weaponLevel) {
        case 1:
            //  To avoid them being allowed to fire too fast we set a time limit
            if (game.time.now > bulletTimer) {
                var BULLET_SPEED = 550;
                var BULLET_SPACING = 150;
                //  Grab the first bullet we can from the pool
                var bullet = bullets.getFirstExists(false);

                if (bullet) {
                    //  And fire it
                    //  Make bullet come out of tip of ship with right angle
                    var bulletOffset = 20 * Math.sin(game.math.degToRad(player.angle));
                    bullet.reset(player.x + bulletOffset, player.y);
                    bullet.angle = player.angle;
                    game.physics.arcade.velocityFromAngle(bullet.angle - 90, BULLET_SPEED, bullet.body.velocity);
                    bullet.body.velocity.x += player.body.velocity.x;

                    bulletTimer = game.time.now + BULLET_SPACING;
                }
            }
            break;

        case 2:
            if (game.time.now > bulletTimer) {
                var BULLET_SPEED = 550;
                var BULLET_SPACING = 250;


                for (var i = 0; i < 3; i++) {
                    var bullet = bullets.getFirstExists(false);
                    if (bullet) {
                        //  Make bullet come out of tip of ship with right angle
                        var bulletOffset = 20 * Math.sin(game.math.degToRad(player.angle));
                        bullet.reset(player.x + bulletOffset, player.y);
                        //  "Spread" angle of 1st and 3rd bullets
                        var spreadAngle;
                        if (i === 0) spreadAngle = -20;
                        if (i === 1) spreadAngle = 0;
                        if (i === 2) spreadAngle = 20;
                        bullet.angle = player.angle + spreadAngle;
                        game.physics.arcade.velocityFromAngle(spreadAngle - 90, BULLET_SPEED, bullet.body.velocity);
                        bullet.body.velocity.x += player.body.velocity.x;
                    }
                    bulletTimer = game.time.now + BULLET_SPACING;
                }
            }
    }
}

function keepBullet() {
    if (player.alive && (fireButton.isDown || game.input.activePointer.isDown)) {
        fireBullet();
    }
}

function setPlayerMovement() {
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    if (cursors.left.isDown) {
        player.body.velocity.x = -350;
    }

    if (cursors.right.isDown) {
        player.body.velocity.x = 350;
    }

    if (cursors.up.isDown) {
        player.body.velocity.y = -350;
    }

    if (cursors.down.isDown) {
        player.body.velocity.y = 350;
    }
}

function checkGameOver() {
    if (!player.alive && gameOver.visible === false) {
        gameOver.visible = true;
        gameOver.alpha = 0;
        var fadeInGameOver = game.add.tween(gameOver);
        fadeInGameOver.to({ alpha: 1 }, 1000, Phaser.Easing.Quintic.Out);
        fadeInGameOver.onComplete.add(setResetHandlers);
        fadeInGameOver.start();
        function setResetHandlers() {
            //  The "click to restart" handler
            tapRestart = game.input.onTap.addOnce(_restart, this);
            spaceRestart = fireButton.onDown.addOnce(_restart, this);
            function _restart() {
                tapRestart.detach();
                spaceRestart.detach();
                restart();
            }
        }
    }
}