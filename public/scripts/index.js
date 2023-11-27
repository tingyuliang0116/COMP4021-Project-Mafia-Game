const PLAYER_SPRITE_WIDTH = 84;
const PLAYER_SPRITE_HEIGHT = 128;
const PLAYER_HEIGHT = 50;
const PLAYER_WIDTH = 37;
const PLAYER_START_X = 330;
const PLAYER_START_Y = 100;
const ITEM_PATH = './item.png';
let selfId = null
let selfTeam = null;
const player = {};
let otherPlayers = {};
let pressedKeys = [];
let config = {};
let onlineUsers = {};
let item_location = [[-30, 250], [-800, 0], [-300, -320], [-500, -510], [620, -200], [-588, 522], [896, -126], [-382, -48], [470, -294], [628, 152]];
let items;
let canKill = false;
let resetCanKill;
let targetTownPeopleId = null;

const item = {
    item1: {width: 32, height: 32, count: 4, timing: 200, loop: true, path: './item/item1.png'},
    item2: {width: 32, height: 32, count: 4, timing: 200, loop: true, path: './item/item2.png'},
    item3: {width: 32, height: 32, count: 4, timing: 200, loop: true, path: './item/item3.png'},
    item4: {width: 32, height: 32, count: 4, timing: 200, loop: true, path: './item/item4.png'},
    item5: {width: 32, height: 32, count: 4, timing: 200, loop: true, path: './item/item5.png'},
    item6: {width: 32, height: 32, count: 4, timing: 200, loop: true, path: './item/item6.png'},
    item7: {width: 32, height: 32, count: 4, timing: 200, loop: true, path: './item/item7.png'},
    item8: {width: 32, height: 32, count: 4, timing: 200, loop: true, path: './item/item8.png'},
};
const ghost = {width: 1024, height: 163, path: './dead.png'}; //when the player is dead
const players = {
    'mafia': {width: 84, height: 128, exist: false, path: './player.png'}, 
    'townPeople': {width: 166, height: 270, exist:false, path: '/player2.png'},
    'ghost': {width: 84, height: 128, exist:false, path: '/dead.png'},
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
        this.load.spritesheet(`item1`, item.item1.path, {
            frameWidth: item.item1.width,
            frameHeight: item.item1.height,
        });
        this.load.spritesheet(`item2`, item.item2.path, {
            frameWidth: item.item2.width,
            frameHeight: item.item2.height,
        });
        this.load.spritesheet(`item3`, item.item3.path, {
            frameWidth: item.item3.width,
            frameHeight: item.item3.height,
        });
        this.load.spritesheet(`item4`, item.item4.path, {
            frameWidth: item.item4.width,
            frameHeight: item.item4.height,
        });
        this.load.spritesheet(`item5`, item.item5.path, {
            frameWidth: item.item5.width,
            frameHeight: item.item5.height,
        });
        this.load.spritesheet(`item6`, item.item6.path, {
            frameWidth: item.item6.width,
            frameHeight: item.item6.height,
        });
        this.load.spritesheet(`item7`, item.item7.path, {
            frameWidth: item.item7.width,
            frameHeight: item.item7.height,
        });
        this.load.spritesheet(`item8`, item.item8.path, {
            frameWidth: item.item8.width,
            frameHeight: item.item8.height,
        });
        this.load.image(`ghost`, players.ghost.path);
    }

    function create() {
        let users = Socket.getUsers();
        let user_no = Object.keys(users).length;
        let no_of_items = (user_no - 1) * 2;
        console.log(no_of_items);
        const item_index = ['item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item7', 'item8'];
        const ship = this.add.image(0, 0, 'ship');
        otherPlayers = this.physics.add.group();
        Object.values(onlineUsers).forEach((user) => {
            if (user.playerId === selfId) {  // if user id is the same 
                if (user.team === "Mafia") {
                    player.sprite = this.physics.add.sprite(PLAYER_START_X, PLAYER_START_Y, 'mafia');
                    player.sprite.displayHeight = PLAYER_HEIGHT;
                    player.sprite.displayWidth = PLAYER_WIDTH;
                    selfTeam = 'mafia'
                } else {
                    player.sprite = this.physics.add.sprite(PLAYER_START_X, PLAYER_START_Y, 'townPeople');
                    player.sprite.displayHeight = PLAYER_HEIGHT;
                    player.sprite.displayWidth = PLAYER_WIDTH;
                    selfTeam = 'townPeople'
                }
            } else { // if other user id
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

        if (selfTeam === 'townPeople') {
            items = this.physics.add.staticGroup();
            for (let i = item_index.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [item_index[i], item_index[j]] = [item_index[j], item_index[i]];
            }
            for (let i = item_location.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [item_location[i], item_location[j]] = [item_location[j], item_location[i]];
            }
            for (let i = 0; i < no_of_items; i++) {
                const item = this.add.sprite(item_location[i][0], item_location[i][1], item_index[i]);
                item.name = item_index[i];
                items.add(item);
            }

            this.physics.add.overlap(player.sprite, items, collectItem, null, this);

        } else if (selfTeam === 'mafia') {
            this.physics.add.overlap(player.sprite, otherPlayers, canKillTownPeople, null, this);
        }

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
                if (e.code === 'KeyE') {
                    PLAYER_SPEED = 4
                }
            }
        });

        this.input.keyboard.on('keyup', (e) => {
            pressedKeys = pressedKeys.filter((key) => key !== e.code);
            if (e.code === 'KeyE') {
                PLAYER_SPEED = 2
            }
            if ( e.code === 'KeyD' && canKill) {
                killTownPeople();
            }
        });
    }

    function update() {
        this.scene.scene.cameras.main.centerOn(player.sprite.x, player.sprite.y);
        if (player.sprite.active) {
            const playerMoved = movePlayer(pressedKeys, player.sprite);
            if (playerMoved) {
                Socket.playerMove({x: player.sprite.x, y: player.sprite.y, playerId: selfId});
                player.movedLastFrame = true;
            } else {
                if (player.movedLastFrame) {
                    Socket.playerMoveEnd(selfId);
                }
                player.movedLastFrame = false;
            }
            animateMovement(pressedKeys, player.sprite, selfTeam);
        }
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
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: 0
                }
            },
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
            if (otherPlayer.playerId === playerId) {
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
        otherPlayers.getChildren().forEach((otherPlayer) => {
            if (otherPlayer.playerId === playerId) {
                otherPlayer.moving = false;
            }
        })
    }

    const collectItem = function (player, item) {
        Socket.collectItem(item.name);
        sounds.collect.play();
        setTimeout(function () {
            sounds.collect.pause();
            sounds.collect.currentTime = 0;
            sounds.background.currentTime = 0;
        }, 1000);
        items.killAndHide(item);
        item.body.enable = false;
    }

    const otherPlayerCollectItem = function (collectItem) {
        if (selfTeam === 'townPeople') {
            items.getChildren().forEach((item) => {
                if (item.name === collectItem) {
                    items.killAndHide(item);
                    item.body.enable = false;
                }
            })
        }
    }

    const canKillTownPeople = function (mafia, townPeople) {
        if (townPeople.body.gameObject.active) { 
            clearTimeout(resetCanKill)
            canKill = true
            targetTownPeopleId = townPeople.playerId
            resetCanKill = setTimeout(function() {canKill = false, targetTownPeopleId = null}, 100)
        }
    }

    const killTownPeople = function() {
        Socket.killPlayer(targetTownPeopleId);
        otherPlayers.getChildren().forEach((otherPlayer) => {
            if(otherPlayer.playerId === targetTownPeopleId){
                otherPlayer.body.gameObject.active = false;
                otherPlayer.setTexture('ghost')
            }
        })
    }       
    
    const otherPlayerGetKilled = function (playerId) {
        if (playerId === selfId) {
            player.sprite.body.gameObject.active = false;
            player.sprite.setTexture('ghost')
        }
        else {
            otherPlayers.getChildren().forEach((otherPlayer) => {
                if(otherPlayer.playerId === playerId){
                    otherPlayer.body.gameObject.active = false;
                    otherPlayer.setTexture('ghost')
                }
            })
        }
    }

    return {getMap, otherPlayerMove, otherPlayerMoveEnd, otherPlayerCollectItem, otherPlayerGetKilled}

})();
