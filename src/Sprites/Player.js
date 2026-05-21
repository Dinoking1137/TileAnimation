class Player extends Phaser.Physics.Arcade.Sprite {

    // x,y - starting sprite location
    // spriteKey - key for the sprite image asset
    // leftKey - key for moving left
    // rightKey - key for moving right
    constructor(scene, x, y, texture, frame, cursors, alt_jump, showHitboxes = false) {
        super(scene, x, y, texture, frame);
        
        this.cursors = cursors;
        this.alt_jump = alt_jump;
        this.score = 0;
        //this.bulletSpeed = -1000;
        //this.isActive = true;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setCollideWorldBounds(true);
        //this.body.setSize(20, 40);
        //this.body.setOffset(5, 8);

        this.init();
        return this;
    }

    init() {
        // variables and settings
        this.ACCELERATION = 400;
        this.DRAG = 2000;    // DRAG < ACCELERATION = icy slide

        this.MAX_VELOCITY_X = 400;
        this.MAX_VELOCITY_Y = 1000;
        this.JUMP_VELOCITY = -500;

        this.setMaxVelocity(this.MAX_VELOCITY_X, this.MAX_VELOCITY_Y);

        this.CAYOTE_TIME = 250; 
        this.coyoteTimer = 0;

        this.JUMP_BUFFER_TIME = 100;
        this.jumpBufferTimer = 0;
    }

    update(time, delta) {

        if (this.cursors.left.isDown) {
            this.setAccelerationX(-this.ACCELERATION);
            this.resetFlip();
            this.anims.play('walk', true);

        } else if (this.cursors.right.isDown) {
            this.setAccelerationX(this.ACCELERATION);
            this.setFlip(true, false);
            this.anims.play('walk', true);
            // TODO: add particle following code here

        } else {
            // Set acceleration to 0 and have DRAG take over
            this.setAccelerationX(0);
            this.setDragX(this.DRAG);
            this.anims.play('idle');
            // TODO: have the vfx stop playing
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if (!this.body.blocked.down) {
            this.anims.play('jump');
            this.coyoteTimer += delta; // * (this.velocityX /this.MAX_VELOCITY_X)
        }

        if (this.body.blocked.down) {
            this.coyoteTimer = 0;
            this.setScale(1.0);
        }

        if (this.coyoteTimer < this.CAYOTE_TIME) {
            this.setScale(1.2);
            //console.log(`coyote time: ${this.coyoteTimer.toFixed(2)} ms`);
        }

        console.log(`coyote time: ${this.coyoteTimer.toFixed(2)} ms`);

        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.alt_jump)) {
            if (this.coyoteTimer < this.CAYOTE_TIME) {
                this.body.setVelocityY(this.JUMP_VELOCITY);
                this.coyoteTimer = this.CAYOTE_TIME; // Reset coyote timer
            } else if (this.body.blocked.left || this.body.blocked.right) {
                this.body.setVelocityX(this.body.blocked.left ? this.MAX_VELOCITY_X / 2 : -this.MAX_VELOCITY_X / 2);
                this.body.setVelocityY(this.JUMP_VELOCITY);
            }
        }  
    }
}