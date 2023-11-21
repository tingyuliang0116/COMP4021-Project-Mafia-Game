const Socket = (function () {
    // This stores the current Socket.IO socket
    let socket = null;

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
            WaitingPanel.update(onlineUsers);
        });

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

    // This function disconnects the socket from the server
    const disconnect = function () {
        socket.disconnect();
        socket = null;
    };

    return {getSocket, connect, disconnect, ready, restart};
})();
