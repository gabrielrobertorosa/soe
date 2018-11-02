let letter,
    sortedWord,
    arrayOfWord = [''],
    arrayOfUnderscore = [],
    underscoreWord = "",
    triesNumber = 3,
    faceTheBoss,
    congrats,
    placeholder = " _";
arrayOfLetters = [];


function sort() {
    let randonPosition = Math.floor((Math.random() * arrayOfWord.length));
    sortedWord = arrayOfWord[randonPosition];
    arrayOfUnderscore = [];
    arrayOfWord.splice(randonPosition, 1);
    arrayOfLetters = sortedWord.split('');
    for (let i = 0; i < arrayOfLetters.length; i++) {
        arrayOfUnderscore.push(placeholder);
    }
    word.render(arrayOfUnderscore.toString().replace(/[,]/g, ""));
};

function changeUnderscore(letter) {
    let position = arrayOfUnderscore.indexOf(placeholder);
    if (position != -1) {
        arrayOfUnderscore[position] = " " + letter;
        word.render(arrayOfUnderscore.toString().replace(/[,]/g, ""));
    }
}

function sortLetters() {
    if (arrayOfLetters.length == 0) return;
    let qtd = arrayOfLetters.length;
    const sort = Math.floor(Math.random() * qtd);
    const letter = arrayOfLetters[sort];
    arrayOfLetters.splice(sort, 1);
    changeUnderscore(letter);
    if (arrayOfLetters.length == 0) {
        openModal();
    }
    return letter;
};

function openModal() {
    game.paused = true;
    $(".modal").modal();
    $("#typedWord").focus();
    showTries();
}

function validateWord() {
    //caso erre
    if ($("#typedWord").val().toLowerCase() == sortedWord.toLowerCase()) {
        game.paused = false;
        score += 10000;
        scoreText.render();
        $(".modal").modal('hide');
        resetAllWordState();
        congrats = game.add.bitmapText(game.world.centerX, game.world.centerY, 'spacefont', 'Congratulations', 100);
        congrats.x = congrats.x - congrats.textWidth / 2;
        congrats.y = congrats.y - congrats.textHeight / 3;
        game.time.events.add(2000, function () {
                game.add.tween(congrats).to({ y: 0 }, 1500, Phaser.Easing.Linear.None, true);
                game.add.tween(congrats).to({ alpha: 0 }, 1500, Phaser.Easing.Linear.None, true);
            }, this);
        $("#typedWord").val("");
        player.health = 100;
        shields.render();
    } else {
        $("#typedWord").val("");
        showTries();
    }
}

function showTries() {
    if (triesNumber > 0) {
        $("#tries").show().html(`${triesNumber} tentativas`);
        triesNumber--;
    } else {
        $("#tries").html("");
        $("#tries").hide();
        triesNumber = 3;
        $(".modal").modal('hide');
        game.paused = false;
        faceTheBoss = game.add.bitmapText(game.world.centerX, game.world.centerY, 'spacefont', 'FACE THE BOSS!!!', 100);
        faceTheBoss.x = faceTheBoss.x - faceTheBoss.textWidth / 2;
        faceTheBoss.y = faceTheBoss.y - faceTheBoss.textHeight / 3;
        game.time.events.add(2000, function () {
                game.add.tween(faceTheBoss).to({ y: 0 }, 1500, Phaser.Easing.Linear.None, true); 
                game.add.tween(faceTheBoss).to({ alpha: 0 }, 1500, Phaser.Easing.Linear.None, true); 
            }, this);
        game.time.events.add(2000, function () {
            bossLaunched = true;
            launchBoss();
        });
    }
}

function resetAllWordState() {
    triesNumber = 3;
    arrayOfUnderscore = [];
    underscoreWord = "";
    arrayOfLetters = [];
    sort();
}

$(document).ready(function() {
    $("#typedWord").keyup(function(e){
        if(e.which == 13) {
            validateWord();
        }
    });
});