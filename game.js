var config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var platforms;
var player;
var cursors;
var stars;
var score = 0;
var scoreText;
var gameOver = false;
var bombs;

function preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 
        'assets/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );
}




function create() {

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '25px', fill: '#000' });
    scoreText.setDepth(5);


    // Add the background image
    this.add.image(this.scale.width / 2, this.scale.height / 2, 'sky')
        .setDisplaySize(this.scale.width, this.scale.height);

    // Create a static group for platforms
    platforms = this.physics.add.staticGroup();

    // Dynamically position platforms based on screen size
    platforms.create(this.scale.width / 2, this.scale.height - 32, 'ground')
        .setScale(4).refreshBody(); // Bottom platform

    platforms.create(this.scale.width * 0.55, this.scale.height * 0.70, 'ground').setScale(1).refreshBody(); // Upper-right
    platforms.create(this.scale.width * 0.1, this.scale.height * 0.5, 'ground').setScale(2).refreshBody();  // Middle-left
    platforms.create(this.scale.width * 0.9, this.scale.height * 0.4, 'ground').setScale(2).refreshBody();  // Top-right
    platforms.create(this.scale.width * 0.5, this.scale.height * 0.3, 'ground').setScale(0.5).refreshBody();  // Top-middle-small
    platforms.create(this.scale.width * 0.55, this.scale.height * 0.70, 'ground').setScale(1).refreshBody(); // Upper-middle-small
    // Add player
    player = this.physics.add.sprite(400, 450, 'dude');

    // Add bounce and collision for the player
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    // Create animations for the player
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    
    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });
    
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    // Add collision between the player and the platforms
    this.physics.add.collider(player, platforms);

    cursors = this.input.keyboard.createCursorKeys();

    stars = this.physics.add.group({
        key: 'star',
        repeat: 6,
        setXY: { x: 300, y: 0, stepX: 160 }
    });

    stars.children.iterate(function (child) {
    
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.6));
    
    });


       
    bombs = this.physics.add.group();
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(player, bombs, hitBomb, null, this);

    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);

}


function update() {

    if (gameOver)
        {
            return;
        }

        player.setVelocityX(0);

    if (cursors.left.isDown)
        {
            player.setVelocityX(-300);
        
            player.anims.play('left', true);
        }
        else if (cursors.right.isDown)
        {
            player.setVelocityX(300);
        
            player.anims.play('right', true);
        }
        else
        {
            player.setVelocityX(0);
        
            player.anims.play('turn');
        }
        
        if (cursors.up.isDown && player.body.touching.down)
        {
            player.setVelocityY(-330);
        }
}

function collectStar (player, star)
{
    star.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0)
        {
            stars.children.iterate(function (child) {
    
                child.enableBody(true, child.x, 0, true, true);
    
            });
    
            var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    
            var bomb = bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(200, 600), 20);
    
        }
}

function hitBomb(player, bomb) {

    // Make sure you've preloaded the sound in the preload function
    //this.sound.play('explosion'); 

    // Pause all physics interactions (this includes the player, the bomb, etc.)
    this.physics.pause();

    // Change player's tint to red to indicate a hit
    player.setTint(0xff0000);

    // Play the "turn" animation (to show that the player has been hit)
    player.anims.play('turn');

    // Set gameOver to true, so the game stops accepting further inputs
    gameOver = true;

    // Optionally, show a Game Over message or restart option
    this.add.text(this.scale.width / 2 - 100, this.scale.height / 2, 'Game Over!', {
        fontSize: '64px',
        fill: '#ff0000'
    }).setOrigin(0);
    
    this.add.text(this.scale.width / 2 - 100, this.scale.height / 2 + 50, 'Score : ' + scoreText, {
        fontSize: '40px',
        fill: '#0000'
    }).setOrigin(0);

        // If you want the game to restart after a delay (e.g., 3 seconds):
    this.time.delayedCall(7000, function () {
    // Restart the game after the delay
    this.scene.restart();
}, [], this);
}

// Resize canvas dynamically
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});
