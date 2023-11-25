const PLAYER_SPRITE_WIDTH = 84;
const PLAYER_SPRITE_HEIGHT = 128;
const PLAYER_HEIGHT = 50;
const PLAYER_WIDTH = 37;
const PLAYER_START_X = 330;
const PLAYER_START_Y = 100;

let selfId = null
let selfTeam = null;
const player = {};
let otherPlayers = {};

let pressedKeys = [];
let config = {};
let onlineUsers = {};
const item = {width: 32, height: 32, path: "./item.png"};
const ghost = {width:1024, height: 163, path: './dead.png'}; //when the player is dead 
const players = {
    'mafia': {width: 84, height: 128, exist: false, path: './player.png'}, 
    'townPeople': {width: 166, height: 270, exist:false, path: '/player2.png'},
};

GameMap = (function () {
    function preload() {
        this.load.image('ship', './ship.png');
        this.load.spritesheet(`mafia`, players.mafia.path, {
            frameWidth: players.mafia.width,
            frameHeight: players.mafia.height,
        });
        this.load.spritesheet(`townPeople`, players.townPeople.path, {
            frameWidth: players.townPeople.width,
            frameHeight: players.townPeople.height,
        });
        this.load.spritesheet(`item`, item.path, {
            frameWidth: item.width,
            frameHeight: item.height,
            });
    }

    function create() {
        const ship = this.add.image(0, 0, 'ship');
        otherPlayers = this.add.group();
        Object.values(onlineUsers).forEach((user) => {
            if (user.playerId === selfId) { 
                if (user.team === "Mafia") {
                    player.sprite = this.add.sprite(PLAYER_START_X, PLAYER_START_Y, 'mafia');
                    player.sprite.displayHeight = PLAYER_HEIGHT;
                    player.sprite.displayWidth = PLAYER_WIDTH;
                    selfTeam = 'mafia'
                } else {
                    player.sprite = this.add.sprite(PLAYER_START_X, PLAYER_START_Y, 'townPeople');
                    player.sprite.displayHeight = PLAYER_HEIGHT;
                    player.sprite.displayWidth = PLAYER_WIDTH;
                    selfTeam = 'townPeople'
                }
            }
            else {
                if (user.team === "Mafia") {
                    const otherPlayerSprite = this.add.sprite(PLAYER_START_X, PLAYER_START_Y, `mafia`);
                    otherPlayerSprite.displayHeight = PLAYER_HEIGHT;
                    otherPlayerSprite.displayWidth = PLAYER_WIDTH;
                    otherPlayerSprite.playerId = user.playerId
                    otherPlayerSprite.team = 'mafia'
                    otherPlayers.add(otherPlayerSprite)
                } else {
                    const otherPlayerSprite = this.add.sprite(PLAYER_START_X, PLAYER_START_Y, `townPeople`);
                    otherPlayerSprite.displayHeight = PLAYER_HEIGHT;
                    otherPlayerSprite.displayWidth = PLAYER_WIDTH;
                    otherPlayerSprite.playerId = user.playerId
                    otherPlayerSprite.team = 'townPeople'
                    otherPlayers.add(otherPlayerSprite)
                }
            }
        })
        this.add.sprite(PLAYER_START_X, PLAYER_START_Y + 100, 'item');

        this.anims.create({
            key: 'mafia_running',
            frames: this.anims.generateFrameNumbers('mafia'),
            frameRate: 24,
            reapeat: -1,
        });

        this.anims.create({
            key: 'townPeople_running',
            frames: this.anims.generateFrameNumbers(`townPeople`),
            frameRate: 24,
            reapeat: -1,
        });

        this.input.keyboard.on('keydown', (e) => {
            if (!pressedKeys.includes(e.code)) {
                pressedKeys.push(e.code);
            }
        });
        
        this.input.keyboard.on('keyup', (e) => {
            pressedKeys = pressedKeys.filter((key) => key !== e.code);
        });
    }

    function update() {
        this.scene.scene.cameras.main.centerOn(player.sprite.x, player.sprite.y);
        const playerMoved = movePlayer(pressedKeys, player.sprite);
        if (playerMoved) {
            Socket.playerMove({x: player.sprite.x, y: player.sprite.y, playerId: selfId});
            //try update item collected
            //Socket.collectItem()
            player.movedLastFrame = true;
        } else {
            if (player.movedLastFrame) {
                Socket.playerMoveEnd(selfId);
            }
            player.movedLastFrame = false;
        }
        animateMovement(pressedKeys, player.sprite, selfTeam);
        // Aninamte other player

        otherPlayers.getChildren().forEach((otherPlayer) => {
            if (otherPlayer.moving && !otherPlayer.anims.isPlaying) {
                otherPlayer.team == 'mafia' ? otherPlayer.play('mafia_running') : otherPlayer.play('townPeople_running');
            } else if (!otherPlayer.moving && otherPlayer.anims.isPlaying) {
                otherPlayer.team == 'mafia' ? otherPlayer.stop('mafia_running') : otherPlayer.stop('townPeople_running');
            }
        })
    }

    const getMap = function () {
        onlineUsers = Socket.getUsers();
        selfId = Socket.getSelfId();
        config = {
            type: Phaser.AUTO,
            parent: 'gameMap',
            width: 800,
            height: 450,
            scene: {
                preload: preload,
                create: create,
                update: update,
            },
        }
        return new Phaser.Game(config);
    };

    const otherPlayerMove = function ({x, y, playerId}) {
        otherPlayers.getChildren().forEach((otherPlayer) => {
            if(otherPlayer.playerId === playerId){
                if (otherPlayer.x > x) {
                    otherPlayer.flipX = true;
                } else if (otherPlayer.x < x) {
                    otherPlayer.flipX = false;
                }
                otherPlayer.x = x;
                otherPlayer.y = y;
                otherPlayer.moving = true;
            }
        })
    }

    const otherPlayerMoveEnd = function (playerId) {
        console.log('revieved moved');
        otherPlayers.getChildren().forEach((otherPlayer) => {
            if(otherPlayer.playerId === playerId){
                otherPlayer.moving = false;
            }
        })
    }

    return {getMap, otherPlayerMove, otherPlayerMoveEnd}

})();
