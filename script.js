

const canvas = document.getElementById('gameCanvas');
const c = canvas.getContext('2d');

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let fallingDownCount = 0; 
let totalFruits = 0; 
let score = 0; 
let highscore = 0;
let bombsliced = false;
let angle = 0;
const gravity = 0.1;



const fruitImages = [
    'Apple.png',   
    'Banana.png',
    'Melon.png',
    'Orange.png',
    'Grape-Black.png',
    'Lychee.png',
    'Mango.png',
    'PineApple.png',
    'Cherimoya.png',
    'Bomb.png'

];


function loadImage(src) {
    const img = new Image();
    img.src = src;
    img.onload = () =>
        console.log(`${src} loaded`);
    img.onerror = () =>
        console.error(`${src} failed loading`);
    return img;
}

const loadedImages = fruitImages.map(loadImage);

class Fruit {
    constructor() {
        this.image = loadedImages[Math.floor(Math.random() * loadedImages.length)];
        this.position = {
            x: Math.random() * canvas.width / 2,
            y: canvas.height,
        };
        this.velocity = {
            x: Math.random() * 4 + 1, 
            y: Math.random() * 3 + 9, 
        };
        this.width = 100;
        this.height = 100;
        this.gravity = gravity;
        this.visible = true; 
        this.isFalling = false; 
        this.isCut = false; 
    }

    draw() {
        if (this.visible) {
            c.save();
            c.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
            angle += 0.02
            c.rotate(angle);
            c.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
            c.restore();
        }
    }

    update() {
        if (this.visible) {
            
            if (!this.isFalling) {
                this.position.y -= this.velocity.y;
                this.position.x += this.velocity.x;
                this.velocity.y -= this.gravity;

                
                if (this.velocity.y <= 0) {
                    this.isFalling = true;
                }
            } else {
                
                this.position.y += this.velocity.y;
                this.velocity.y += this.gravity;
                this.position.x += this.velocity.x;

                
                if (this.position.y + this.height >= canvas.height) {
                    this.position.y = canvas.height - this.height;
                    this.visible = false; 

                    
                    if (this.image.src.indexOf('Bomb.png') === -1) {
                        fallingDownCount++;
                    }
                }
            }

            
            if ((this.position.x + this.width) > canvas.width) {
                this.velocity.x = -Math.random() * 4 - 1; 
            }
            if (this.position.x < 0) {
                this.velocity.x = 4; 
            }

            this.draw();
        }
    }



}




let fruits = [];
const fruitScores = {
    'Apple.png': 4,
    'Banana.png': 2,
    'Melon.png': 1,
    'Orange.png': 2,
    'Grape-Black.png': 1,
    'Lychee.png': 2,
    'Mango.png': 3,
    'PineApple.png': 3,
    'Cherimoya.png': 2,
    'Bomb.png': 0
};



function spawnFruits() {
    const numberOfFruits = Math.floor(Math.random() * 2) + 3; 
    fruits = []; 
    totalFruits = numberOfFruits; 
    for (let i = 0; i < numberOfFruits; i++) {
        fruits.push(new Fruit()); 
    }

    if (Math.random() < 0.5) { 
        fruits.push(new Bomb());
    }
};




let isDragging = false;
let lastMousePosition = null;
let currentMousePosition = { x: 0, y: 0 };

function animate() {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);

    
    fruits.forEach((fruit) => fruit.update());
    

    
    if (isDragging && lastMousePosition) {
        c.beginPath();
        c.moveTo(lastMousePosition.x, lastMousePosition.y);
        c.lineTo(currentMousePosition.x, currentMousePosition.y);
        c.strokeStyle = "white";
        c.lineWidth = 11;
        c.lineJoin = "round";
        c.lineCap = "round";
        c.shadowColor = "aqua";
        c.shadowBlur = 20;
        c.stroke();
        document.getElementById("Slice").play();


        
        fruits.forEach((fruit) => {
            if (
                fruit.visible &&
                currentMousePosition.x > fruit.position.x &&
                currentMousePosition.x < fruit.position.x + fruit.width &&
                currentMousePosition.y > fruit.position.y &&
                currentMousePosition.y < fruit.position.y + fruit.height
            ) {
                if (fruit.image.src.includes("Bomb.png")) {
                    
                    fruit.visible = false;
                    fallingDownCount += 3;
                    document.getElementById("BombSliced").play() 
                } else {
                    fruit.visible = false; 
                    score += fruitScores[fruit.image.src.split('/').pop()]; 
                    document.getElementById("FruitSlice").play()
                }
            }
        });


    }

    if (score > highscore) {
        highscore = score
        
    } 
    if (isDragging) {
        lastMousePosition = { ...currentMousePosition };
    }


    
    
    if (fallingDownCount >= 3) {
        c.clearRect(0, 0, canvas.width, canvas.height);
        c.fillStyle = "red";
        c.font = "40px Arial";
        c.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
        c.fillStyle = "white";
        c.font = "25px Arial";
        c.fillText("Score: " + score, canvas.width / 2 - 55, canvas.height / 2 + 30);
        c.fillStyle = "white";
        c.font = "25px Arial";
        c.fillText("High Score: " + highscore, canvas.width / 2 - 55, canvas.height / 2 + 60);
        replayButton.style.display = 'block';
    
    }



    
    const allFruitsGone = fruits.every(fruit => !fruit.visible);
    if (allFruitsGone && fallingDownCount < 3) {
        setTimeout(() => {
            spawnFruits(); 
        }, 0); 
    }

    
    c.fillStyle = "white";
    c.font = "20px Arial";
    c.fillText("Score: " + score, 20, 30);


    c.fillStyle = "white";
    c.font = "20px Arial";
    c.fillText("Chance: " + (3 - fallingDownCount), canvas.width - 110, 30);
}


canvas.addEventListener("mousedown", (event) => {
    isDragging = true;
    currentMousePosition = getMousePos(event);
    lastMousePosition = { ...currentMousePosition };
});

canvas.addEventListener("mousemove", (event) => {
    if (isDragging) {
        currentMousePosition = getMousePos(event);
    }
});

canvas.addEventListener("mouseup", () => {
    isDragging = false;
    lastMousePosition = null; 
});


function getMousePos(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
    };
}


canvas.addEventListener("touchstart", (event) => {
    isDragging = true;
    const touch = event.touches[0];
    currentMousePosition = getTouchPos(touch);
    lastMousePosition = { ...currentMousePosition };
});

canvas.addEventListener("touchmove", (event) => {
    if (isDragging) {
        const touch = event.touches[0];
        currentMousePosition = getTouchPos(touch);
    }
});

canvas.addEventListener("touchend", () => {
    isDragging = false;
    lastMousePosition = null; 
});


function getTouchPos(touch) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
    };
}







// SidebarSetup:

const sidebar = document.getElementById("sidebar");
const togglebtn = document.getElementById("togglebtn");

sidebar.style.left = "-15vw"
togglebtn.style.left = "0px"
navbar.style.left = "-15vw"



togglebtn.addEventListener("click", () => {
    if (sidebar.style.left === "0px") {
        sidebar.style.left = "-15vw"
    } else {
        sidebar.style.left = "0px"
    }
});

togglebtn.addEventListener("click", () => {
    if (togglebtn.style.left === "0px") {
        togglebtn.style.left = "12vw"
    } else {
        togglebtn.style.left = "0px"
    }
});

togglebtn.addEventListener("click", () => {
    if (navbar.style.left === "0px") {
        navbar.style.left = "-15vw"
    } else {
        navbar.style.left = "0px"
    }
});




const topbar = document.getElementById("topbar");
const fogglebtn = document.getElementById("fogglebtn");

topbar.style.top = "-11vmin"
fogglebtn.style.top = "0px"



fogglebtn.addEventListener("click", () => {
    if (topbar.style.top === "0px") {
        topbar.style.top = "-11vmin"
    } else {
        topbar.style.top = "0px"
    }
});

fogglebtn.addEventListener("click", () => {
    if (fogglebtn.style.top === "0px") {
        fogglebtn.style.top = "3.5vmin"
    } else {
        fogglebtn.style.top = "0px"
    }
});






const playButton = document.getElementById('play-button');
const replayButton = document.getElementById('replay-button');


playButton.addEventListener('click', () => {
    playButton.style.display = 'none';
    animate();
});


replayButton.addEventListener('click', () => {
    replayButton.style.display = 'none';
    score = 0;
    fallingDownCount = 0;
    bombsliced = false;
    fruits = [];
    angle = 0;
});

