function bigExplosionBoss() {
    bossDeath = game.add.emitter(boss.x, boss.y);
    bossDeath.width = boss.width / 2;
    bossDeath.height = boss.height / 2;
    bossDeath.makeParticles('explosion', [0, 1, 2, 3, 4, 5, 6, 7], 20);
    bossDeath.setAlpha(0.9, 0, 900);
    bossDeath.setScale(0.3, 1.0, 0.3, 1.0, 1000, Phaser.Easing.Quintic.Out);
}

function launchBoss() {
    boss.reset(game.width / 2, -boss.height);
    booster.start(false, 1000, 10);
    boss.health = 501;
    bossBulletTimer = game.time.now + 5000;
}

function bossHitTest(boss, bullet) {
    if ((bullet.x > boss.x + boss.width / 5 &&
        bullet.y > boss.y) ||
        (bullet.x < boss.x - boss.width / 5 &&
            bullet.y > boss.y)) {
        return false;
    } else {
        return true;
    }
}

function createBoss() {
    boss = game.add.sprite(0, 0, 'boss');
    boss.exists = false;
    boss.alive = false;
    boss.anchor.setTo(0.5, 0.5);
    boss.damageAmount = 50;
    boss.angle = 180;
    boss.scale.x = 0.6;
    boss.scale.y = 0.6;
    game.physics.enable(boss, Phaser.Physics.ARCADE);
    boss.body.maxVelocity.setTo(100, 80);
    boss.dying = false;
}

function setBossConfiguration() {
    boss.finishOff = function () {
        if (!boss.dying) {
            boss.dying = true;
            bossDeath.x = boss.x;
            bossDeath.y = boss.y;
            bossDeath.start(false, 1000, 50, 20);
            //  kill boss after explotions
            game.time.events.add(1000, function () {
                var explosion = explosions.getFirstExists(false);
                var beforeScaleX = explosions.scale.x;
                var beforeScaleY = explosions.scale.y;
                var beforeAlpha = explosions.alpha;
                explosion.reset(boss.body.x + boss.body.halfWidth, boss.body.y + boss.body.halfHeight);
                explosion.alpha = 0.4;
                explosion.scale.x = 3;
                explosion.scale.y = 3;
                var animation = explosion.play('explosion', 30, false, true);
                animation.onComplete.addOnce(function () {
                    explosion.scale.x = beforeScaleX;
                    explosion.scale.y = beforeScaleY;
                    explosion.alpha = beforeAlpha;
                });
                boss.kill();
                booster.kill();
                boss.dying = false;
                bossDeath.on = false;
                //  queue next boss
                bossLaunchTimer = game.time.events.add(game.rnd.integerInRange(bossSpacing, bossSpacing + 5000), launchBoss);
            });

            //  reset pacing for other enemies
            blueEnemySpacing = 2500;
            greenEnemySpacing = 1000;

            //  give some bonus health
            player.health = Math.min(100, player.health + 40);
            shields.render();
        }
    };

    //  Boss death ray
    function addRay(leftRight) {
        var ray = game.add.sprite(leftRight * boss.width * 0.75, 0, 'deathRay');
        ray.alive = false;
        ray.visible = false;
        boss.addChild(ray);
        ray.crop({ x: 0, y: 0, width: 40, height: 40 });
        ray.anchor.x = 0.5;
        ray.anchor.y = 0.5;
        ray.scale.x = 2.5;
        ray.damageAmount = boss.damageAmount;
        game.physics.enable(ray, Phaser.Physics.ARCADE);
        ray.body.setSize(ray.width / 5, ray.height / 4);
        ray.update = function () {
            this.alpha = game.rnd.realInRange(0.6, 1);
        };
        boss['ray' + (leftRight > 0 ? 'Right' : 'Left')] = ray;
    }
    addRay(1);
    addRay(-1);
    //  need to add the ship texture to the group so it renders over the rays
    var ship = game.add.sprite(0, 0, 'boss');
    ship.anchor = { x: 0.5, y: 0.5 };
    boss.addChild(ship);

    boss.fire = function () {
        if (game.time.now > bossBulletTimer) {
            var raySpacing = 3000;
            var chargeTime = 1500;
            var rayTime = 1500;

            function chargeAndShoot(side) {
                ray = boss['ray' + side];
                ray.name = side
                ray.revive();
                ray.y = 80;
                ray.alpha = 0;
                ray.scale.y = 13;
                game.add.tween(ray).to({ alpha: 1 }, chargeTime, Phaser.Easing.Linear.In, true).onComplete.add(function (ray) {
                    ray.scale.y = 150;
                    game.add.tween(ray).to({ y: -1500 }, rayTime, Phaser.Easing.Linear.In, true).onComplete.add(function (ray) {
                        ray.kill();
                    });
                });
            }
            chargeAndShoot('Right');
            chargeAndShoot('Left');

            bossBulletTimer = game.time.now + raySpacing;
        }
    };

    boss.update = function () {
        if (!boss.alive) return;

        boss.rayLeft.update();
        boss.rayRight.update();

        if (boss.y > 140) {
            boss.body.acceleration.y = -50;
        }
        if (boss.y < 140) {
            boss.body.acceleration.y = 50;
        }
        if (boss.x > player.x + 50) {
            boss.body.acceleration.x = -50;
        } else if (boss.x < player.x - 50) {
            boss.body.acceleration.x = 50;
        } else {
            boss.body.acceleration.x = 0;
        }

        //  Squish and rotate boss for illusion of "banking"
        var bank = boss.body.velocity.x / MAXSPEED;
        boss.scale.x = 0.6 - Math.abs(bank) / 3;
        boss.angle = 180 - bank * 20;

        booster.x = boss.x + -5 * bank;
        booster.y = boss.y + 10 * Math.abs(bank) - boss.height / 2;

        //  fire if player is in target
        var angleToPlayer = game.math.radToDeg(game.physics.arcade.angleBetween(boss, player)) - 90;
        var anglePointing = 180 - Math.abs(boss.angle);
        if (anglePointing - angleToPlayer < 18) {
            boss.fire();
        }
    }
}

function setBossBooster() {
    booster = game.add.emitter(boss.body.x, boss.body.y - boss.height / 2);
    booster.width = 0;
    booster.makeParticles('blueEnemyBullet');
    booster.forEach(function (p) {
        p.crop({ x: 120, y: 0, width: 45, height: 50 });
        //  clever way of making 2 exhaust trails by shifing particles randomly left or right
        p.anchor.x = game.rnd.pick([1, -1]) * 0.95 + 0.5;
        p.anchor.y = 0.75;
    });
    booster.setXSpeed(0, 0);
    booster.setRotation(0, 0);
    booster.setYSpeed(-30, -50);
    booster.gravity = 0;
    booster.setAlpha(1, 0.1, 400);
    booster.setScale(0.3, 0, 0.7, 0, 5000, Phaser.Easing.Quadratic.Out);
    boss.bringToTop();
}