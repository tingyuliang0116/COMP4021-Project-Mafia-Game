Avatar = (function () {
    // This stores the available avatars
    const avatars = {
        "Occupations": {
            "Doctor": "&#129464;",
            "Engineer": "&#128118;",
            "Scientist": "&#129505;",
            "Teacher": "&#129463;",
            "Chef": " &#129374;",
            "Police Officer": "&#128105;",
            "Firefighter": "&#128692;",
            "Artist": "&#127908;",
            "Musician": "&#127926;",
            "Athlete": "&#127947;",
            "Writer": "&#9997;",
            "Astronaut": "&#128105;",
            "Farmer": "&#129468;",
            "Mechanic": "&#128105;"
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
