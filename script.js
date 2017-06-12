// debugger;
const canvas = document.getElementById('canvas');
const playBtn = document.getElementById('play');
const menu = document.getElementById('menu');
const load = document.getElementById('load');
const game = document.getElementById('game');
let ctx;
/*Game state*/
const playerTune = {
    playerHealth: 500,
    playerSpeed: 250,
    bullets: 100,
    monoGangSpeed: 0.1,
    doubleGangSpeed: 0.3
}
let gameTime;
let time;
let isSound = true;
let isGameOver = false;
let backGroundOnly = true;
let limitScore = 3000;
const sprite = {};
let [backGround, cursorCoor, bullets, buletsEnemy, splashes, marks, explosions, explosionsShip] = [[], [], [], [], [], [], [], []];
let player = {};
const fire = {
    right: false,
    left: false
};
const bombs = {
    timer: 0.4,
    timerInit: 0.4,
    nextBomb: 0.4,
    bomb: [],
    repeat: 1,
    health: 100,
    damage: 50
};

const planes = {
    timer: 3,
    timerInit: 3,
    nextPlane: 0,
    plane: [],
    repeat: 2,
    health: 100,
    damage: 20

};
const tanks = {
    timer: 4,
    timerInit: 4,
    nextTank: 1,
    tank: [],
    repeat: 1,
    health: 200,
    damage: 80
};
const health = {
    timer: 20,
    nextHealth: 0,
    unitHealth: 100,
    health: [],
    repeat: 1
};
const gunBullets = {
    timer: 18,
    nextStore: 10,
    storeCapacity: 20,
    store: [],
    repeat: 1
};
const information = {
    score: 0,
    time: 0,
    health: playerTune.playerHealth,
    bulletStore: playerTune.bullets,
    healthEl: null,
    bulletsEl: null,
    scoreEl: null
};
/*sound load*/
const sounds= {};

/*Img load*/
sprite.sea = {};
sprite.sea = new Image();
sprite.waterUnits = new Image();
sprite.explosions = new Image();
sprite.sea.src = 'tex/tex_Water.jpg';
sprite.sea.onload = function () {
    sprite.waterUnits.src = 'tex/water_units.png';

}
sprite.waterUnits.onload  = function () {
    sprite.explosions.src = 'tex/explosions.png';
}

sprite.explosions.onload  = function () {
    loadSound();
}
/* for sounds*/
new Audio('sound/monoGun.mp3');
new Audio('sound/doubleGun.mp3');
new Audio('sound/explosion.mp3');
new Audio('sound/planeExp.mp3');
new Audio('sound/tankExp.mp3');
const backGrAudio = new Audio();
function loadSound() {
    backGrAudio.addEventListener('loadeddata', function() {
        backGrAudio.volume = 0.5;
        backGrAudio.loop = true;
    }, false);
    backGrAudio.src = 'sound/ochen_geroicheskaya_muzyka.mp3';
    init();
}

/* for sprites*/
class Sprite {
    constructor (img, x, y, width, height, posX, posY, setX, setY, speed) {
        this.img = img;
        this.x = x;
        this.y = y;
        this.posX = posX;
        this.posY = posY;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.setX = setX;
        this.setY = setY;
    }

    quantity() {
        return (Math.ceil(canvas.height / this.height) + 1);
    }

    centerX() {
        return (this.width/2 + this.posX);
    }
    centerY() {
        return (this.height/2 + this.posY);
    }
}


class Player extends  Sprite {
    constructor (img, x, y, width, height, posX, posY, setX, setY, speed, health, damage,
                 angle, varX, varY, angleX, angleY, bulletSpeed) {
        super(img, x, y, width, height, posX, posY, setX, setY, speed);
        this.health = health;
        this.angle = angle;
        this.varX = varX;
        this.varY = varY;
        this.angleX = angleX;
        this.angleY = angleY;
        this.prevShoot = this.speed + 0.1;
        this.damage = damage;
        this.prevTime = null;
        this.angle = angle;
        this.weapon = [];
        this.trace = null;
        this.setX = setX;
        this.setY = setY;
        this.index = 0;
        this.bulletSpeed = bulletSpeed;
        this.score = 0;
        this.initHealth = health;
        this.bulletCoor = null;
    }
}


class Bullet extends Sprite {
    constructor(img, x, y, width, height, posX, posY, setX, setY, speed, endX, endY, damage) {
        super(img, x, y, width, height, posX, posY, setX, setY, speed);
        this.endX = endX;
        this.endY = endY;
        this.speed = speed;
        this.mathAngle = 0;
        this.check = false;
        this.damage = damage;
    }
}
class Splash extends Sprite{
    constructor (img, x, y, width, height, posX, posY, speed, setX, setY) {
        super(img, x, y, width, height, posX, posY, speed);
        this.setX = setX;
        this.setY = setY;
        this.index = this.setX.length;
        this.prevTime = null;
    }
}

class Unit extends Player {
    constructor(img, x, y, width, height, posX, posY, setX, setY, speed, health, damage) {
        super(img, x, y, width, height, posX, posY, setX, setY, speed, health, damage);
    }
}

//-------------------------------

function init() {

    backGround.push(new Sprite(sprite.sea, 0, 0, sprite.sea.width, sprite.sea.height,
        0, 0, null, null, 200));
    player = new Player (sprite.waterUnits, 194, 836, 62, 179, 950, 721, [194, 67, 3],
        [836, 836, 836] ,playerTune.playerSpeed, playerTune.playerHealth, 300);
    /*trace x -11, y -20 */
    player.trace = new Player(sprite.waterUnits, 574, 2, 84, 226, 950, 721,[574, 488, 566, 480, 394],
        [2, 2, 789, 789, 789], 0, 0, 0, 0, -11, -15);
    /*Weapon forward x +14, y +30 */
    let doubleGun = new Player(sprite.waterUnits, 664, 23, 24, 43, 1075, 722, [664, 688, 712],
        [23, 23, 23], playerTune.doubleGangSpeed, 20, 100, 0, 18, 80, 0, 0, 3000);
    doubleGun.bulletStore = playerTune.bullets;
    doubleGun.sound = () =>{
        let shot = new Audio('sound/doubleGun.mp3');
        shot.volume = 0.3;
        shot.play();
    };
    player.weapon.push(doubleGun); //double gun
    let monoGun = new Player(sprite.waterUnits, 664, 88, 24, 40, 960, 750, [664, 688, 712],
        [88, 88, 88], playerTune.monoGangSpeed, 5, 40, 0, 18, 10, 20, 0, 5000);
    monoGun.sound = () =>{
        let shot = new Audio('sound/monoGun.mp3');
        shot.volume = 0.2;
        shot.play();
    };
    player.weapon.push(monoGun); //mono gun
    load.style.display = 'none';
    game.style.display = 'block';
    menu.style.display = 'block';
    information.healthEl = document.getElementById('health-line');
    information.bulletsEl = document.getElementById('bullets');
    information.scoreEl = document.getElementById('score');
    document.getElementById('sound').addEventListener('click', onOffSound);
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx = canvas.getContext('2d');
    canvas.addEventListener('mousemove',getCursorCoor);
    canvas.addEventListener('mousedown',runFire);
    canvas.addEventListener('mouseup',stopFire);
    playBtn.addEventListener('click',playAgain);
    backGrAudio.play();
    start();
}

function start() {
    time = Date.now();
    gameTime = 0;
    mainLoop();
}
function onOffSound(e) {
    if (isSound) {
        isSound = false;
        backGrAudio.muted = true;
        e.target.style.backgroundPositionX = '-40px';
    } else {
        isSound = true;
        backGrAudio.muted = false;
        e.target.style.backgroundPositionX = '0';
    }

}
function playAgain() {
    if (!isGameOver) {
        menu.style.display = 'none';
        backGroundOnly = false;
    }
    reset();
}
function reset() {
    [player.health, player.initHealth, player.index, player.posX, player.posY] = [600, 600, 0, 950, 721];
    [bullets, buletsEnemy, explosions, splashes, marks, explosionsShip] = [[], [], [], [], [], []];
    [bombs.bomb, bombs.nextBomb] = [[], 0];
    [planes.plane, planes.nextPlane] = [[], 0];
    [tanks.tank, tanks.nextTank] = [[], 0];
    time = Date.now();
    gameTime = 0;
    fire.left = false;
    fire.right = false;
    information.score = 0;
    player.score = 0;
    information.time = 0;
    player.weapon[0].bulletStore = playerTune.bullets;
    player.weapon[0].health = playerTune.playerHealth;
    planes.timer = planes.timerInit;
    bombs.timer = bombs.timerInit;
    tanks.timer = tanks.timerInit;
    menu.style.display = 'none';
    isGameOver = false;
}

function mainLoop() {
    if (isGameOver) {
        menu.style.display = 'block';
        document.getElementById('text').innerHTML = 'GAME OVER';
    }
    let now = Date.now();
    let state = (now - time) / 1000;
    gameTime += state;
    playreCtrl(state);
    update(state);
    render();
    time = now;
    requestAnimationFrame(mainLoop);
}

function update(state) {
    if (information.score > limitScore) {
        limitScore = limitScore + 3000;

        if (planes.timer > 1) planes.timer = planes.timer - 0.5;
        if (bombs.timer > 0.2) bombs.timer = bombs.timer - 0.05;
        if (tanks.timer > 1) tanks.timer = tanks.timer - 0.5;
    }
    updateBackGround(state);
    if (!backGroundOnly) {
        if (!isGameOver) {
            updatePlayer(state, player, true);
            updateInformation(information, player, state);
        }
        updateSplash(splashes,state);
        updateSplash(explosions, state);
        updateMarks(state);
        updateBombs(state);
        updatePlane(state);
        updateTank(state);
        updateHealthUnit(state)
        updateGunBullets(state);
        if (isGameOver) updateSplash(explosionsShip, state, true);
    }

}

function render() {
    function eachRend(obg) {
        for (let i = 0 ; i < obg.length; i++) {
            renderPlayer(obg[i].trace);
            renderPlayer(obg[i]);
            renderPlayer(obg[i].weapon);
        }
    }

    backGround.forEach(item => renderBackGround(item));
    if (!backGroundOnly) {
        renderPlayer(marks);
        renderPlayer(splashes);
        renderPlayer(bombs.bomb);
        eachRend([player]);
        /*
        // center point
        ctx.fillRect(949, 459, 2, 2);
        */
        renderPlayer(bullets);
        renderPlayer(buletsEnemy);
        eachRend(planes.plane);
        eachRend(tanks.tank);
        renderPlayer(health.health);
        renderPlayer(gunBullets.store);
        renderPlayer(explosions);
        if (isGameOver) renderPlayer(explosionsShip);
        renderInformation(information);
    }
}

function updatePlayer(state, player, addScore) {
    /* fore trace*/
    if (player.trace) {
        let playerTrace = player.trace;
        if (playerTrace.prevTime > 0.2) {
            playerTrace.prevTime = 0;
            playerTrace.index++
            if (playerTrace.index > (playerTrace.setX.length-1)) playerTrace.index = 0;
        } else {
            playerTrace.prevTime += state;
        }
        playerTrace.posX = player.posX + playerTrace.varX;
        playerTrace.posY = player.posY + playerTrace.varY;
        playerTrace.x = playerTrace.setX[playerTrace.index];
        playerTrace.y = playerTrace.setY[playerTrace.index];
        playerTrace.angle = player.angle;
        /* fore weapon*/
    }
    for (let i = 0; i < player.weapon.length; i++) {
        let weapon = player.weapon[i];
        switch (player.angle) {
            case 20 * Math.PI/180:
                weapon.posX = player.posX + weapon.varX + weapon.angleX;
                break;
            case 340 * Math.PI/180:
                weapon.posX = player.posX + weapon.varX - weapon.angleX;
                break;
            default:
                weapon.posX = player.posX + weapon.varX;
        }
        weapon.posY = player.posY + weapon.varY;
        weapon.privAngle = weapon.angle;
        let x1 = weapon.centerX();
        let y1 = weapon.centerY();
        let x2 = cursorCoor[0];
        let y2 = cursorCoor[1];
        weapon.angle = getAngle(x1, y1, x2, y2);
    }
    updateFireGun(state, player.weapon, addScore);
    /*check ship damage*/
    checkDamages(bombs.bomb, [player], true);
    const percent = player.health/(player.initHealth*0.01);
    if (percent <= 70 && percent > 40) {
        player.index = 1;
    }
    if (percent <= 40 && percent > 0) {
        player.index = 2;
    }
    if (percent <=0) {
        player.health = 0;
        blowUpShip(player.posX, player.posY);
        isGameOver = true;
    }
    if(player.index > 2) player.index = 0;
    player.x = player.setX[player.index];
    player.y = player.setY[player.index];
    for (let i = 0; i < player.weapon.length; i++) {
        player.weapon[i].x = player.weapon[i].setX[player.index];
        player.weapon[i].y = player.weapon[i].setY[player.index];
    }

}

function updateFireGun(state, playerWeapon, addScore) {
    let isFireX = (cursorCoor[0] < player.posX || cursorCoor[0] > player.posX + player.width);
    let isFireY = (cursorCoor[1] < player.posY || cursorCoor[1] > player.posY + player.height+30);
    if (isFireX || isFireY) {
        if (fire.right) {
            let posX = playerWeapon[1].centerX() - 3;
            let posY = playerWeapon[1].centerY() - 10;
            makeBulet(playerWeapon[1], 793, 11, 6, 21, posX, posY, playerWeapon[1].damage);
        }

        if (input.isDown('SPACE') && playerWeapon[0].bulletStore > 0) {
            let posX = playerWeapon[0].centerX() - 5;
            let posY = playerWeapon[0].centerY() - 13;
            makeBulet(playerWeapon[0], 816, 11, 15, 21, posX, posY, playerWeapon[0].damage);
        }
    }
    function makeBulet(gun, x, y, width, height, posX, posY, damage) {
        if (gun.prevShoot > gun.speed) {
            let bullet = new Bullet(sprite.waterUnits, x, y, width, height, posX, posY, null, null, gun.bulletSpeed,
                cursorCoor[0]-width/2, cursorCoor[1]-height/2,  damage);
            gun.prevShoot = state + (gun.prevShoot - gun.speed);
            bullet.mathAngle = getAngleForFire(gun.angle);
            bullet.angle = gun.angle;
            bullets.push(bullet);
            if(isSound) gun.sound();
            if (gun.bulletStore) playerWeapon[0].bulletStore--;
            // console.log(bullets);
        } else {
            gun.prevShoot += state;
        }
    }
    updateBullets(bullets, state, addScore);

}
function updateSplash(splashes, state, again) {
    if (splashes.length) {
        for (let i = 0 ; i < splashes.length; i++){
            let splash = splashes[i];
            splash.speed = backGround[0].speed;
            if (splash.index === -1 && !again) {
                splashes.splice(i, 1);
                continue;
            }
            if (splash.index === -1 && again) {
                splash.index = splash.setX.length - 1;
            }
            splash.x = splash.setX[splash.index];
            splash.y = splash.setY[splash.index];
            if(!again)splash.posY = splash.posY + splash.speed * state;
            if (splash.prevTime > 0.05) {
                splash.prevTime = 0;
                splash.index--;
            } else {
                splash.prevTime = splash.prevTime + state;
            }
        }
    }
}
function updateBullets(bullets, state, addScore) {
    function splash(bullet, index) {
        bullet.posX = bullet.endX;
        bullet.posY = bullet.endY;
        /*delete bullet*/
        bullet.check = true;
        if (bullet.check) {
            let victims = [bombs.bomb, [player], planes.plane, tanks.tank];
            for (let j = 0; j < victims.length; j++) {
                if (checkDamages([bullet], victims[j], addScore)) {
                    explosions.push(new Splash(sprite.waterUnits, 0, 0, 41, 41, bullet.posX-10,  bullet.posY,
                        backGround[0].speed, [839, 839, 839, 839, 839, 839],
                        [490, 531, 572, 613, 654, 695]));
                    continue;
                }
                    /*make splash*/
                if (bullet.posX < 180 || bullet.posX > canvas.width-180) {
                    splashes.push(new Splash(sprite.waterUnits, 0, 0, 21, 11, bullet.posX-10,  bullet.posY,
                        backGround[0].speed, [795, 774, 753, 816, 795, 774, 753],
                        [87, 87, 87, 98, 98, 98, 98]));
                    marks.push(new  Unit(sprite.waterUnits, 754, 125, 18, 18, bullet.posX, bullet.posY,
                        backGround[0].speed));
                } else {
                    splashes.push(new Splash(sprite.waterUnits, 0, 0, 21, 11, bullet.posX-10,  bullet.posY,
                        backGround[0].speed, [795, 774, 753, 816, 795, 774, 753],
                        [76, 76, 76, 65, 65, 65, 65]));

                }
            }
        }
        /*delete bullet*/
        bullets.splice(index, 1);
    }
    if (bullets.length) {
        for (let i = 0; i < bullets.length; i++) {
            const bullet = bullets[i];

            bullet.distanci = bullet.speed * state;
            const coor = getCoorFromAngle(bullet, state);
            if (bullet.posX > bullet.endX) {
                bullet.posX = bullet.posX - coor.x;
                if (bullet.posX < bullet.endX) {
                    splash(bullet, i);
                }
            }
            if (bullet.posX < bullet.endX) {
                bullet.posX = bullet.posX + coor.x;
                if (bullet.posX > bullet.endX) {
                    splash(bullet, i);
                }
            }

            if (bullet.posY > bullet.endY) {
                bullet.posY = bullet.posY - coor.y;
                if (bullet.posY < bullet.endY) {
                    splash(bullet, i);
                }
            }
            if (bullet.posY < bullet.endY){
                bullet.posY = bullet.posY + coor.y;
                if (bullet.posY > bullet.endY) {
                    splash(bullet, i);
                }
            }
        }
    }
}
function blowUpShip(posX, posY) {
    explosionsShip.push(new Splash(sprite.waterUnits, 0, 0, 105, 102,
        posX-10,  posY, backGround[0].speed,
        [905, 905, 905, 905, 905, 905, 905, 905, 905, 905, 905, 905, 905, 905, 905, 905],
        [6, 6, 108, 108, 210, 210, 312, 312, 414, 414, 516, 516, 618, 618, 720, 720]));
    explosionsShip.push(new Splash(sprite.waterUnits, 0, 0, 105, 102,
        posX-10,  posY+80, backGround[0].speed,
        [905, 905, 905, 905, 905, 905, 905, 905],
        [6, 108, 210, 312, 414, 516, 618, 720]));
    explosionsShip.push(new Splash(sprite.explosions, 0, 0, 105, 102,
        posX-10,  posY+50, backGround[0].speed,
        [0, 0, 0, 0, 0, 0, 0, 100, 200, 293, 390, 490, 590, 688, 784, 885, 100, 100, 100, 100],
        [0, 100, 200, 295, 395, 490, 590, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 196, 300, 390]));
}
function updateMarks(state) {
    if (marks.length) {
        for (let i = 0; i < marks.length; i++) {
            let mark = marks[i];
            mark.speed = backGround[0].speed;
            if (mark.posY > canvas.height) marks.splice(i, 1);
            mark.posY = mark.posY + mark.speed * state;
        }
        // console.log(marks);
    }
}
function updateBombs(state) {
    if (bombs.nextBomb >= bombs.timer) {
        bombs.nextBomb = bombs.timer - bombs.nextBomb + state;
        for (let i = 0; i < bombs.repeat; i++) {
            let posX = Math.floor(Math.random() * (canvas.width - 400)) + 200;
            let posY = Math.floor(Math.random() * (-100) -18);
            bombs.bomb.push(new  Unit(sprite.waterUnits, 746, 154, 40, 18, posX, posY, null, null,
                backGround[0].speed, bombs.health, bombs.damage));
        }
    } else {
        bombs.nextBomb = bombs.nextBomb + state;
    }
    checkPos(bombs.bomb, canvas.height, state);
    for (let i = 0 ; i < bombs.bomb.length; i++) {
        bombs.bomb[i].speed = backGround[0].speed;
        if (bombs.bomb[i].health <= 0) {
            explosions.push(new Splash(sprite.waterUnits, 0, 0, 105, 102,
                bombs.bomb[i].posX-25,  bombs.bomb[i].posY-50, backGround[0].speed,
                [905, 905, 905, 905, 905, 905, 905, 905],
                [6, 108, 210, 312, 414, 516, 618, 720]));
            if (isSound) {
                let sound = new Audio('sound/explosion.mp3');
                sound.volume = 0.7;
                sound.play();
            }
            bombs.bomb.splice(i, 1);
        }
    }
}
function updateHealthUnit(state) {
    if (health.nextHealth >= health.timer) {
        health.nextHealth = health.timer - health.nextHealth + state;
        for (let i = 0; i < health.repeat; i++) {
            let posX = Math.floor(Math.random() * (canvas.width - 450)) + 200;
            let posY = Math.floor(Math.random() * (-100) -18);
            health.health.push(new  Unit(sprite.waterUnits, 750, 480, 50, 60, posX, posY, null, null,
                backGround[0].speed, 100, 100));
        }
    } else {
        health.nextHealth = health.nextHealth + state;
    }
    checkPos(health.health, canvas.height, state);
    for (let i = 0 ; i < health.health.length; i++) {
        const healthUnit = health.health[i];
        healthUnit.speed = backGround[0].speed;
        const [x, y, r, b, x2, y2, r2, b2] =
            [player.posX, player.posY, player.posX+player.width, player.posY+player.height,
                healthUnit.posX, healthUnit.posY, healthUnit.posX+healthUnit.width, healthUnit.posY+healthUnit.height];
        if (collides(x, y, r, b, x2, y2, r2, b2)) {
            player.health = player.health + healthUnit.health;
            if (player.health > player.initHealth) player.health = player.initHealth;
            health.health.splice(i, 1);
        }
    }
}
function updateGunBullets(state) {
    if (gunBullets.nextStore >= gunBullets.timer) {
        gunBullets.nextStore = gunBullets.timer - gunBullets.nextStore + state;
        for (let i = 0; i < gunBullets.repeat; i++) {
            let posX = Math.floor(Math.random() * (canvas.width - 450)) + 200;
            let posY = Math.floor(Math.random() * (-100) -18);
            gunBullets.store.push(new  Unit(sprite.waterUnits, 750, 540, 50, 60, posX, posY, null, null,
                backGround[0].speed, 100, 100));
        }
    } else {
        gunBullets.nextStore = gunBullets.nextStore + state;
    }
    checkPos(gunBullets.store, canvas.height, state);
    for (let i = 0 ; i < gunBullets.store.length; i++) {
        const storeUnit = gunBullets.store[i];
        storeUnit.speed = backGround[0].speed;
        const [x, y, r, b, x2, y2, r2, b2] =
            [player.posX, player.posY, player.posX+player.width, player.posY+player.height,
                storeUnit.posX, storeUnit.posY, storeUnit.posX+storeUnit.width, storeUnit.posY+storeUnit.height];
        if (collides(x, y, r, b, x2, y2, r2, b2)) {
            player.weapon[0].bulletStore =  player.weapon[0].bulletStore + storeUnit.health;
            gunBullets.store.splice(i, 1);
        }
    }
}

function updatePlane(state) {
    if (planes.nextPlane >= planes.timer) {
        planes.nextPlane = planes.timer - planes.nextPlane + state;
        for (let i = 0; i < planes.repeat; i++) {
            // img, x, y, width, height, posX, posY, setX, setY, speed, health, damage, angle, varX, varY, angleX, angleY, bulletSpeed
            let posX = Math.floor(Math.random() * (400)) + player.posX - 200;
            let posY = Math.floor(Math.random() * (-150) -56);
            let onePlane = new  Player(sprite.waterUnits, 808, 306, 60, 50, posX, posY, [808, 808, 748],
                [314,362,362], 150, planes.health, 20, 0);
            onePlane.weapon.push(new  Player(sprite.waterUnits, 0, 0, 0, 0, onePlane.posX + 24, onePlane.posY + 35,
                [0, 0, 0], [0, 0, 0], 3, 0, planes.damage, 0.02, 24, 35, 0, 0, 500));
            onePlane.weapon.push(new  Player(sprite.waterUnits, 0, 0, 0, 0, onePlane.posX + 37, onePlane.posY + 35,
                [0, 0, 0], [0, 0, 0], 3, 0, planes.damage, 0, 37, 35, 0, 0, 500));
            onePlane.trace = new  Player(sprite.waterUnits, 748, 306, 60, 56, onePlane.posX, onePlane.posY + 100,
                [748], [306], 0.02, 150, 20, 0.03, 0, 0, 0, 0, 500);
            planes.plane.push(onePlane);
        }
    } else {
        planes.nextPlane = planes.nextPlane + state;
    }
    checkPos(planes.plane, canvas.height, state);
    // console.log(planes.plane);
    for (let i = 0 ; i < planes.plane.length; i++) {
        planes.plane[i].posY = planes.plane[i].posY + planes.plane[i].speed * state;
        planes.plane[i].trace.posY = planes.plane[i].posY + 150;
        if (planes.plane[i].posY  < player.posY && planes.plane[i].posY > 0) {
            makeBulletsEnemy(planes.plane[i], state);
        }
        const percent = planes.plane[i].health/(planes.plane[i].initHealth*0.01);
        if (percent <= 70 && percent > 40) {
            planes.plane[i].index = 1;
        }
        if (percent <= 40 && percent > 0) {
            planes.plane[i].index = 2;
        }
        if(player.index > 2) player.index = 0;
        planes.plane[i].x = planes.plane[i].setX[planes.plane[i].index];
        planes.plane[i].y = planes.plane[i].setY[planes.plane[i].index];
        if (planes.plane[i].health <= 0) {
            splashes.push(new Splash(sprite.waterUnits, 0, 0, 105, 102,
                planes.plane[i].posX-25,  planes.plane[i].posY-50, backGround[0].speed,
                [905, 905, 905, 905, 905, 905, 905, 905],
                [6, 108, 210, 312, 414, 516, 618, 720]));
            splashes.push(new Splash(sprite.explosions, 0, 0, 105, 102,
                planes.plane[i].posX-25,  planes.plane[i].posY-50, backGround[0].speed,
                [0, 0, 0, 0, 0, 0, 0, 100, 200, 293, 390, 490, 590, 688, 784, 885, 100, 100, 100, 100],
                [0, 100, 200, 295, 395, 490, 590, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 196, 300, 390]));
            if (isSound) {
                let sound = new Audio('sound/planeExp.mp3');
                sound.volume = 0.3;
                sound.play();
            }
            planes.plane.splice(i, 1);
        }
    }
}
function updateTank(state) {
    if (tanks.nextTank >= tanks.timer) {
        tanks.nextTank = tanks.timer - tanks.nextTank + state;
        for (let i = 0; i < tanks.repeat; i++) {
            let side = Math.floor(Math.random() * 2);
            let x1;
            let x2;
            side ? [x1, x2] = [10, 120] : [x1, x2] = [canvas.width - 150, canvas.width - 60];
            // img, x, y, width, height, posX, posY, setX, setY, speed, health, damage, angle, varX, varY, angleX, angleY, bulletSpeed
            let posX = Math.floor(Math.random() * (x2 - x1)) + x1;
            let posY = Math.floor(Math.random() * (-150) -56);
            let oneTank = new  Player(sprite.waterUnits, 670, 883, 42, 47, posX, posY, [670, 712, 754],
                [883,883,883], 120, tanks.health, 0, 0);
            oneTank.weapon.push(new  Player(sprite.waterUnits, 838, 883, 32, 47, oneTank.posX + 3, oneTank.posY + 3,
                [838, 870, 902], [883, 883, 883], 3, 0, tanks.damage, 0, 8, 0, 0, 0, 800));
            oneTank.trace = new  Player(sprite.waterUnits, 796, 883, 42, 80, oneTank.posX, oneTank.posY - 10,
                [796], [883], 0.2, 150, 20, 0, 0, 0, 0, 0, 500);
            tanks.tank.push(oneTank);
        }
    } else {
        tanks.nextTank = tanks.nextTank + state;
    }
    checkPos(tanks.tank, canvas.height, state);
    for (let i = 0 ; i <  tanks.tank.length; i++) {
        tanks.tank[i].posY =tanks.tank[i].posY + tanks.tank[i].speed * state;
        tanks.tank[i].trace.posY = tanks.tank[i].posY -30;
        let weapon = tanks.tank[i].weapon[0];
        weapon.posX = tanks.tank[i].posX + weapon.varX;
        weapon.posY = tanks.tank[i].posY + weapon.varY;

        makeBulletsEnemy(tanks.tank[i], state, true);
        const percent = tanks.tank[i].health/(tanks.tank[i].initHealth*0.01);
        if (percent <= 70 && percent > 40) {
            tanks.tank[i].index = 1;
        }
        if (percent <= 40 && percent > 0) {
            tanks.tank[i].index = 2;
        }
        if(tanks.tank[i].index > 2) tanks.tank[i].index = 0;
        tanks.tank[i].x = tanks.tank[i].setX[tanks.tank[i].index];
        tanks.tank[i].y = tanks.tank[i].setY[tanks.tank[i].index];
        if (tanks.tank[i].health <= 0) {
            splashes.push(new Splash(sprite.waterUnits, 0, 0, 105, 102,
                tanks.tank[i].posX-25,  tanks.tank[i].posY-50, backGround[0].speed,
                [905, 905, 905, 905, 905, 905, 905, 905],
                [6, 108, 210, 312, 414, 516, 618, 720]));
            splashes.push(new Splash(sprite.explosions, 0, 0, 105, 102,
                tanks.tank[i].posX-25,  tanks.tank[i].posY-50, backGround[0].speed,
                [0, 0, 0, 0, 0, 0, 0, 100, 200, 293, 390, 490, 590, 688, 784, 885, 100, 100, 100, 100],
                [0, 100, 200, 295, 395, 490, 590, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 196, 300, 390]));
            marks.push(new  Unit(sprite.explosions, 165, 950, 75, 75, tanks.tank[i].posX-20, tanks.tank[i].posY-20,
                backGround[0].speed));
            if (isSound) {
                let sound = new Audio('sound/tankExp.mp3');
                sound.volume = 0.7;
                sound.play();
            }
            tanks.tank.splice(i, 1);
        }
    }
}
function makeBulletsEnemy(unit, state, angle) {
    let weapon = unit.weapon;
    for (let i = 0; i < weapon.length; i++ ){
        let gun = weapon[i];
        gun.posX = unit.posX + gun.varX;
        gun.posY = unit.posY + gun.varY;
        if (gun.prevShoot > gun.speed) {
            let endX = gun.posX-3; /*tray to fix bullet bag*/
            let endY = Math.floor(Math.random() * (200)) + player.posY - 100;
                if (angle) {
                    endX = Math.floor(Math.random() * (400)) + player.posX - 200;
                    endY = Math.floor(Math.random() * (400)) + player.posY - 200;
                    gun.angle = getAngle(gun.centerX(), gun.centerY(), endX, endY);
                }
                if (endY < canvas.height) {
                    let bullet = new Bullet(sprite.waterUnits, 750, 436, 8, 22, gun.centerX(), gun.centerY(), null, null, gun.bulletSpeed,
                        endX, endY, gun.damage);
                    gun.prevShoot = 0;
                    bullet.mathAngle = getAngleForFire(gun.angle);
                    bullet.angle = gun.angle;
                    buletsEnemy.push(bullet);
                    // console.log(bullets);
                }

        } else {
            gun.prevShoot += state;
        }
        if(buletsEnemy.length) {
            for (let i = 0; i < buletsEnemy.length; i++) {
            }
        }
    }
    updateBullets(buletsEnemy, state);
}
function updateBackGround(state) {
    if (backGround.length) {
        backGround.forEach(item => {
            item.sec += state;
        })
    }
}
function updateInformation(information, player, state) {
    information.score = player.score;
    information.health = player.health/(player.initHealth*0.01);
    if (information.health < 0) information.health = 0;
    information.time += state;
    information.bulletStore = player.weapon[0].bulletStore;
    if (information.bulletStore < 0) information.bulletStore = 0;
}
function renderBackGround(obj) {
    ctx.save();
    ctx.translate(0, (obj.speed * gameTime % obj.height));
    for (var i = 0; i < obj.quantity(); i++) {
        ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height, obj.posX, -obj.height * i, obj.width, obj.height);
    }
    ctx.restore();
}
function renderPlayer(item) {
    let obj = item;
    function drow(obj) {
        ctx.save();
        ctx.translate(obj.centerX(), obj.centerY());
        ctx.rotate(obj.angle);
        ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height, -obj.width/2, -obj.height/2, obj.width, obj.height);
        ctx.restore();
    }
    if (Array.isArray(obj)) {
        for (let i = 0 ; i < item.length; i++) {
            drow(item[i]);
        }
    } else {
        drow(item);
    }
}
function renderInformation(information) {
    information.scoreEl.innerHTML = information.score;
    information.bulletsEl.innerHTML = information.bulletStore;
    information.healthEl.style.width = `${information.health}%`;
    let color;
    if (information.health >= 67) color = '#28e04a';
    if (information.health < 67 && information.health > 33) color = '#eced3d';
    if (information.health <= 33) color = '#fd0724';
    information.healthEl.style.backgroundColor = color;


}

function playreCtrl (state) {
    if (isGameOver) return;

    if(input.isDown('DOWN') || input.isDown('s')) {
        player.posY += player.speed * state;
        if (player.posY > 712) player.posY = 712;
    }

    if(input.isDown('UP') || input.isDown('w')) {
        player.posY -= player.speed * state;
        if (player.posY < 0) player.posY = 0;

    }

    if(input.isDown('LEFT') || input.isDown('a')) {
        player.posX -= player.speed * state;
        if (player.posX < 216) player.posX = 216;
        player.angle = 340 * Math.PI/180;
    }

    if(input.isDown('RIGHT') || input.isDown('d')) {
        player.posX += player.speed * state;
        if (player.posX > canvas.width - 216 - player.width) player.posX = canvas.width - 216 - player.width;
        player.angle = 20 * Math.PI/180;
    }
    if (!((input.isDown('RIGHT') || input.isDown('d')) || (input.isDown('LEFT') || input.isDown('a')))) {
        player.angle = 0;
    }
}
function getCursorCoor(event) {
    cursorCoor[0] = event.clientX - canvas.offsetLeft;
    cursorCoor[1] = event.clientY - canvas.offsetTop;
    // console.log(cursorCoor);
}
function getAngle(X1, Y1, X2, Y2) {
    const x2 = X1 - X2;
    const y2 = Y1 - Y2;
    const x1 = 0;
    const y1 = 500;
    const cos = (x1*x2 + y1*y2) / (Math.sqrt(x1*x1 + y1*y1) * Math.sqrt(x2*x2 + y2*y2));
    let deg = Math.acos(cos);
    if (X1 > X2) deg = 2*Math.PI - deg;
    // console.log(deg);
    return deg;
}
function runFire(e) {
    if (e.which  === 1) {
        fire.right = true;
    }
    if (e.which  === 3) {
        fire.left = true;
    }
    // console.log(fire);
}
function stopFire(e) {
    if (e.which  === 1) {
        fire.right = false;
    }
    if (e.which  === 3) {
        fire.left = false;
    }
}
function checkPos(obg, limit, state) {
    if (obg.length) {
        for (let i = 0; i < obg.length; i++) {
            const unit = obg[i];
            if (unit.posY > limit) obg.splice(i, 1);
            unit.posY = unit.posY + unit.speed * state;
        }
        // console.log(marks);
    }
}
function getAngleForFire(angel) {
    let grad = angel / (Math.PI/180);
    if (grad > 360) grad = grad - 360;
    if (grad <= 180 && grad > 90) {
        grad = 180 - grad;
        return (grad * Math.PI/180);
    }
    if (grad <= 270 && grad > 180) {
        grad = grad - 180;
        return (grad * Math.PI/180);
    }
    if (grad <= 360 && grad > 270) {
        grad = 360 - grad;
        return (grad * Math.PI/180);
    }

    return (grad * Math.PI/180);
}
function checkDamages(attacker, victim, addScore) {
    let [attac, vict] = [attacker, victim];

    for (let i = 0; i < attac.length; i++) {
        let a = attac[i];
        for (let j = 0 ; j < vict.length ; j++) {
            let [x, y, r, b] = [a.posX, a.posY, a.posX + a.width, a.posY + a.height];
            let [x2, y2, r2, b2] = [vict[j].posX, vict[j].posY, vict[j].posX + vict[j].width, vict[j].posY + vict[j].height];
            if (collides(x, y, r, b, x2, y2, r2, b2)) {
                if (addScore) {
                    a.damage > vict[j].health ? player.score += vict[j].health : player.score += a.damage;
                }
                vict[j].health = vict[j].health - a.damage;
                if (a.health) a.health = a.health - vict[j].damage;
                if (attac.length === 1) return true;
            }

        }
    }
}
function collides(x, y, r, b, x2, y2, r2, b2) {
    return !(r <= x2 || x > r2 ||
    b <= y2 || y > b2);
}
function getCoorFromAngle (obj, state) {
    const angle = obj.mathAngle;
    const c = obj.speed * state;
    const b = Math.cos(angle) * c;
    const a = Math.sqrt(c * c - b * b);
    return {
        x: a,
        y: b
    }
}



