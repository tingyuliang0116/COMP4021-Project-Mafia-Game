const sounds = {
    game: new Audio("game.mp3"),
    collect: new Audio("collection.mp3"),
    gameover: new Audio("gameover.mp3"),
    background: new Audio("background.mp3")
};
var startTime = null;
var endTime = null;
const SignInForm = (function () {
    // This function initializes the UI
    const initialize = function () {
        // Populate the avatar selection
        Avatar.populate($("#register-avatar"));

        // Hide it
        $("#signin-overlay").hide();

        // Submit event for the signin form
        $("#signin-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#signin-username").val().trim();
            const password = $("#signin-password").val().trim();

            // Send a signin request
            Authentication.signin(username, password,
                () => {
                    hide();
                    sounds.background.play();
                    UserPanel.update(Authentication.getUser());
                    UserPanel.show();
                    StartPanel.show();
                    WaitingPanel.hide();
                    statPanel.hide();
                    Socket.connect();
                },
                (error) => {
                    $("#signin-message").text(error);
                }
            );
        });

        // Submit event for the register form
        $("#register-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#register-username").val().trim();
            const avatar = $("#register-avatar").val();
            const name = $("#register-name").val().trim();
            const password = $("#register-password").val().trim();
            const confirmPassword = $("#register-confirm").val().trim();

            // Password and confirmation does not match
            if (password != confirmPassword) {
                $("#register-message").text("Passwords do not match.");
                return;
            }

            // Send a register request
            Registration.register(username, avatar, name, password,
                () => {
                    $("#register-form").get(0).reset();
                    $("#register-message").text("You can sign in now.");
                },
                (error) => {
                    $("#register-message").text(error);
                }
            );
        });
    };

    // This function shows the form
    const show = function () {
        $("#signin-overlay").fadeIn(500);
    };

    // This function hides the form
    const hide = function () {
        $("#signin-form").get(0).reset();
        $("#signin-message").text("");
        $("#register-message").text("");
        $("#signin-overlay").fadeOut(500);
    };

    return {initialize, show, hide};
})();

const UserPanel = (function () {
    // This function initializes the UI
    const initialize = function () {
        // Hide it
        $("#user-panel").hide();

        // Click event for the signout button
        $("#signout-button").on("click", () => {
            // Send a signout request
            Authentication.signout(
                () => {
                    Socket.disconnect();
                    sounds.background.pause();
                    hide();
                    StartPanel.hide();
                    WaitingPanel.hide();
                    statPanel.hide();
                    SignInForm.show();
                }
            );
        });
    };

    // This function shows the form with the user
    const show = function (user) {
        $("#user-panel").show();
    };

    // This function hides the form
    const hide = function () {
        $("#user-panel").hide();
    };

    // This function updates the user panel
    const update = function (user) {
        if (user) {
            $("#user-panel .user-avatar").html(Avatar.getCode(user.avatar));
            $("#user-panel .user-name").text(user.name);
        } else {
            $("#user-panel .user-avatar").html("");
            $("#user-panel .user-name").text("");
        }
    };

    return {initialize, show, hide, update};
})();

const StartPanel = (function () {
    // This function initializes the UI
    const initialize = function () {
        // Hide it
        $("#start-panel").hide();
        $("#next-button").on("click", () => {
            Socket.ready();
            hide();
            UserPanel.hide();
            WaitingPanel.show();
        });
    };
    // This function shows the panel with the user
    const show = function () {
        $("#start-panel").show();
    };

    // This function hides the panel
    const hide = function () {
        $("#start-panel").hide();
    };

    return {initialize, show, hide};
})();

const WaitingPanel = (function () {
    // This function initializes the UI
    const initialize = function () {
        // Hide it
        $("#waiting-panel").hide();
        $("#start-button").on("click", () => {
            // Game Start
            hide();
            $("#background").hide();
            Game.show();
            startTime = new Date();


            // setTimeout(gameOverPanel.show('Mafia', onlineUsers), 100000);
        });
    };
    const update = function (onlineUsers) {
        const currentUser = Authentication.getUser();
        const team = (onlineUsers[currentUser.username].team).toString();
        const assignedMessage = `You have been assigned to the ${team} team.`;
        $("#start-button").prop("disabled", false).css("background-color", "#a9364e");
        $("#waiting-panel .waiting-title").text(assignedMessage);
        $("#waiting-panel .waiting-hint").hide();
    }
    // This function shows the form with the user
    const show = function () {
        $("#waiting-panel .waiting-title").text("Let’s wait for other users to join the game!");
        $("#waiting-panel .waiting-hint").show();
        $("#start-button").prop("disabled", true).css("background-color", "#eeeeee");
        $("#waiting-panel").show();
    };

    // This function hides the form
    const hide = function () {
        $("#waiting-panel").hide();
    };

    return {initialize, update, show, hide};
})();

const gameOverPanel = (function () {
    // This function initializes the UI
    const initialize = function () {
        // Hide it
        $("#game-over-overlay").hide();
    };

    const show = function (winningTeam, onlineUsers) {
        sounds.game.pause();
        sounds.gameover.play();
        $("#background").show();
        Game.hide();
        endTime = new Date();
        //depends on player's team, show different end game message display
        const currentUser = Authentication.getUser();
        const team = (onlineUsers[currentUser.username].team).toString();
        if (winningTeam === 'Mafia') {
            $("#game-over-overlay #winningTeam").text("Mafia Win!")
        } else {
            $("#game-over-overlay #winningTeam").text("Townpeople Win!")
        }
        const isWon = winningTeam === team
        $("#game-over-overlay").show();
        setTimeout(function () {
            statPanel.update(isWon, onlineUsers)
        }, 2000);

    };
    const hide = function () {
        $("#game-over-overlay").hide();
    };

    return {initialize, show, hide};
})();
const statPanel = (function () {
    const initialize = function () {
        $("#stat-panel").hide();
        $("#restart-button").on("click", () => {
            $("#stat-panel #stat").empty();
            $("#stat-panel #gametime").empty();
            hide();
            StartPanel.show();
        });
    }
    const update = function (isWon, onlineUsers) {
        sounds.gameover.pause();
        sounds.background.play();
        gameOverPanel.hide();
        // Show the winning team.
        if (isWon) {
            $("#stat-panel #gameover").text("You Win!");
        } else {
            $("#stat-panel #gameover").text("You Lose!");
        }
        var elapsedTime = endTime - startTime;
        var elapsedSeconds = Math.floor(elapsedTime / 1000);
        var minutes = Math.floor(elapsedSeconds / 60);
        var seconds = elapsedSeconds % 60;
        var gametime = $("<div></div>").text("Game time: " + minutes + " minutes " + seconds + " seconds");
        $("#stat-panel #gametime").append(gametime);
        var mafiaTeamElement = $("<div><strong>Mafia Team:</strong></div>");
        var townpeopleTeamElement = $("<div><strong>Townpeople Team:</strong></div>");
        mafiaTeamElement.css("padding-right", "30px");
        townpeopleTeamElement.css("padding-left", "30px");
        $("#stat-panel #stat").append(mafiaTeamElement, townpeopleTeamElement);
        Object.keys(onlineUsers).forEach(function (username) {
            var name = onlineUsers[username].name;
            var statistic = onlineUsers[username].statistic;
            var team = onlineUsers[username].team;
            if (team === "Mafia") {
                // Create a new HTML element for each player's information in the "Mafia Team" section
                var playerElement = $("<div></div>").text(name + " killed " + statistic + " people");
                playerElement.css("padding-left", "20px");
                // Append the player element to the "Mafia Team" section
                mafiaTeamElement.append(playerElement);
            } else if (team === "Townpeople") {
                // Create a new HTML element for each player's information in the "Townpeople Team" section
                var playerElement = $("<div></div>").text(name + " collected " + statistic + " item(s)");
                playerElement.css("padding-left", "20px");
                // Append the player element to the "Townpeople Team" section
                townpeopleTeamElement.append(playerElement);
            }
        });
        Socket.restart();
        UserPanel.show();
        show();

    }
    const show = function () {
        $("#stat-panel").show();
    };

    const hide = function () {
        $("#stat-panel").hide();
    };

    return {initialize, update, show, hide};

})();
const Game = (function () {
    let mapArea = null
    let map = null

    const initialize = function () {
        mapArea = $("#gameMap");
    }

    const show = function () {
        sounds.background.pause();
        sounds.game.play();
        map = null;
        $("#gameMap").empty();
        $("#gameMap").css("display", "flex");
        map = GameMap.getMap()
        mapArea.show()
    }

    const hide = function () {
        $("#gameMap").hide();
    }

    return {initialize, show, hide};

})();
const UI = (function () {
    // This function gets the user display
    const getUserDisplay = function (user) {
        return $("<div class='field-content row shadow'></div>")
            .append($("<span class='user-avatar'>" +
                Avatar.getCode(user.avatar) + "</span>"))
            .append($("<span class='user-name'>" + user.name + "</span>"));
    };

    // The components of the UI are put here
    const components = [SignInForm, UserPanel, StartPanel, WaitingPanel, gameOverPanel, statPanel, Game];

    // This function initializes the UI
    const initialize = function () {
        // Initialize the components
        for (const component of components) {
            component.initialize();
        }
    };

    return {getUserDisplay, initialize};
})();
