// This function defines the Gem module.
// - `ctx` - A canvas context for drawing
// - `x` - The initial x position of the gem
// - `y` - The initial y position of the gem
// - `color` - The colour of the gem
const Item = function(ctx, x, y, color) {

    // This is the sprite items of the gem of four colours
    // `green`, `red`, `yellow` and `purple`.
    const items = {
        item1: { x: 0, y:  0, width: 32, height: 32, count: 4, timing: 200, loop: true },
        item2: { x: 32, y: 0, width: 32, height: 32, count: 4, timing: 200, loop: true },
        item3: { x: 0, y: 32, width: 32, height: 32, count: 4, timing: 200, loop: true },
        item4: { x: 32, y: 32, width: 32, height: 32, count: 4, timing: 200, loop: true }
    };
    // This is the sprite object of the gem created from the Sprite module.
    const sprite = Sprite(ctx, x, y);

    // The sprite object is configured for the gem sprite here.
    sprite.setSequence(items[color])
          .setScale(2)
          .setShadowScale({ x: 0.75, y: 0.2 })
          .useSheet("item.png");

    // This is the birth time of the gem for finding its age.
    let birthTime = performance.now();

    // This function sets the color of the gem.
    // - `color` - The colour of the gem which can be
    // `"green"`, `"red"`, `"yellow"` or `"purple"`
    const setColor = function(color) {
        sprite.setSequence(items[color]);
        // birthTime = performance.now();
    };

    // This function gets the age (in millisecond) of the gem.
    // - `now` - The current timestamp
    const getAge = function(now) {
        return now - birthTime;
    };

    // This function randomizes the gem colour and position.
    // - `area` - The area that the gem should be located in.
    //use this function 
    const randomize = function(area) {
        /* Randomize the color */
        const colors = ["item1", "item2", "item3", "item4"];
        setColor(colors[Math.floor(Math.random() * 4)]);

        /* Randomize the position */
        const {x, y} = area.randomPoint();
        sprite.setXY(x, y);
    };

    // The methods are returned as an object here.
    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        setColor: setColor,
        getAge: getAge,
        getBoundingBox: sprite.getBoundingBox,
        randomize: randomize,
        draw: sprite.draw,
        update: sprite.update
    };
};
