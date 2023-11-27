const Socket = (function () {
    // This stores the current Socket.IO socket
    let socket = null;
    let users = {};
    // let selfId = null;
    // This function gets the socket from the module
    const getSocket = function () {
        return socket;
    };

    // This function connects the server and initializes the socket
    const connect = function () {
        socket = io();

        // Wait for the socket to connect successfully
        socket.on("connect", () => {
            // Get the online user list
            socket.emit("get users");
        });
        socket.on("game start", (onlineUsers) => {
            onlineUsers = JSON.parse(onlineUsers);
            users = onlineUsers
            WaitingPanel.update(onlineUsers);
        });
        socket.on("move", ({x, y, playerId}) => {
            GameMap.otherPlayerMove({x, y, playerId})
        });

        socket.on("moveEnd", (playerId) => {
            GameMap.otherPlayerMoveEnd(playerId)
        });

        socket.on("collect item", (item) => {
            GameMap.otherPlayerCollectItem(item)
        });
        //receive game end notice
        socket.on("game end", (winningTeam) => {
            gameOverPanel.show(winningTeam, users)
        })
    };
    const ready = function () {
        if (socket && socket.connected) {
            socket.emit("ready");
        }
    }
    const restart = function () {
        if (socket && socket.connected) {
            socket.emit("restart");
        }
    }

    const getUsers = function () {
        console.log(users)
        return users
    }

    const getSelfId = function () {
        return socket.id
    }
    // This function disconnects the socket from the server
    const disconnect = function () {
        socket.disconnect();
        socket = null;
    };
    const playerMove = function ({x, y, playerId}) {
        if (socket && socket.connected) {
            socket.emit("move", {x, y, playerId});
        }
    };
    const playerMoveEnd = function (playerId) {
        if (socket && socket.connected) {
            socket.emit("moveEnd", playerId);
        }
    };

    const collectItem = function (item) {
        if (socket && socket.connected) {
            socket.emit("collect item", item);
        }
    }

    const killPlayer = function () {
        if (socket && socket.connected) {
            socket.emit("kill player");
        }
    }

    return {getSocket, connect, disconnect, ready, restart, getUsers, getSelfId, playerMove, playerMoveEnd, collectItem, killPlayer};
})();
