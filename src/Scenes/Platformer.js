class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        //this.ACCELERATION = 400;
        //this.DRAG = 1500;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 2000;
        this.physics.world.TILE_BIAS = 24;
        //this.JUMP_VELOCITY = -650;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
    }

    preload() {
        // Load the animated tiles plugin
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 45, 25);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        // Create coins from Objects layer in tilemap
        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });

        this.spawns = this.map.createFromObjects("Objects", {
            name: "flag",
            key: "tilemap_sheet",
            frame: 111
        });

        this.powerUps = this.map.createFromObjects("Objects", {
            name: "mushroom",
            key: "tilemap_sheet",
            frame: 128
        });

        // Create animation for coins created from Object layer
        this.anims.create({
            key: 'coinAnim', // Animation key
            frames: this.anims.generateFrameNumbers('tilemap_sheet', 
                {start: 151, end: 152}
            ),
            duration: 250,
            //frameRate: 10,  // Higher is faster
            repeat: -1      // Loop the animation indefinitely
        });

        this.anims.create({
            key: 'spawnAnim', // Animation key
            frames: this.anims.generateFrameNumbers('tilemap_sheet', 
                {start: 111, end: 112}
            ),
            duration: 250,
            //frameRate: 10,  // Higher is faster
            repeat: -1      // Loop the animation indefinitely
        });

        // Play the same animation for every memeber of the Object coins array
        this.anims.play('coinAnim', this.coins);
        this.anims.play('spawnAnim', this.spawns);

        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.spawns, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.powerUps, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);
        this.spawnGroup = this.add.group(this.spawns);
        this.powerUpsGroup = this.add.group(this.powerUps);

        //this.spawn = this.spawnGroup.getChildren()[0]; // get the first spawn point (there's only one in this level)
        //this.start = {x: this.spawn.x, y: this.spawn.y};

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.altJump = this.input.keyboard.addKey('SPACE');
        this.rKey = this.input.keyboard.addKey('R');

        // set up player avatar
        //my.sprite.player = this.physics.add.sprite(30, 345, "platformer_characters", "tile_0000.png");
        my.sprite.player = new Player(this, 30, 345, "platformer_characters", "tile_0000.png", cursors, this.altJump);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        
        // Add interaction for coins with coin callback
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
        });

        this.physics.add.overlap(my.sprite.player, this.spawnGroup, (obj1, obj2) => {
            this.start = {x: obj2.x, y: obj2.y}; // update spawn point to current flag position
        });

        // Handle collision detection with power-ups
        this.physics.add.overlap(my.sprite.player, this.powerUpsGroup, (obj1, obj2) => {
            obj2.destroy(); // remove power-up on overlap
            this.isPoweredUp = true;
            let powerUpTween = this.tweens.add({
                targets: my.sprite.player,
                onComplete: () => {
                    this.isPoweredUp = false;
                    //my.sprite.player.set
                }
            });
        });

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        // Simple camera to follow player
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
        
        // Initialize the animated tiles plugin
        // This line needs to come *after* any line which creates a tilemap layer.
        // Putting this at the end of create() is a safe place
        this.animatedTiles.init(this.map);

    }

    update(time, delta) {

        let dt = delta / 1000;
        //let my = this.my;

        my.sprite.player.update(time, delta);

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
    }
}