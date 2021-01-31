const Discord = require("discord.js");
const {token} = require('./config.json');
const client = new Discord.Client;

var board = [[0,0,0],[0,0,0],[0,0,0]];
const finishedBoard = [[1,2,3],[4,5,6],[7,8,9]];
var player;


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
    playGameCommand(receivedMessage);
})


//TODO
function playGameCommand(receivedMessage) {

    do {
        initBoard();
    } while (!isBoardSolvable())

    printBoard(receivedMessage);

}

function initBoard() {

    for (i = 0; i < 3; i++) {
        for (j = 0; j < 3; j++) {
            console.log(i + ' ' + j);
            board[i][j] = getUniqueAndRandomNum();
            console.log(i + ' ' + j);
        }
    }
}

//TODO- prints the board
function printBoard(receivedMessage) {

    let boardToBePrinted =  '| ' + getNum(0, 0) + ' | ' + getNum(0, 1) + ' | ' + getNum(0, 2) + ' |' + '\n' + 
                            '| ' + getNum(1, 0) + ' | ' + getNum(1, 1) + ' | ' + getNum(1, 2) + ' |' + '\n' + 
                            '| ' + getNum(2, 0) + ' | ' + getNum(2, 1) + ' | ' + getNum(2, 2) + ' |';

    let embededBoard = new Discord.MessageEmbed()
        .setColor('#000000')
        .setDescription(boardToBePrinted);

    receivedMessage.channel.send(embededBoard);

}

function getNum(i, j) {

    let output;

    if (board[i][j] == 9) output = ' ';
    else output = board[i][j].toString();

    return output;
}

function getUniqueAndRandomNum() {

    let x;

    do {
        x = Math.floor(Math.random() * (9 - 1) + 1);
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
    receivedMessage.channel.send('completed');
}


client.login(token);
