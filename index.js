const Discord = require("discord.js");
const {token} = require('./config.json');
const client = new Discord.Client;

var player;
let board = [[0,0,0],[0,0,0],[0,0,0]];;
let finishedBoard = [[1,2,3],[4,5,6],[7,8,9]];

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
    
    if (receivedMessage.content == '8play'){

        if (player == undefined) {
            player = receivedMessage.author.id;
        } else if (player != receivedMessage.author.id) {
            receivedMessage.channel.send('The game is already being played by <@' + player + '> \nPlease wait');
        }

        printRules(receivedMessage);
        playGameCommand(receivedMessage, player);
    } else return;
})


//TODO 
function playGameCommand (receivedMessage, player) {

    initBoard();
    console.log(board);
    printBoard();

    if (isBoardSolved()) {
        boardSolved(originalBoard)
        player = undefined;
    }
    
}


function isBoardSolved() {

    for (i = 0; i < 3; i++) {
        for (j = 0; j < 3; j++) {
            if (board[i][j] != finishedBoard[i][j]) {
                return false;
            }
        }
    }
    return true;
}

function isBoardSolvable() {

    var arr;
    let a = 0;
    let numOfInversions = 0;

    for (i = 0; i < 3; i++) {
        for (j = 0; j < 3; j++) {
            if (board[i][j] != 9) {
                arr[a] = board[i][j];
                a++;
            }
        }
    }

	for (first = 0; first < arr.len; first++) {
		for (second = first + 1; second < arr.len; second++) {
			if (arr[second] < arr[first]) {
				numOfInversions++;
			}
		}
	}

	if (numOfInversions%2 == 0) {
		return true;
	} else {
        return false;
    }
}

function findPositionOfNum(x) {
    var positionI;
    var positionJ;
    let flag = false;

    for (i = 0; i < 3; i++) {
        for (j = 0; j < 3; j++) {
            if (board[i][j] == x) {
                positionI = i;
                positionJ = j;
                flag = true;
                break;
            }
        }
        if (flag == true) {
            break;
        }
    }
    return {
        posI: positionI,
        posJ: positionJ
    };
}

function findPositionOfGap() {return findPositionOfNum(0);}

function getNum(i, j) {

    var output;

    if (board[i][j] == 9) {
        output = ' ';
    } else {
        output = board[i][j].toString();
    }
    return output;
}

function initBoard() {

	for (i = 0; i < 3; i++) {
		for (j = 0; j < 3; j++) {
            board[i][j] = getUniqueAndRandomNum();
            console.log('1');
		}
	}
}

function printBoard(receivedMessage) {

    let boardMessage = new Discord.MessageEmbed()
        .setColor('#000000')
        .setDescription(getNum(board, 0, 0) + ' | ' + getNum(board, 0, 0) + ' | ' + getNum(board, 0, 0) + '\n' +
                        getNum(board, 0, 0) + ' | ' + getNum(board, 0, 0) + ' | ' + getNum(board, 0, 0) + '\n' +
                        getNum(board, 0, 0) + ' | ' + getNum(board, 0, 0) + ' | ' + getNum(board, 0, 0));

    receivedMessage.channel.send(boardMessage);
}

function getUniqueAndRandomNum() {

    let x = Math.floor(Math.random() * (9 - 1) + 1);

    if (!isAlreadyPresent(x)) {
        return x;
    } else {
        return getUniqueAndRandomNum();
    }
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

//TODO 
function boardSolved(originalBoard) {

}

//TODO 
function printRules(receivedMessage) {

    let rulesMessage = new Discord.MessageEmbed()
        .setColor('#000000')
        .setTitle('8-Puzzle: RULES')
        .setAuthor('8-Puzzle Bot', 'https://i.imgur.com/wSTFkRM.png')
        .setDescription('Rules for playing the 8-puzzle')
        .addFields(
        );

    receivedMessage.channel.send(rulesMessage);
}


client.login(token);
