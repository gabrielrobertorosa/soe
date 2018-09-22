var game = new Phaser.Game(800,600,Phaser.CANVAS, 'gameDiv');

var spacefield;

var backgroundv; 

var player;

var cursors;

var bullets;
var bulletTime =0;
var fireButton;

var enemies;

var specialEnemies;

var score = 0;
var scoreText;
var winText;


var letter;
var arrayOfWord = ['thunder'];
var arrayOfLetters=[];
var mainState = {
	preload:function(){
		game.load.image('starfield', "assets/spacefield.png");
		game.load.image('player', "assets/spaceship.png");
		game.load.image('bullet', "assets/bullet.png");
		game.load.image('enemy', "assets/enemy.png");
		game.load.image('specialEnemy', "assets/specialEnemy.png");
	},

	create:function(){
		sort();
		spacefield = game.add.tileSprite(0,0,800,600,'starfield');

		backgroundv = 1;//velocidade do background

		player = game.add.sprite(game.world.centerX,game.world.centerY + 200, 'player');//starta o player

		game.physics.enable(player, Phaser.Physics.ARCADE);

		cursors = game.input.keyboard.createCursorKeys();

		bullets = game.add.group();
		bullets.enableBody = true;
		bullets.physicsBodyType=Phaser.Physics.ARCADE;
		bullets.createMultiple(30, 'bullet');
		bullets.setAll('anchor.x',0.5);
		bullets.setAll('anchor.y',1);
		bullets.setAll('outOfBoundsKill', true);
		bullets.setAll('checkWorldBounds', true);

		fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR); 

		specialEnemies = game.add.group();
		specialEnemies.enableBody = true;
		specialEnemies.physicsBodyType = Phaser.Physics.ARCADE;

		enemies = game.add.group();
		enemies.enableBody = true;
		enemies.physicsBodyType = Phaser.Physics.ARCADE;


		for (var cont = 0; cont < arrayOfLetters.length ; cont++){
			var URL = "./assets/square.png";
		  	var img = new Image();
		  	img.src = URL;
		 	document.body.appendChild(img);
		  	//return img;
		}
		createEnemies();

		createLetterEnemies();

		scoreText = game.add.text(0,550, 'Score: ', {font: '32px sans', fill: '#FFF'});
		winText = game.add.text(game.world.centerX, game.world.centerY, 'YOU WIN!!!' , {font: '32px sans', fill: '#FFF'});
		winText.visible = false;
		},

	update:function(){

		game.physics.arcade.overlap(bullets,enemies,collisionHandler,null,this);

		game.physics.arcade.overlap(bullets,specialEnemies,specialCollisionHandler,null,this);

		player.body.velocity.x = 0;//reseta o movimento quando a tecla é solta

		player.body.velocity.y = 0;//reseta o movimento quando a tecla é solta

		spacefield.tilePosition.y += backgroundv;//movimento do background com a velocidade

		if (cursors.left.isDown)
		{
			player.body.velocity.x = -350;
		}

		if (cursors.right.isDown)
		{
			player.body.velocity.x = 350;
		}

		if (cursors.up.isDown)
		{
			player.body.velocity.y = -350;
		}

		if (cursors.down.isDown)
		{
			player.body.velocity.y = 350;
		}

		if(fireButton.isDown)
		{
			fireBullet();
		}

		scoreText.text = 'Score: ' + score;

		if (score == 2400){
			winText.visible=true;
			scoreText.visible=false;
		}
	}
} 


function sort(){
	var word = arrayOfWord[0];
	arrayOfLetters = word.split('');
}
function sortLetters(){
	var qtd = arrayOfLetters.length;
	for(var i =0; i< qtd; i++){
		const sort = Math.floor(Math.random() * qtd);
		const letter = arrayOfLetters[sort];
		arrayOfLetters.splice(sort,1);
		return letter;
	}
}

function fireBullet(){
	if(game.time.now > bulletTime){
		bullet = bullets.getFirstExists(false);

		if (bullet){
			bullet.reset(player.x + 26, player.y);
			bullet.body.velocity.y = -400;
			bulletTime = game.time.now + 100;
		}
	}
}

function createEnemies(){
	for (var y = 0; y < 2; y++){
		for (var x=0; x < 8; x++){
			var enemy = enemies.create(x*70, y*50, 'enemy');
			enemy.anchor.setTo(0.5,0.5);
		}
	}
	enemies.x = 100;
	enemies.y = 50;

	var tween = game.add.tween(enemies).to({x:200}, 2000, Phaser.Easing.Linear.None,true,0,1000,true);

	//tween.onLoop.add(descend,this);
	tween.onRepeat.add(descend,this);
}

function createLetterEnemies(){
	for (var y = 0; y < 1; y++){
		for (var x=0; x < 8; x++){
			var enemy = specialEnemies.create(x*70, y*100, 'specialEnemy');
			enemy.anchor.setTo(0.5,1.5);
		}
	}

	specialEnemies.x = 100;
	specialEnemies.y = 50;

	var tween = game.add.tween(specialEnemies).to({x:200}, 2000, Phaser.Easing.Linear.None,true,0,1000,true);

	//tween.onLoop.add(descend,this);
	tween.onRepeat.add(descendLetterEnemies,this);
}

function descend(){
	enemies.y+=10;
}

function descendLetterEnemies(){
	specialEnemies.y+=10;
}



function collisionHandler(bullet, enemy){
	bullet.kill();
	enemy.kill();
	score += 100;
}

function specialCollisionHandler(bullet, specialEnemy){
	//debugger;
	bullet.kill();
	specialEnemy.kill();
	score += 100;
	var l = sortLetters();
	console.log(l);

}
game.state.add('mainState',mainState);
game.state.start('mainState');