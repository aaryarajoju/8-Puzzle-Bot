const Discord = require("discord.js");
const {token} = require('./config.json');
const client = new Discord.Client;

var board = [[0,0,0],[0,0,0],[0,0,0]];
const finishedBoard = [[1,2,3],[4,5,6],[7,8,9]];
var player = undefined;
var numOfSteps = 0;
var dir = 0;
var msg;

const upArrowEmoji = '⬆️';
const downArrowEmoji = '⬇️';
const rightArrowEmoji = '➡️';
const leftArrowEmoji = '⬅️';


client.once('ready', () => {
    console.log("The bot is online! Connected as " + client.user.tag);
    client.user.setActivity("you play", {type: "WATCHING"});
   });
client.once('reconnecting', () => {
    console.log("The bot is reconnecting! Reconnecting as " + client.user.tag);
   });
client.once('disconnect', () => {
    console.log("The bot is disconnected!");
   });

client.on('message', (receivedMessage) => {
    if (receivedMessage.author == client.user) return;

    if (receivedMessage.content.toLowerCase() == '8help') return helpCommand(receivedMessage);

    if (receivedMessage.content.toLowerCase() == '8rules') return rulesCommand(receivedMessage);

    if (player == undefined) {
        if (receivedMessage.content.toLowerCase() == '8play') {
            player = receivedMessage.author.id;
            newGameCommand(receivedMessage);
        }
    } else if (receivedMessage.author.id == player) {

        if (receivedMessage.content.toLowerCase() == '8stop') return endGameCommand(receivedMessage);

        numOfSteps++;
        playGameCommand(receivedMessage);
    } else {
        receivedMessage.channel.send('The game is already being played by <@' + player + '> \nPlease wait');
    }
})

client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;
    if (user.id != player) return;

    const userReactions = reaction.message.reactions.cache.filter(reaction => reaction.users.cache.has(player));
    try {
        for (const reaction of userReactions.values()) {
            await reaction.users.remove(player);
        }
    } catch (error) {
        console.error('Failed to remove reactions.');
    }

    numOfSteps++;

    if (reaction.emoji.name === upArrowEmoji) {
        dir = 1;
        playGameThroughReactionsCommand(reaction.message);
    } else if (reaction.emoji.name === downArrowEmoji) {
        dir = 2;
        playGameThroughReactionsCommand(reaction.message);
    } else if (reaction.emoji.name === rightArrowEmoji) {
        dir = 3;
        playGameThroughReactionsCommand(reaction.message);
    } else if (reaction.emoji.name === leftArrowEmoji) {
        dir = 4;
        playGameThroughReactionsCommand(reaction.message);
    } else {
        reaction.message.channel.send('wrong reaction').then(msg => {msg.delete({ timeout: 2500 })}).catch();
    }
})


function rulesCommand(receivedMessage) {

    let rulesMessage = new Discord.MessageEmbed()
    .setColor('#000000')
    .setTitle('8-Puzzle: RULES')
    .setAuthor('8-Puzzle Bot', 'https://i.imgur.com/CWJFeUo.png')
    .setDescription('1. Send `U` or `UP` or react with ⬆️, to move a number UP into the blank\n' + 
                    '2. Send `D` or `DOWN` or react with ⬇️, to move a number DOWN into the blank\n' + 
                    '3. Send `R` or `RIGHT` or react with ➡️, to move a number RIGHT into the blank\n' + 
                    '4. Send `L` or `LEFT` or react with ⬅️, to move a number LEFT into the blank\n' + 
                    '5. To complete the game, make the board into: \n ' + printFinishedBoard());

    receivedMessage.channel.send(rulesMessage);
}

function helpCommand(receivedMessage) {
    let helpMessage = new Discord.MessageEmbed()
    .setColor('#000000')
    .setTitle('8-Puzzle')
    .setAuthor('8-Puzzle Bot', 'https://i.imgur.com/CWJFeUo.png')
    .setDescription('Hello! I am the 8-Puzzle Bot, made by <@700638629596233739>\n\n' +
                    'To play the game, type `8play`\n' +
                    'To stop the game in between, type `8stop`\n' +
                    'To see the rules, type `8rules`\n' +
                    '\nAs always, have fun!');

    receivedMessage.channel.send(helpMessage);
}

function endGameCommand(receivedMessage) {
    msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
    
    receivedMessage.channel.send('Game Ended');

    board = [[0,0,0],[0,0,0],[0,0,0]];
    player = undefined;
    msg = undefined;
    numOfSteps = 0;
    dir = 0;
}

function printFinishedBoard() {
    let finishedPuzzleBoard =   ':one: :two: :three: \n' +
                                ':four: :five: :six: \n' +
                                ':seven: :eight: :blue_square:';

    return finishedPuzzleBoard;
}

//TODO
function newGameCommand(receivedMessage) {

    let rulesMessage = new Discord.MessageEmbed()
        .setColor('#000000')
        .setTitle('8-Puzzle: RULES')
        .setAuthor('8-Puzzle Bot', 'https://i.imgur.com/CWJFeUo.png')
        .setDescription('1. Send `U` or `UP` or react with ⬆️, to move a number UP into the blank\n' + 
                        '2. Send `D` or `DOWN` or react with ⬇️, to move a number DOWN into the blank\n' + 
                        '3. Send `R` or `RIGHT` or react with ➡️, to move a number RIGHT into the blank\n' + 
                        '4. Send `L` or `LEFT` or react with ⬅️, to move a number LEFT into the blank\n' + 
                        '5. To complete the game, make the board into: \n ' + printFinishedBoard());

    receivedMessage.channel.send(rulesMessage);

    board = [[0,0,0],[0,0,0],[0,0,0]];

    do {
        initBoard();
    } while (!isBoardSolvable())

    printBoard(receivedMessage);
}

//TODO
function playGameCommand(receivedMessage) {

    let i, j, num;

    receivedMessage.delete({ timeout: 1000 });

    if (receivedMessage.content.toLowerCase() == 'up' || receivedMessage.content.toLowerCase() == 'u') {
        dir = 1;
    } else if (receivedMessage.content.toLowerCase() == 'down' || receivedMessage.content.toLowerCase() == 'd') {
        dir = 2;
    } else if (receivedMessage.content.toLowerCase() == 'right' || receivedMessage.content.toLowerCase() == 'r') {
        dir = 3;
    } else if (receivedMessage.content.toLowerCase() == 'left' || receivedMessage.content.toLowerCase() == 'l') {
        dir = 4;
    } else {
        receivedMessage.channel.send('INVALID MOVE').then(msg => {msg.delete({ timeout: 2500 })}).catch();
    }

    positionOfGapI = findPositionOfGap().posI;
    positionOfGapJ = findPositionOfGap().posJ;

    if (positionOfGapI == 2 && dir == 1) {
        receivedMessage.channel.send('INVALID MOVE').then(msg => {msg.delete({ timeout: 2500 })}).catch();
        printBoard(receivedMessage);
        return;
    }
    if (positionOfGapI == 0 && dir == 2) {
        receivedMessage.channel.send('INVALID MOVE').then(msg => {msg.delete({ timeout: 2500 })}).catch();
        printBoard(receivedMessage);
        return;
    }
    if (positionOfGapJ == 0 && dir == 3) {
        receivedMessage.channel.send('INVALID MOVE').then(msg => {msg.delete({ timeout: 2500 })}).catch();
        printBoard(receivedMessage);
        return;
    }
    if (positionOfGapJ == 2 && dir == 4) {
        receivedMessage.channel.send('INVALID MOVE').then(msg => {msg.delete({ timeout: 2500 })}).catch();
        printBoard(receivedMessage);
        return;
    }

    switch (dir) {
        case 1:
            i = positionOfGapI + 1;
            j = positionOfGapJ;
            num = board[i][j];
            board[positionOfGapI][positionOfGapJ] = num;
            board[i][j] = 9;
            break;
        
        case 2:
            i = positionOfGapI - 1;
            j = positionOfGapJ;
            num = board[i][j];
            board[positionOfGapI][positionOfGapJ] = num;
            board[i][j] = 9;
            break;

        case 3:
            i = positionOfGapI;
            j = positionOfGapJ - 1;
            num = board[i][j];
            board[positionOfGapI][positionOfGapJ] = num;
            board[i][j] = 9;
            break;

        case 4:
            i = positionOfGapI;
            j = positionOfGapJ + 1;
            num = board[i][j];
            board[positionOfGapI][positionOfGapJ] = num;
            board[i][j] = 9;
            break;
    
        default:
            break;
    }

    dir = 0;

    printBoard(receivedMessage);

    if (isBoardSolved()){
        boardSolved(receivedMessage);
    }
}

//TODO
function playGameThroughReactionsCommand(message) {

    let i, j, num;

    positionOfGapI = findPositionOfGap().posI;
    positionOfGapJ = findPositionOfGap().posJ;

    if (positionOfGapI == 2 && dir == 1) {
        message.channel.send('INVALID MOVE').then(msg => {msg.delete({ timeout: 2500 })}).catch();
        printBoard(message);
        return;
    }
    if (positionOfGapI == 0 && dir == 2) {
        message.channel.send('INVALID MOVE').then(msg => {msg.delete({ timeout: 2500 })}).catch();
        printBoard(message);
        return;
    }
    if (positionOfGapJ == 0 && dir == 3) {
        message.channel.send('INVALID MOVE').then(msg => {msg.delete({ timeout: 2500 })}).catch();
        printBoard(message);
        return;
    }
    if (positionOfGapJ == 2 && dir == 4) {
        message.channel.send('INVALID MOVE').then(msg => {msg.delete({ timeout: 2500 })}).catch();
        printBoard(message);
        return;
    }

    switch (dir) {
        case 1:
            i = positionOfGapI + 1;
            j = positionOfGapJ;
            num = board[i][j];
            board[positionOfGapI][positionOfGapJ] = num;
            board[i][j] = 9;
            break;
        
        case 2:
            i = positionOfGapI - 1;
            j = positionOfGapJ;
            num = board[i][j];
            board[positionOfGapI][positionOfGapJ] = num;
            board[i][j] = 9;
            break;

        case 3:
            i = positionOfGapI;
            j = positionOfGapJ - 1;
            num = board[i][j];
            board[positionOfGapI][positionOfGapJ] = num;
            board[i][j] = 9;
            break;

        case 4:
            i = positionOfGapI;
            j = positionOfGapJ + 1;
            num = board[i][j];
            board[positionOfGapI][positionOfGapJ] = num;
            board[i][j] = 9;
            break;
    
        default:
            break;
    }

    dir = 0;

    printBoard(message);

    if (isBoardSolved()){
        boardSolved(message);
    }
}

function initBoard() {
    for (i = 0; i < 3; i++) {
        for (j = 0; j < 3; j++) {
            let a = i;
            let b = j;
            (board[i][j]) = getUniqueAndRandomNum();
            i = a;
            j = b;
        }
    }
}

//TODO- prints the board
async function printBoard(receivedMessage) {

    let boardToBePrinted =  getNum(0, 0) + getNum(0, 1) + getNum(0, 2)  + '\n' + 
                            getNum(1, 0) + getNum(1, 1) + getNum(1, 2)  + '\n' + 
                            getNum(2, 0) + getNum(2, 1) + getNum(2, 2) ;


    if (msg == undefined) {
        msg = await receivedMessage.channel.send(boardToBePrinted);
        msg.react(upArrowEmoji);
        msg.react(downArrowEmoji);
        msg.react(rightArrowEmoji);
        msg.react(leftArrowEmoji);

    } else {
        msg.edit(boardToBePrinted);
    }

}

function getNum(i, j) {

    let output;

    let num = board[i][j];

    switch (num) {
        
        case 1:
            output = ':one:'
            break;
        case 2:
            output = ':two:'
            break;
        case 3:
            output = ':three:'
            break;
        case 4:
            output = ':four:'
            break;
        case 5:
            output = ':five:'
            break;
        case 6:
            output = ':six:'
            break;
        case 7:
            output = ':seven:'
            break;
        case 8:
            output = ':eight:'
            break;
        case 9:
            output = ':blue_square:'
            break;
    }

    return output;
}

function getUniqueAndRandomNum() {

    let x;

    do {
        x = Math.floor((Math.random() * 9) + 1);
    } while (isAlreadyPresent(x))
    
    return x;
}

function isAlreadyPresent(x) {

    for (i = 0; i < 3; i++) {
        for (j = 0; j < 3; j++) {
            if (board[i][j] == x) {
                return true;
            }
        }
    }
    return false;
}

function isBoardSolved() {

    for (i = 0; i < 3; i++) {
        for (j = 0; j < 3; j++) {
            if (board[i][j] != finishedBoard[i][j]) return false;
        }
    }
    return true;
}

function findPositionOfGap() {
    return findPositionOfNum(9);
}

function findPositionOfNum(x) {
    
    let positionI, positionJ;

    for (i = 0; i < 3; i++) {
        for (j = 0; j < 3; j++) {
            if (board[i][j] == x) {
                positionJ = j;
                positionI = i;
                return {
                    posI: positionI,
                    posJ: positionJ
                };
            }
        }
    }
}

function isBoardSolvable() {

    let arr = [0,0,0,0,0,0,0,0];
    let numOfInversions = 0;
    let a = 0;

    for (i = 0; i < 3; i++) {
        for (j = 0; j < 3; j++) {
            if (board[i][j] != 9) {
                arr[a] = board[i][j];
                a++;
            }
        }
    }    

    for (first = 0; first < arr.length; first++) {
        for (second = (first + 1); second < arr.length; second++) {
            if (arr[second] < arr[first]) {
                numOfInversions++;
            }
        }
    }

    if (numOfInversions%2 == 0) return true;
    else return false;
}

//TODO- print that the board is solved and the game has ended
function boardSolved(receivedMessage) {

    msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
    
    let boardFinishedMessage = new Discord.MessageEmbed()
    .setColor('#000000')
    .setTitle('COMPLETED!')
    .setDescription('Congratuations! You\'ve finished the board, it took you `' + numOfSteps + '` steps to complete.');

    receivedMessage.channel.send(boardFinishedMessage);

    board = [[0,0,0],[0,0,0],[0,0,0]];
    player = undefined;
    msg = undefined;
    numOfSteps = 0;
    dir = 0;
}


client.login(token);
