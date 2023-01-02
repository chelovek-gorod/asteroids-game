'use strict';

/*************************
 * 
 *   ПОДГОТОВКА ХОЛСТА
 */

const canvas = document.createElement('canvas'); // создаём холст
const ctx = canvas.getContext('2d'); // получаем контекст (спомощью методов контекста будем расовать)

let vw, vh, vcx, vcy; // создаём переменные (vw - ширина холста, vh - высота холста, vcx и vcy - ценрры по X и Y)
const scale = 2; // определяем масштабирование (в 1ом пикселе будет 2*2 пикселя)
const canvasTegWidth = window.innerWidth; // определяем ширину окна браузера 
const canvasTegHeight = window.innerHeight; // определяем высоту окна браузера 

canvas.width = vw = canvasTegWidth * scale; // задаём ширину холста (размер окна * масштаб)
canvas.height = vh = canvasTegHeight * scale; // задаём высоту холста (размер окна * масштаб)
canvas.style.width = canvasTegWidth + 'px'; // задаём в CSS ширину холста
canvas.style.height = canvasTegHeight + 'px'; // задаём в CSS высоту холста
vcx = Math.floor(vw / 2); // определяем координату X центра холста
vcy = Math.floor(vh / 2); // определяем координату Y центра холста

// массив файлов загрузки
let loadingsArr = [];

// старт игры
let isGameStart = false;

/*************************
 * 
 *   ЗАГРУЗКА ЗВУКОВ
 */

// путь к файлам звуков
const SOUNDS_PATH = './src/sounds/';

// создаём объекты для проигрования фоновфх звуков и музыки
const BG_MUSIC = new Audio(); // этот объект будем использовать для проигрования фоновой музыки
const SE_GAME = new Audio(); // этот объект будем использовать для проигрования фоновых звуков событий в игре
const SE_PLAYER = new Audio(); // этот объект будем использовать для проигрования фоновых звуков при действиях игрока

// функция для проигрования звуков при событиях в игре
function playSeGame(sound) {
    SE_GAME.src = SOUNDS_PATH + sound +'.mp3';
    SE_GAME.play(); // включить выбранный звук
}

// функция для проигрования звуков при действиях игрока
function playSePlayer(sound) {
    SE_PLAYER.src = SOUNDS_PATH + sound +'.mp3';
    SE_PLAYER.play(); // включить выбранный звук
}

// массив с названием фоновых музык игры
const bgMusicsArr = ['bgm_hard_times', 'bgm_deep_space', 'bgm_space'];
let bgMusicIndex = 0; // начинать проигрование фоновой музыки с первой

// функция для проигрования фоновых музык по очереди
function playBgMusic() {
    BG_MUSIC.src = SOUNDS_PATH + bgMusicsArr[bgMusicIndex] + '.mp3';
    BG_MUSIC.play(); // включить выбранную из массива музыку
    bgMusicIndex++; // задать номер следующей музыки из массива
    // если это была последняя музыка в массиве - переключиться на первую
    if (bgMusicIndex === bgMusicsArr.length) bgMusicIndex = 0;
    // отслеживать окончания музыки, после чего вызываьб функцию "playBgMusic()" повторно
    BG_MUSIC.addEventListener('ended', playBgMusic);
}

/*************************
 * 
 *   ЗАГРУЗКА СПРАЙТОВ
 */

// путь к файлам спрайтов
const SPRITES_PATH = './src/sprites/';

// класс загрузки спрайтов
class Sprite {
    // принимает ссылку на картинку, ширину картинки, высоту картинки и количество кадров
    constructor(src, width, height, frames) {
        this.img = new Image(); // создайм в памяти изображение ( <img src="ссылка на картинку"> )
        this.img.src = SPRITES_PATH + src; // указываем путь к картинки и назфание файла с картинкой
        this.frames = frames; // устанавливаем количество кадров
        this.frameWidth = Math.round(width / frames); // определяем ширину кадра разделив ширину картинки на число кадров
        this.frameHeight = height; // устанавливаем высоту кадра
        this.isLoaded = false; // в переменной статуса загрузки false - означает что картинка еще не загрузилась
        // ожидание загрузки картинки
        this.img.onload = () => {
            // когда картинка загрузится меняем статус загрузки на true
            this.isLoaded = true;
            // удаляем загруженную картинку из массива загружаемых картинок
            loadingsArr = loadingsArr.filter( sprite => !sprite.isLoaded );
            if (loadingsArr.length === 0) gameReady(); // если в массиве загрузок больше нет файлов - вызываем функцию "gameReady()"
            else console.log(loadingsArr); // иначе - выводим в консоль массив, с изображениями, ожидающими загрузки
        };
        // добавляем в массив загрузак картинку, ожидающую загрузку
        loadingsArr.push(this);
    }
}

/*********************
 * 
 *   ЗАПУСК ИГРЫ
 */

// вызываем, когда все картинки загрузятся
function gameReady() {
    console.log('ALL SOURCES IS LOADED');
    // создаём кнопку "START"
    const startButton = document.createElement('div');
    startButton.id = 'startButton';
    startButton.innerText = 'START';
    startButton.onclick = gameStart; // после клика по кнопке - вызываем функцию "gameStart()"
    document.body.append(startButton);  // добавляем кнопку в документ
}

// функция запуска игры
function gameStart() {
    // удаляем кнопку "START"
    document.getElementById('startButton').remove();

    // добавляем на экран холст и панели с информацией и кнопками (leftBoard и rightBoard)
    document.body.append(canvas);
    document.body.append(leftBoard);
    document.body.append(rightBoard);
    boardUpdate(); // запускаем функцию обновления информации на понелях (leftBoard и rightBoard)

    // запускаем анимацию с ~60 fps
    requestAnimationFrame( animation );

    // меняем значение переменной, отвечающую за состояние игры
    isGameStart = true;
    
    // звуки можно включать только после любого события клика пользователя,
    // а функция "gameStart()" - вызывается как раз после клика по кнопке "START"
    playBgMusic(); // запускаем фоновую музыку
}

// функция проигрыша
function gameOver() {
    isGameStart = false; // меняем состояние игры (останавливаем обновление холста)
    ctx.clearRect(0, 0, vw, vh); // числим весь холст

    BG_MUSIC.src = SOUNDS_PATH + 'bgm_gameover' + '.mp3';
    BG_MUSIC.play();

    // создаем блок с текстом "GAME OVER"
    const message = document.createElement('div');
    message.id = 'finalMessage';
    message.innerText = 'GAME OVER';
    document.body.append(message); // добавляем блок в документ
}

// функция победы
function win() {
    isGameStart = false; // меняем состояние игры (останавливаем обновление холста)
    ctx.clearRect(0, 0, vw, vh); // числим весь холст

    // создаем блок с текстом "YOU WIN"
    const message = document.createElement('div');
    message.id = 'finalMessage';
    message.innerText = 'YOU WIN';
    document.body.append(message); // добавляем блок в документ
}

// функция показа блоков с сообщениями
function message(text) {
    const message = document.createElement('div');
    message.className = 'message';
    message.innerText = text;
    document.body.append(message);

    // через 1000 миллисекунд удаляем блок с сообщением
    setTimeout( () => message.remove(), 1000 );
}

/******************************
 * 
 *   ИНФОРМАЦИОННЫЕ ПАНЕЛИ
 */

// сколько нужно сбить астеройдов для победы
const levelToWin = 100;

// начальные очки и уровень (число сбитых астеройдов)
let score = 0;
let level = 0;

// начальные деньги и броня
let money = 1500;
let armor = 100;
let maxArmor = armor;

// активация обноружений астеройдов
let isDetect = false;
// стоимость активации обнаружения
let detectCost = 900;

// добавление брони при апгрейде
let upgradeAddArmor = 10;
// добавление к ремонту при улучшении брони
let upgradeAddRepair = 5;
// стоимость улучшения брони
let upgradeArmorCost = 500;

// восстановление брони при ремонте
let repairArmorAdd = 50
// стоимость ремонта брони
let repairCost = 500;

// сила атаки оружия
let laserGunPower = 100;
// коэффициент добаление силы
let laserGunPowerScale = 1.1;
// стоимости улучшения силы оружия
let upgradePowerCost = 200;

// расстояние от угла до центра экрана
let distanceToScreenCenter = Math.sqrt( Math.pow(vcx, 2) + Math.pow(vcy, 2) );
// скорость наведения оружия (пикселей в секунду (1000ms))
let aimingSpeed = (distanceToScreenCenter / 5) / 1000;
// коэффициент увеличения скорости наведения
let aimingSpeedScale = 1.2;
// стоимость улучшения наведения оружия
let upgradeAimingCost = 200;

// скорость перезярядки и коэффициент увеличения скорости перезарядки в объекте cursor

// стоимость улучшения скорости перезарядки оружия
let upgradeReloadingCost = 200

// левая панель
const leftBoard = document.createElement('div');
leftBoard.classList.add( 'board', 'left-board');

// таймер появления астеройдов
const levelDiv = document.createElement('div');
levelDiv.className = 'level';
leftBoard.append(levelDiv);

// броня
const armorDiv = document.createElement('div');
armorDiv.className = 'armor';
leftBoard.append(armorDiv);

// очки
const scoreDiv = document.createElement('div');
scoreDiv.className = 'score';
leftBoard.append(scoreDiv);

// деньги
const moneyDiv = document.createElement('div');
moneyDiv.className = 'money';
leftBoard.append(moneyDiv);

// правая панель
const rightBoard = document.createElement('div');
rightBoard.classList.add( 'board', 'right-board');

// апгрейт силы выстрела
const upgradePowerDiv = document.createElement('div');
upgradePowerDiv.className = 'upgrade-power';
upgradePowerDiv.innerHTML = `<span>${upgradePowerCost} $ (Q)</span>`;
upgradePowerDiv.onclick = function() {
    isButtonOnclick = true;
    getClickUpgradePower();
}
rightBoard.append(upgradePowerDiv);

// апгрейт скорости прицеливания
const upgradeAimingDiv = document.createElement('div');
upgradeAimingDiv.className = 'upgrade-aiming';
upgradeAimingDiv.innerHTML = `<span>${upgradeAimingCost} $ (W)</span>`;
upgradeAimingDiv.onclick = function() {
    isButtonOnclick = true;
    getClickUpgradeAiming();
}
rightBoard.append(upgradeAimingDiv);

// апгрейт скорости перезарядки
const upgradeReloadingDiv = document.createElement('div');
upgradeReloadingDiv.className = 'upgrade-reloading';
upgradeReloadingDiv.innerHTML = `<span>${upgradeReloadingCost} $ (E)</span>`;
upgradeReloadingDiv.onclick = function() {
    isButtonOnclick = true;
    getClickUpgradeReloading();
}
rightBoard.append(upgradeReloadingDiv);

// ремонт
const repairDiv = document.createElement('div');
repairDiv.className = 'repair';
repairDiv.innerHTML = `<span>${repairCost} $ (R)</span>`;
repairDiv.onclick = function() {
    isButtonOnclick = true;
    getClickRepair();
}
rightBoard.append(repairDiv);

// улучшение защиты и ремонта
const upgradeArmorDiv = document.createElement('div');
upgradeArmorDiv.className = 'upgrade-armor';
upgradeArmorDiv.innerHTML = `<span>${repairCost} $ (T)</span>`;
upgradeArmorDiv.onclick = function() {
    isButtonOnclick = true;
    getClickUpgradeArmor();
}
rightBoard.append(upgradeArmorDiv);

// активация детектора астеройдов
const detectorDiv = document.createElement('div');
detectorDiv.className = 'detector';
detectorDiv.innerHTML = `<span>${detectCost} $ (Y)</span>`;
detectorDiv.onclick = function() {
    isButtonOnclick = true;
    getClickUpgradeDetector();
}
rightBoard.append(detectorDiv);

// функция обновления информации на понелях
function boardUpdate() {
    levelDiv.innerText = `LEVEL: ${level}`;
    armorDiv.innerText = `ARMOR: ${armor}%`;
    scoreDiv.innerText = `SCORE: ${('0000000' + score).slice(-7)}`;
    moneyDiv.innerText = `$: ${money}`;
    repairDiv.classList.toggle('grayscale', money < repairCost || armor === maxArmor);
    upgradeArmorDiv.classList.toggle('grayscale', money < upgradeArmorCost);
    upgradeAimingDiv.classList.toggle('grayscale', money < upgradeAimingCost);
    upgradeReloadingDiv.classList.toggle('grayscale', money < upgradeReloadingCost);
    upgradePowerDiv.classList.toggle('grayscale', money < upgradePowerCost);
    detectorDiv.classList.toggle('grayscale', money < detectCost || isDetect);
}

// попытка улучшить силу оружия
function getClickUpgradePower() {
    if (money >= upgradePowerCost) {
        playSePlayer('se_upgrade');
        money -= upgradePowerCost;

        laserGunPower *= laserGunPowerScale;

        boardUpdate();
        message('POWER = ' + laserGunPower.toFixed());
    }
}

// попытка улучшить скорость наведения
function getClickUpgradeAiming() {
    if (money >= upgradeAimingCost) {
        playSePlayer('se_upgrade');
        money -= upgradeAimingCost;

        aimingSpeed *= aimingSpeedScale;

        boardUpdate();
        message('AIM SPEED = ' + (aimingSpeed * 1000).toFixed() + ' px/s');
    }
}

// попытка улучшить скорость перезарядки
function getClickUpgradeReloading() {
    if (money >= upgradeReloadingCost) {
        playSePlayer('se_upgrade');
        money -= upgradeReloadingCost;

        cursor.reloadTimeout *= cursor.reloadTimeoutScale;

        boardUpdate();
        message('RELOADING = ' + (cursor.reloadTimeout * cursor.frames / 1000).toFixed(2) + ' s');
    }
}

// попытка улучшить броню и ремонт
function getClickUpgradeArmor() {
    if (money >= upgradeArmorCost) {
        playSePlayer('se_upgrade');
        money -= upgradeArmorCost;

        maxArmor += upgradeAddArmor;
        repairArmorAdd += upgradeAddRepair;

        boardUpdate();
        message('MAX ARMOR = ' + maxArmor.toFixed());
    }
}

// попытка ремонта брони
function getClickRepair() {
    if (money >= repairCost && armor < maxArmor) {
        playSePlayer('se_upgrade');
        money -= repairCost;

        armor += repairArmorAdd;
        if (armor > maxArmor) {
            armor = maxArmor;
            shardsArr.length = 0
        } else shardsArr.length = Math.floor(shardsArr.length / 2)

        boardUpdate();
        message('ARMOR + ' + repairArmorAdd.toFixed() + ' %');
    }
}

// попытка активации обнаружения астеройдов
function getClickUpgradeDetector() {
    if (money >= detectCost && !isDetect) {
        playSePlayer('se_upgrade');
        money -= detectCost;

        isDetect = true;

        boardUpdate();
        message('DETECTOR IS ACTIVATED');
    }
}

/******************************
 * 
 *   ОСКОЛКИ СТЕКЛА
 */

class Shards {
    constructor(x, y, isSmall) {
        this.sprite = (isSmall) ? smallGlassShardsSprite : glassShardsSprite;
        this.img = this.sprite.img;
        this.x = x - Math.floor( this.sprite.frameWidth / 2 );
        this.y = y - Math.floor( this.sprite.frameHeight / 2 );
        this.w = this.sprite.frameWidth;
        this.h = this.sprite.frameHeight;
        this.frameX = this.sprite.frameWidth * Math.floor( Math.random() * this.sprite.frames );
        this.isExist = true;
    }

    draw() {
        ctx.drawImage(
            this.img,    // Объект Image или canvas 
            this.frameX, // позиция X прямоуголника начала спрайта
            0, // позиция Y прямоуголника начала спрайта
            this.w, // ширена прямоуголника отображаемой части спрайта
            this.h, // высота прямоуголника отображаемой части спрайта
            this.x, // позиция X начала отобрадения спрайта на canvas
            this.y, // позиция Y начала отобрадения спрайта на canvas
            this.w, // ширина для отобрадения спрайта на canvas
            this.h // высота для начала отобрадения спрайта на canvas
        );
    }
}
 
// массив с трещинами в стекле
let shardsArr = [];

/************************************
 * 
 *   АСТЕРОЙДЫ, КАМНИ И ЭФФЕКТЫ
 */

//                                                               scr, frames, width, height                
const asteroid_gold = new Sprite ('asteroid_gold_2550x100_30frames.png', 2550, 100, 30);
const rock_gold = new Sprite ('rock_gold_408x51_8frames.png', 408, 51, 8);

const asteroid_iron = new Sprite ('asteroid_iron_2639x109_29frames.png', 2639, 109, 29);
const rock_iron = new Sprite ('rock_iron_408x51_8frames.png', 408, 51, 8);

const asteroid_white = new Sprite ('asteroid_white_2639x109_29frames.png', 2639, 109, 29);
const rock_white = new Sprite ('rock_white_408x51_8frames.png', 408, 51, 8);

const asteroid_calcium = new Sprite ('asteroid_calcium_8192x128_64frames.png', 8192, 128, 64);
const rock_calcium = new Sprite ('rock_calcium_408x51_8frames.png', 408, 51, 8);

const asteroid_carbon = new Sprite ('asteroid_carbon_8192x128_64frames.png', 8192, 128, 64);
const rock_carbon = new Sprite ('rock_carbon_408x51_8frames.png', 408, 51, 8);

const asteroid_ice = new Sprite ('asteroid_ice_8192x128_64frames.png', 8192, 128, 64);
const rock_ice = new Sprite ('rock_ice_408x51_8frames.png', 408, 51, 8);

const asteroid_silicon = new Sprite ('asteroid_silicon_8192x128_64frames.png', 8192, 128, 64);
const rock_silicon = new Sprite ('rock_silicon_408x51_8frames.png', 408, 51, 8);

const explosionSprite = new Sprite ('explosion_6400x400_16frames.png', 6400, 400, 16);
const glassShardsSprite = new Sprite ('glass_shards_1600x400_4frames.png', 1600, 400, 4);
const smallGlassShardsSprite = new Sprite ('glass_shards_small_800x200_4frames.png', 800, 200, 4);

/**************
 * 
 *   РАДАР
 */

const detector = new Sprite ('detector_1200x150_8frames.png', 1200, 150, 8);
 
detector.draw = function( x, y, size ) {
    let frameX = Math.round(size / 0.2);
 
    ctx.drawImage(
        this.img,    // Объект Image или canvas 
        frameX * this.frameWidth, // позиция X прямоуголника начала спрайта
        0, // позиция Y прямоуголника начала спрайта
        150, // ширена прямоуголника отображаемой части спрайта
        150, // высота прямоуголника отображаемой части спрайта
        x - 75, // позиция X начала отобрадения спрайта на canvas
        y - 75, // позиция Y начала отобрадения спрайта на canvas
        150, // ширина для отобрадения спрайта на canvas
        150  // высота для начала отобрадения спрайта на canvas
    );
}
let detectorsArr = [];

/*************************
 * 
 *   КУРСОР
 */

const cursor = new Sprite ('cursor_840x120_7frames.png', 840, 120, 7);
cursor.isReady = false;
cursor.frameX = 0;
cursor.lastFrame = cursor.frames - 1 ;
cursor.reloadTimeout = 3 * (1000 / cursor.frames);
cursor.reloadTimeoutScale = 0.85;
cursor.reserveTime= 0;

cursor.draw = function( frameTimeout ) {
    if ( !this.isReady ) {
        this.reserveTime += frameTimeout;

        if ( this.reserveTime > this.reloadTimeout ) {
            this.frameX++;
            this.reserveTime -= this.reloadTimeout;

            if ( this.frameX === this.lastFrame ) {
                this.reserveTime= 0;
                this.isReady = true;
            }
        }
    }

    ctx.drawImage(
        this.img,    // Объект Image или canvas 
        this.frameX * this.frameWidth, // позиция X прямоуголника начала спрайта
        0, // позиция Y прямоуголника начала спрайта
        120, // ширена прямоуголника отображаемой части спрайта
        120, // высота прямоуголника отображаемой части спрайта
        mouseX - 60, // позиция X начала отобрадения спрайта на canvas
        mouseY - 60, // позиция Y начала отобрадения спрайта на canvas
        120, // ширина для отобрадения спрайта на canvas
        120  // высота для начала отобрадения спрайта на canvas
    );
}

/*************************
 * 
 *   ПРИЦЕЛ
 */

const aim = new Sprite ('aim.png', 120, 120, 1);
aim.x = vcx;
aim.y = vcy;

aim.isOnTarget = false;

aim.draw = function( frameTimeout ) {
    let speed = aimingSpeed * frameTimeout;
    let dx = mouseX - this.x;
    let dy = mouseY - this.y;

    let distance = Math.sqrt( Math.pow( dx, 2) + Math.pow( dy, 2) );
    if (distance > 60) this.isOnTarget = false;
    let path = speed / distance;

    if (path < 1) {
        this.x += dx * path;
        this.y += dy * path;
    } else {
        this.x = mouseX;
        this.y = mouseY;
        if (!this.isOnTarget && cursor.isReady) {
            this.isOnTarget = true;
            playSeGame('se_target');
        }    
    }

    ctx.drawImage(
        this.img,    // Объект Image или canvas 
        0, // позиция X прямоуголника начала спрайта
        0, // позиция Y прямоуголника начала спрайта
        120, // ширена прямоуголника отображаемой части спрайта
        120, // высота прямоуголника отображаемой части спрайта
        this.x - 60, // позиция X начала отобрадения спрайта на canvas
        this.y - 60, // позиция Y начала отобрадения спрайта на canvas
        120, // ширина для отобрадения спрайта на canvas
        120  // высота для начала отобрадения спрайта на canvas
    );
}

/*************************
 * 
 *   ОРУЖИЕ
 */

const gunBase = new Sprite ('gun_base_320x100x1frame.png', 320, 100, 1);
gunBase.x = vcx - 160;
gunBase.y = vh - 100;
gunBase.draw = function() {
    ctx.drawImage( 
        this.img,    // Объект Image или canvas 
        0, // позиция X прямоуголника начала спрайта
        0, // позиция Y прямоуголника начала спрайта
        this.frameWidth, // ширена прямоуголника отображаемой части спрайта
        this.frameHeight, // высота прямоуголника отображаемой части спрайта
        this.x, // позиция X начала отобрадения спрайта на canvas
        this.y, // позиция Y начала отобрадения спрайта на canvas
        this.frameWidth, // ширина для отобрадения спрайта на canvas
        this.frameHeight // высота для начала отобрадения спрайта на canvas
    );
}

const laserGun = new Sprite ('laser_gun_128x764x1frame.png', 128, 764, 1);
laserGun.angle = 0;
laserGun.x = vcx;
laserGun.y = vh;
laserGun.maxDistancePoint = Math.sqrt( Math.pow( vcx, 2) + Math.pow( vh, 2) );

laserGun.draw = function() {

    let dx = this.x - aim.x;
    let dy = this.y - aim.y;
    this.angle = Math.PI*2 - Math.atan(dx / dy);

    let aimScale = Math.sqrt( Math.pow( dx, 2) + Math.pow( dy, 2) ) / this.maxDistancePoint;

    // поворачиваем изображение
    //ctx.setTransform( scaleX (1), skewY (0), skewX (0), scaleY (1), centerX, centerY);
    ctx.setTransform(1, 0, 0, 1, this.x, this.y);
    ctx.rotate(this.angle);

    ctx.drawImage( 
        this.img,    // Объект Image или canvas 
        0, // позиция X прямоуголника начала спрайта
        0, // позиция Y прямоуголника начала спрайта
        this.frameWidth, // ширена прямоуголника отображаемой части спрайта
        this.frameHeight, // высота прямоуголника отображаемой части спрайта
        -this.frameWidth / 2, // позиция X начала отобрадения спрайта на canvas
        -this.frameHeight * aimScale, // позиция Y начала отобрадения спрайта на canvas
        this.frameWidth, // ширина для отобрадения спрайта на canvas
        this.frameHeight * aimScale  // высота для начала отобрадения спрайта на canvas
    );

    // возвращаем исходное состояние холста
    ctx.setTransform(1,0,0,1,0,0);
}

// луч
class LaserLight {
    constructor() {
        this.width = 18;
        this.color = '#000fff88';
        this.path = this.getPath();
        this.targetX = aim.x;
        this.targetY = aim.y;
        this.stepIndex = 0;
        this.isExist = true;
    }

    getPath() {
        let dx = aim.x - vcx;
        let dy = aim.y - vh;
        let steps = 24;
        let stepX = dx / steps;
        let stepY = dy / steps;
        let path = [];
        // _0 _1 _2 _3 _4 _5 _6 _7 _8 _9 10 11
        //                      _7 _8 _9 10 11 12 13 14 15
        //                                     12 13 14 15 16 17 18
        //                                                 16 17 18 19 20
        //                                                          19 20 21 22
        //                                                                21 22 23
        //                                                                      23 24
        path.push({x0: vcx             , y0: vh             , x1: vcx + stepX * 11, y1: vh + stepY * 11});
        path.push({x0: vcx + stepX * 7 , y0: vh + stepY * 7 , x1: vcx + stepX * 15, y1: vh + stepY * 15});
        path.push({x0: vcx + stepX * 12, y0: vh + stepY * 12, x1: vcx + stepX * 18, y1: vh + stepY * 18});
        path.push({x0: vcx + stepX * 16, y0: vh + stepY * 16, x1: vcx + stepX * 20, y1: vh + stepY * 20});
        path.push({x0: vcx + stepX * 19, y0: vh + stepY * 19, x1: vcx + stepX * 22, y1: vh + stepY * 22});
        path.push({x0: vcx + stepX * 21, y0: vh + stepY * 21, x1: vcx + stepX * 23, y1: vh + stepY * 23});
        path.push({x0: vcx + stepX * 23, y0: vh + stepY * 23, x1: vcx + stepX * 24, y1: vh + stepY * 24});
        return path;
    }

    draw() {
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineWidth = this.width;
        ctx.strokeStyle = this.color;
        ctx.moveTo(this.path[this.stepIndex].x0, this.path[this.stepIndex].y0);
        ctx.lineTo(this.path[this.stepIndex].x1, this.path[this.stepIndex].y1);
        ctx.stroke();

        this.width--;
        this.stepIndex++;
        if (this.stepIndex === this.path.length) {
            // проверка попадания в камень
            rocksArr.forEach( rock => {
                let dist = getDistance(rock.x, rock.y, this.targetX, this.targetY);
                if (dist < rock.size * rock.sizeScale) rock.isExist = false;
            });

            // проверка попадания в астеройд
            asteroidsArr.forEach( asteroid => {
                let dist = getDistance(asteroid.x, asteroid.y, this.targetX, this.targetY);
                if (dist < asteroid.size * asteroid.sizeScale) asteroid.getDamage();
            });

            this.isExist = false;
        } 
    }
}
let laserLightsArr = [];

// взрыв
class Explosion {
    constructor(x, y, sizeScale) {
        this.x = x;
        this.y = y;
        this.frameSpin = 2;
        this.sizeScale = sizeScale;
        this.frames = explosionSprite.frames;
        this.frameW = explosionSprite.frameWidth;
        this.frameH = explosionSprite.frameHeight;
        this.frameCX = Math.floor(this.frameW / 2);
        this.frameCY = Math.floor(this.frameH / 2);
        this.frame = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.isExist = true;
    }

    draw() {
        ctx.drawImage(
            explosionSprite.img,    // Объект Image или canvas 
            this.frameX, // позиция X прямоуголника начала спрайта
            this.frameY, // позиция Y прямоуголника начала спрайта
            this.frameW, // ширена прямоуголника отображаемой части спрайта
            this.frameH, // высота прямоуголника отображаемой части спрайта
            this.x - this.frameCX * this.sizeScale, // позиция X начала отобрадения спрайта на canvas
            this.y - this.frameCY * this.sizeScale, // позиция Y начала отобрадения спрайта на canvas
            this.frameW * this.sizeScale, // ширина для отобрадения спрайта на canvas
            this.frameH * this.sizeScale // высота для начала отобрадения спрайта на canvas
        );
        // проверка переключения кадра и переход в начало, если это был последний кадр
        if (frame % this.frameSpin === 0) {
            this.frame++;
            this.frameX = this.frameW * this.frame;
        }
        if (this.frame === this.frames) this.isExist = false;
    }
}
let explosionsArr = [];

/******************
 * 
 *   АСТЕРОЙДЫ
 */

// определяем зону появления астеройдов
const asteroidMinStartX = Math.floor(vw / 8);
const asteroidMaxStartX = Math.floor(asteroidMinStartX * 6);
const asteroidMinStartY = Math.floor(vh / 8);
const asteroidMaxStartY = Math.floor(asteroidMinStartY * 5);

class Asteroid {
    constructor( image, rockImage, hp, score ) {
        this.hp = hp;
        this.rocks = Math.round(hp / 50);
        this.score = score;
        this.x = getRandom( asteroidMinStartX, asteroidMaxStartX );
        this.y = getRandom( asteroidMinStartY, asteroidMaxStartY );

        this.vcdx = this.x - vcx; // растояние от центра 
        this.vcdy = this.y - vcy; // растояние от центра

        this.stepScaleX = this.vcdx / (100 * vw); // коэффициент смещения по оси X
        this.stepScaleY = this.vcdy / (100 * vh); // коэффициент смещения по оси Y

        this.sizeScaleStep = 1 + Math.random() / 100; // коэффициент изменения размеров
        this.sizeScale = 0.01 + Math.random() / 500; // начальный размер
        this.size = image.frameWidth > image.frameHeight ? image.frameWidth : image.frameHeight;

        this.img = image.img;
        this.frameSpin = 1 + Math.ceil( Math.random() * 2); // 1, 2 or 3
        this.frames = image.frames;
        this.frameW = image.frameWidth;
        this.frameH = image.frameHeight;
        this.frameCX = Math.floor(this.frameW / 2);
        this.frameCY = Math.floor(this.frameH / 2);
        this.frame = 0;
        this.frameX = 0;
        this.frameY = 0;

        this.rockImage = rockImage;

        this.isExist = true;
    }

    draw( frameTimeout, frame ) {
        const dt = frameTimeout / 1000;
        // обновляем масштаб

        ctx.drawImage(
            this.img,    // Объект Image или canvas 
            this.frameX, // позиция X прямоуголника начала спрайта
            this.frameY, // позиция Y прямоуголника начала спрайта
            this.frameW, // ширена прямоуголника отображаемой части спрайта
            this.frameH, // высота прямоуголника отображаемой части спрайта
            this.x - this.frameCX * this.sizeScale, // позиция X начала отобрадения спрайта на canvas
            this.y - this.frameCY * this.sizeScale, // позиция Y начала отобрадения спрайта на canvas
            this.frameW * this.sizeScale, // ширина для отобрадения спрайта на canvas
            this.frameH * this.sizeScale // высота для начала отобрадения спрайта на canvas
        );
        if (isDetect) detector.draw(this.x, this.y, this.sizeScale);
        /*
        ctx.beginPath();
        ctx.strokeStyle = (this.sizeScale < 0.75) ? '#ffff00' : '#ff0000';
        ctx.lineWidth = 2;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.stroke();
        */

        // проверка переключения кадра и переход в начало, если это был последний кадр
        if (frame % this.frameSpin === 0) {
            this.frame++;
            this.frameX = this.frameW * this.frame;
        }
        if (this.frame === this.frames) this.frame = 0;

        // движение астеройдов
        this.x += this.stepScaleX * dt;
        this.y += this.stepScaleY * dt;
        this.stepScaleX *= 1 + dt;
        this.stepScaleY *= 1 + dt;

        // обновляем масштаб
        this.sizeScale *= this.sizeScaleStep * (1 + dt/10);
        if (this.isExist && this.sizeScale > 1.5) {
            playSeGame('se_glass');
            armor -= Math.ceil(this.hp / 10);
            if (armor <= 0) gameOver();
            else shardsArr.push( new Shards(this.x, this.y) );

            boardUpdate();
            this.isExist = false;
        }

        // проверяем существование
        if (this.x + this.frameW < 0
        || this.x - this.frameW > vw
        || this.y + this.frameH < 0
        || this.y - this.frameH > vh) {
            this.isExist = false;
        }
    }

    getDamage() {
        this.hp -= laserGunPower;
        score += Math.ceil(this.score / this.sizeScale);
        if (this.hp <= 0) {
            playSeGame('se_explosion');
            money += this.score;
            explosionsArr.push( new Explosion(this.x, this.y, this.sizeScale) );
            for(let i = 0; i < this.rocks; i++)
                rocksArr.push( new Rock(this.rockImage, this.x, this.y, this.sizeScale));
            this.isExist = false;

            level++;
            boardUpdate();

            if (level >= levelToWin) win();
            else updateAsteroidsArr();
                
        } else message(this.hp.toFixed() + ' hp');
    }
}
// массив объектов
let asteroidsArr = [];

let addAsteroidIndex = 0;
let addAsteroidsArr = [
    {image: asteroid_ice,     rockImage: rock_ice,     hp: 100, score: 50},
    {image: asteroid_ice,     rockImage: rock_ice,     hp: 100, score: 50},
    {image: asteroid_ice,     rockImage: rock_ice,     hp: 100, score: 50},
    {image: asteroid_ice,     rockImage: rock_ice,     hp: 100, score: 50},
    {image: asteroid_ice,     rockImage: rock_ice,     hp: 100, score: 50},

    {image: asteroid_silicon, rockImage: rock_silicon, hp: 120, score: 70},
    {image: asteroid_silicon, rockImage: rock_silicon, hp: 120, score: 70},

    {image: asteroid_gold,    rockImage: rock_gold,    hp: 200, score: 500}
];
addAsteroidsArr.sort(() => Math.random() - 0.5);

function updateAsteroidsArr() {
    if (level % 5 === 0) {
        addAsteroidsArr.push({image: asteroid_calcium, rockImage: rock_calcium, hp: 150, score: 100});
        addAsteroidsArr.push({image: asteroid_calcium, rockImage: rock_calcium, hp: 150, score: 100});
        addAsteroidsArr.push({image: asteroid_silicon, rockImage: rock_silicon, hp: 120, score: 70});
    }
    if (level % 10 === 0) {
        addAsteroidsArr.push({image: asteroid_carbon,  rockImage: rock_carbon,  hp: 200, score: 150});
        addAsteroidsArr.push({image: asteroid_carbon,  rockImage: rock_carbon,  hp: 200, score: 150});
        addAsteroidsArr.push({image: asteroid_iron,    rockImage: rock_iron,    hp: 300, score: 250});
    }
    if (level % 15 === 0) {
        addAsteroidsArr.push({image: asteroid_gold,    rockImage: rock_gold,    hp: 200, score: 500});
    }
    if (level % 20 === 0) {
        addAsteroidsArr.push({image: asteroid_iron,    rockImage: rock_iron,    hp: 300, score: 250});
        addAsteroidsArr.push({image: asteroid_white,   rockImage: rock_white,   hp: 450, score: 300});
    }
    addAsteroidsArr.sort(() => Math.random() - 0.5);
} 

function addNewAsteroid() {
    let img = addAsteroidsArr[addAsteroidIndex].image;
    let rockImg = addAsteroidsArr[addAsteroidIndex].rockImage;
    let hp = addAsteroidsArr[addAsteroidIndex].hp;
    let score = addAsteroidsArr[addAsteroidIndex].score;
    asteroidsArr.push( new Asteroid(img, rockImg, hp, score) );

    addAsteroidIndex++;
    if (addAsteroidIndex === addAsteroidsArr.length) {
        addAsteroidIndex = 0;
        addAsteroidsArr.sort(() => Math.random() - 0.5);
    }
}

/*************
 * 
 *   КАМНИ
 */

class Rock {
    constructor( image, x, y, scale ) {
        let offsetX = Math.random() < 0.5 ? -Math.random() : Math.random();
        let offsetY = Math.random() < 0.5 ? -Math.random() : Math.random();
        this.x = x + offsetX;
        this.y = y + offsetY;

        this.stepScaleX = offsetX * Math.random() * 100; // коэффициент смещения по оси X
        this.stepScaleY = offsetY * Math.random() * 100; // коэффициент смещения по оси Y

        this.sizeScaleStep = 1 + Math.random() / 100; // коэффициент изменения размеров
        this.sizeScale = scale / 2; // начальный размер
        this.size = image.frameWidth > image.frameHeight ? image.frameWidth : image.frameHeight;

        this.img = image.img;
        this.frameSpin = 2; // 1, 2 or 3
        this.frames = image.frames;
        this.frameW = image.frameWidth;
        this.frameH = image.frameHeight;
        this.frameCX = Math.floor(this.frameW / 2);
        this.frameCY = Math.floor(this.frameH / 2);
        this.frame = 0;
        this.frameX = 0;
        this.frameY = 0;

        this.isExist = true;
    }

    draw( frameTimeout, frame ) {
        const dt = frameTimeout / 1000;
        // обновляем масштаб

        ctx.drawImage(
            this.img,    // Объект Image или canvas 
            this.frameX, // позиция X прямоуголника начала спрайта
            this.frameY, // позиция Y прямоуголника начала спрайта
            this.frameW, // ширена прямоуголника отображаемой части спрайта
            this.frameH, // высота прямоуголника отображаемой части спрайта
            this.x - this.frameCX * this.sizeScale, // позиция X начала отобрадения спрайта на canvas
            this.y - this.frameCY * this.sizeScale, // позиция Y начала отобрадения спрайта на canvas
            this.frameW * this.sizeScale, // ширина для отобрадения спрайта на canvas
            this.frameH * this.sizeScale // высота для начала отобрадения спрайта на canvas
        );

        // проверка переключения кадра и переход в начало, если это был последний кадр
        if (frame % this.frameSpin === 0) {
            this.frame++;
            this.frameX = this.frameW * this.frame;
        }
        if (this.frame === this.frames) this.frame = 0;

        // движение
        this.x += this.stepScaleX * dt;
        this.y += this.stepScaleY * dt;
        this.stepScaleX *= 1 + dt;
        this.stepScaleY *= 1 + dt;

        // обновляем масштаб
        this.sizeScale *= this.sizeScaleStep * (1 + dt/10);
        if (this.isExist && this.sizeScale > 1) {
            playSeGame('se_glass');
            armor -= 1;
            if (armor <= 0) gameOver();
            else shardsArr.push( new Shards(this.x, this.y, true) );

            boardUpdate();
            this.isExist = false;
        }

        // проверяем существование
        if (this.x + this.frameW < 0
        || this.x - this.frameW > vw
        || this.y + this.frameH < 0
        || this.y - this.frameH > vh) {
            this.isExist = false;
        }
    }
}
// массив объектов
let rocksArr = [];

/*********************************
 * 
 *  ГЕНЕРАТОР СЛУЧАЙНЫХ ЧИСЕЛ
 */

// min - минимальное число (можно дробное)
// max - максимальное число (можно дробное)
// roundSize - сколько оставить знаков после точки
// (roundSize - если не передать, возвращаются целые числа)
function getRandom(min, max, roundSize) {
    let result = (Math.random() * (max - min) + min);
    result = result.toFixed(roundSize);
    return parseFloat(result);
}

/***********************************************
 * 
 *  РАСЧЕТ РАССТОЯНИЯ МЕЖДУ ДВУМЯ ТОЧКАМИ
 */

function getDistance (x1, y1, x2, y2) {
    return Math.sqrt( Math.pow( (x1 - x2), 2) + Math.pow( (y1 - y2), 2) );
}

/******************************************
 * 
 *  ОТСЛЕЖИВАНИЕ ПОЛОЖЕНИЯ КУРСОРА МЫШИ
 */

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
}

let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;

canvas.addEventListener('mousemove', function(evt) {
    let mouse = getMousePos(canvas, evt);
    mouseX = mouse.x;
    mouseY = mouse.y;
}, false);

/******************************************
 * 
 *  ОТСЛЕЖИВАНИЕ КЛИКОВ ЛЕВОЙ КНОПКОЙ
 */

let isButtonOnclick = false;

document.addEventListener('click', () => {
    if (isButtonOnclick) isButtonOnclick = false;
    else if (cursor.isReady) {
        playSePlayer( 'se_laser' );
        cursor.frameX = 0;
        cursor.isReady = false;

        laserLightsArr.push( new LaserLight() );
    }
});

/*****************************************************
 * 
 *  ОТСЛЕЖИВАНИЕ НАЖАТИЙ КЛАВИШ НА КЛАВИАТУРЕ
 */

document.addEventListener('keydown', (event) => {
    switch(event.code) {
        case 'Enter': if (!isGameStart && frame === 0) gameStart(); break;
        case 'KeyQ' : getClickUpgradePower(); break;
        case 'KeyW' : getClickUpgradeAiming(); break;
        case 'KeyE' : getClickUpgradeReloading(); break;
        case 'KeyR' : getClickRepair(); break;
        case 'KeyT' : getClickUpgradeArmor(); break;
        case 'KeyY' : getClickUpgradeDetector(); break;
    }
 });

/**************
 * 
 *  АНИМАЦИЯ
 */

// проверка производительности
let testPerformanceArray = [];

// номер текущего кадра
let frame = 0;
// временная метка последнего кадра
let previousTimeStamp = 0;

function animation( timeStamp ) {
    // обновляем временные метки
    const frameTimeout = timeStamp - previousTimeStamp;
    previousTimeStamp = timeStamp;

    // обновляем номер кадра
    frame++;

    // чистим холст
    ctx.clearRect(0, 0, vw, vh);

    // обнавляем астеройды и уровень
    if (frame % ( levelToWin * 3 - level * 2 ) === 0) addNewAsteroid();
    rocksArr.forEach( rock => rock.draw( frameTimeout, frame ) );
    asteroidsArr.forEach( asteroid => asteroid.draw( frameTimeout, frame ) );   

    // обнавляем взрывы
    explosionsArr.forEach( explosion => explosion.draw( frameTimeout, frame ) );

    // отрисовка курсора, прицела, оружия и выстрелов
    aim.draw( frameTimeout );
    cursor.draw( frameTimeout );

    laserLightsArr.forEach( light => light.draw( frameTimeout, frame ) );

    laserGun.draw();
    gunBase.draw();

    // отрисовка стекла
    shardsArr.forEach( shards => shards.draw() );

    // удаляем ненужные объекты
    asteroidsArr = asteroidsArr.filter( asteroid => asteroid.isExist );
    rocksArr = rocksArr.filter( rock => rock.isExist );
    explosionsArr = explosionsArr.filter( explosion => explosion.isExist );
    laserLightsArr = laserLightsArr.filter( light => light.isExist );
    shardsArr = shardsArr.filter( shards => shards.isExist );
    
    /*
    // обновляем данные по производительности
    testPerformanceArray.push( frameTimeout );
    // выводим в консоль инвормацию производительности и о количестве снежинок на экране каждеы 60 кадров
    if (frame % 60 === 0) {
        let maxTimeout = Math.max( ...testPerformanceArray );
        let sumTimeout = testPerformanceArray.reduce((sum, data) => data + sum, 0);
        let midTimeout = sumTimeout / testPerformanceArray.length;
        testPerformanceArray = [];

        // console.clear(); // очистка старой информации
        console.group('ПРОИЗВОДИТЕЛЬНОСТЬ')
        console.log('мин.FPS:', (1000 / maxTimeout).toFixed(3) + ' (из 60)');
        console.log(' ср.FPS:', (1000 / midTimeout).toFixed(3) + ' (из 60)');
        console.log('(средняя задержка между кадрами =', midTimeout,'миллисекунд)');
        console.log('Астеройдов :', asteroidsArr.length);
        console.groupEnd();

        console.log( asteroidsArr );
    }
    */

    // запускаем занова анимацию с 60 fps
    if (isGameStart) requestAnimationFrame( animation );
}