var letter,
    sortedWord,
    arrayOfWord = [''],
    arrayOfUnderscore = [],
    underscoreWord = "",
    placeholder = " _";
arrayOfLetters = [];


function sort() {
    var randonPosition = Math.floor((Math.random() * arrayOfWord.length));
    sortedWord = arrayOfWord[randonPosition];
    arrayOfUnderscore = [];
    arrayOfWord.splice(randonPosition, 1);
    arrayOfLetters = sortedWord.split('');
    for (var i = 0; i < arrayOfLetters.length; i++) {
        arrayOfUnderscore.push(placeholder);        
    }
    word.render(arrayOfUnderscore.toString().replace(/[,]/g, ""));
};

function changeUnderscore(letter) {
    var position = arrayOfUnderscore.indexOf(placeholder);
    if (position != -1) {
        arrayOfUnderscore[position] = " " +letter;
        word.render(arrayOfUnderscore.toString().replace(/[,]/g, ""));
    }
}

function sortLetters() {
    if (arrayOfLetters.length == 0) return;
    var qtd = arrayOfLetters.length;
    const sort = Math.floor(Math.random() * qtd);
    const letter = arrayOfLetters[sort];   
    arrayOfLetters.splice(sort, 1);
    changeUnderscore(letter);
    return letter;
};

function setSquareLetters() {
    for (var cont = 0; cont < arrayOfLetters.length; cont++) {
        var URL = "./assets/square.png";
        var $img = $("<img>");
        $img.attr("src", URL).addClass(arrayOfLetters[cont]);
        document.body.appendChild($img[0]);
    }
};