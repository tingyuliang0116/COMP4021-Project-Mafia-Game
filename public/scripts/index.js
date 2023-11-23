const PLAYER_SPRITE_WIDTH = 84;
const PLAYER_SPRITE_HEIGHT = 128;
const PLAYER_HEIGHT = 50;
const PLAYER_WIDTH = 37;
const PLAYER_START_X = 330;
const PLAYER_START_Y = 100;

const player = {};
const otherPlayer = {};
let pressedKeys = [];


GameMap = (function () {
    const config = {
        type: Phaser.AUTO,
        parent: 'gameMap',
        width: 800,
        height: 450,

        scene: {
            preload: preload,
            create: create,
            update: update,
        },
    };

// const game = new Phaser.Game(config);;

    function preload() {
        this.load.image('ship', './ship.png');
        this.load.spritesheet('player', './player.png', {
            frameWidth: PLAYER_SPRITE_WIDTH,
            frameHeight: PLAYER_SPRITE_HEIGHT,
        });
        this.load.spritesheet('otherPlayer', './player.png', {
            frameWidth: PLAYER_SPRITE_WIDTH,
            frameHeight: PLAYER_SPRITE_HEIGHT,
        });
    }

    function create() {
        const ship = this.add.image(0, 0, 'ship');
        player.sprite = this.add.sprite(PLAYER_START_X, PLAYER_START_Y, 'player');
        player.sprite.displayHeight = PLAYER_HEIGHT;
        player.sprite.displayWidth = PLAYER_WIDTH;
        otherPlayer.sprite = this.add.sprite(
            PLAYER_START_X,
            PLAYER_START_Y,
            'otherPlayer',
        );
        otherPlayer.sprite.displayHeight = PLAYER_HEIGHT;
        otherPlayer.sprite.displayWidth = PLAYER_WIDTH;

        this.anims.create({
            key: 'running',
            frames: this.anims.generateFrameNumbers('player'),
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
            Socket.playerMove({x: player.sprite.x, y: player.sprite.y});
            player.movedLastFrame = true;
        } else {
            if (player.movedLastFrame) {
                Socket.playerMoveEnd();
            }
            player.movedLastFrame = false;
        }
        animateMovement(pressedKeys, player.sprite);
        // Aninamte other player
        if (otherPlayer.moving && !otherPlayer.sprite.anims.isPlaying) {
            otherPlayer.sprite.play('running');
        } else if (!otherPlayer.moving && otherPlayer.sprite.anims.isPlaying) {
            otherPlayer.sprite.stop('running');
        }
    }

    const getMap = function () {
        return new Phaser.Game(config);
    };

    const otherPlayerMove = function ({x, y}) {
        console.log('revieved move');
        if (otherPlayer.sprite.x > x) {
            otherPlayer.sprite.flipX = true;
        } else if (otherPlayer.sprite.x < x) {
            otherPlayer.sprite.flipX = false;
        }
        otherPlayer.sprite.x = x;
        otherPlayer.sprite.y = y;
        otherPlayer.moving = true;
    }

    const otherPlayerMoveEnd = function () {
        console.log('revieved moveend');
        otherPlayer.moving = false;
    }

    return {getMap, otherPlayerMove, otherPlayerMoveEnd}

})();
