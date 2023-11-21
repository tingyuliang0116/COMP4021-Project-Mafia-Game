Avatar = (function () {
    // This stores the available avatars
    const avatars = {
        "Person Roles": {
            "Police": "&#128110;",
            "Bunnies": "&#128111;",
            "Bride": "&#128112;",
            "Man Gua pi mao": "&#128114;",
            "Man turban": "&#128115;",
            "Construction worker": "&#128119;",
            "Princess": "&#128120;",
            "Business suit": "&#128372;",
            "Detective or Spy": "&#128373;",
            "Helpdesk": "&#128129;",
            "Guardsman": "&#128130;",
            "Dancer": "&#128131;",
            "Prince": "&#129332;",
            "Man in tuxedo": "&#129333;"
        }
    };

    // This function populates the avatars to a select box
    const populate = function (select) {
        for (const category in avatars) {
            const optgroup = $("<optgroup label='" + category + "'></optgroup");
            for (const name in avatars[category]) {
                optgroup.append(
                    $("<option value='" + name + "'>" +
                        avatars[category][name] + " " + name +
                        "</option>")
                );
            }
            select.append(optgroup);
        }
    };

    // This function gets the code from the avatar name
    const getCode = function (name) {
        for (const category in avatars) {
            if (name in avatars[category])
                return avatars[category][name];
        }
        return "&#128683;";
    };

    return {populate, getCode};
})();
