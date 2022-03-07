require('../css/index.css');
import * as THREE from 'three';
import {TWEEN} from "three/examples/jsm/libs/tween.module.min";
import {
    createPerspectiveCamera, createWebGLRenderer, createOrbitControls, createVector3, shouldResize
} from "./util/common";
import {
    createTable,
    shuffle,
    initStartMajs,
    sortHands,
    resetPosition,
    deal,
    winAnimate,
    createWinBtn,
    createStartBtn,
    createSkipBtn,
    createBg,
    createFinishBtn,
    clearMajs
} from "./util/mahjong";
import * as EventType from "./util/event-type";
import * as MajPosition from './util/maj-position';
import {majHandMousemoveHandler, majHandMouseClickHandler, clickHandler} from "./util/event";
import {win} from "./util/game";

const canvas = document.querySelector("#canvas");

const scene = new THREE.Scene();
const renderer = createWebGLRenderer(canvas, window.innerWidth, window.innerHeight, 0x000000);

const fov = 60;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 2000;

const camera = createPerspectiveCamera(fov, aspect, near, far);
camera.lookAt(0, 0, 0);
camera.position.set(0, 400, 700);
scene.add(camera);


const ambientLight = new THREE.AmbientLight(0x444444);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xffffff, 1, 0, Math.PI * 2);
spotLight.position.set(200, 200, 200);
scene.add(spotLight);

const orbitControls = createOrbitControls(camera, canvas);
orbitControls.update();
orbitControls.enabled = false;

const table = createTable();
scene.add(table);
const bg = createBg();
bg.position.z = 1;
scene.add(bg);
const rayCaster = new THREE.Raycaster();

const majConfig = {
    width: 40, height: 60, depth1: 6, depth2: 20
}

const startX = -270;
const startY = majConfig.height / 2 + 1;
const startZ = 300;
const firstHandMajPosition = createVector3(startX, startY, startZ);


const discardConfig = {
    x: -1 * majConfig.width * 2.5, y: 0, z: 0, colCount: 6
}


const startBtn = createStartBtn();
scene.add(startBtn);
const winBtn = createWinBtn();
winBtn.material.visible = false;
winBtn.position.x = -100;
winBtn.position.z = 400;
scene.add(winBtn);
const skipBtn = createSkipBtn();
skipBtn.position.x = 100;
skipBtn.position.z = 400;
skipBtn.material.visible = false;
scene.add(skipBtn);
const finishBtn = createFinishBtn();
finishBtn.material.visible = false;
finishBtn.position.x = 0;
finishBtn.position.z = 400;
scene.add(finishBtn);


const start = clickHandler(rayCaster, [startBtn], canvas, camera, startCallback);
document.addEventListener(EventType.CLICK, start);

function displayWinBtn() {
    winBtn.material.visible = true;
    skipBtn.material.visible = true;
}

function hiddenWinBtn() {
    winBtn.material.visible = false;
    skipBtn.material.visible = false;
}

function displayStartBtn() {
    startBtn.material.visible = true;
}

function hiddenAllBtn() {
    hiddenWinBtn();
    finishBtn.material.visible = false;
}


function startCallback() {

    let majList = [];
    let mountains = shuffle();
    const discards = [];

    hiddenAllBtn();
    clearMajs(scene);

    // 起始手牌
    const hands = initStartMajs(mountains, majList, majConfig);

    const handClickHandler = function (event) {
        const discard = majHandMouseClickHandler(rayCaster, majList, hands, scene, canvas, camera, discards, discardConfig, majConfig, mountains, firstHandMajPosition)(event);
        if (!discard) {
            return;
        }
        for (let inx = 0; inx < 3; inx++) {
            if (mountains.length === 0) break;
            mountains.pop();
        }
        if (mountains.length === 0) {
            finishBtn.material.visible = true;
            document.removeEventListener(EventType.MOUSEMOVE, moveHandler);
            document.removeEventListener(EventType.CLICK, handClickHandler);
            return;
        }

        const maj = deal(mountains, majConfig);
        hands.push(maj);
        maj.position.set(1000, firstHandMajPosition.y, firstHandMajPosition.z);
        maj.tween = new TWEEN.Tween(maj.position).to({x: firstHandMajPosition.x + (majConfig.width + 1) * (hands.length - 1) + 5}, 500)
            .easing(TWEEN.Easing.Quadratic.InOut);
        scene.add(maj);
        maj.typeName = MajPosition.HAND;
        majList.push(maj.children[maj.children.length - 1]);
        maj.tween.start();

        hands[hands.length - 1].tween.onComplete(function () {
            if (win(hands)) {
                displayWinBtn();
            }
        });
    }

    const moveHandler = function (event) {
        majHandMousemoveHandler(rayCaster, majList, hands, canvas, camera, firstHandMajPosition)(event);
    };

    document.removeEventListener(EventType.MOUSEMOVE, moveHandler);

    document.removeEventListener(EventType.CLICK, handClickHandler);

    startBtn.material.visible = false;

    const callback = clickHandler(rayCaster, [winBtn, skipBtn], canvas, camera, function (mesh) {
        if (!mesh.object.material.visible) {
            return;
        }
        if (mesh.object === skipBtn) {
            hiddenWinBtn();
        } else if (mesh.object === winBtn) {
            winAnimate(hands, majConfig);
            hiddenWinBtn();
            displayStartBtn();
            document.removeEventListener(EventType.MOUSEMOVE, moveHandler);
            document.removeEventListener(EventType.CLICK, handClickHandler);
        }
    });

    document.addEventListener(EventType.CLICK, callback);


    let tween = new TWEEN.Tween();
    const first = tween;
    let last;
    hands.forEach((maj, inx) => {
        majList.push(maj.children[maj.children.length - 1]);
        maj.typeName = MajPosition.HAND;
        if (inx === 13) {
            maj.position.set(1000, firstHandMajPosition.y, firstHandMajPosition.z)
            maj.tween = new TWEEN.Tween(maj.position).to({x: firstHandMajPosition.x + (majConfig.width + 1) * inx + 10}, 120)
                .easing(TWEEN.Easing.Quadratic.InOut);
            last = maj.tween;
        } else {
            maj.position.set(1000, firstHandMajPosition.y, firstHandMajPosition.z)
            maj.tween = new TWEEN.Tween(maj.position).to({x: firstHandMajPosition.x + (majConfig.width + 1) * inx}, 120)
                .easing(TWEEN.Easing.Quadratic.InOut);
        }
        tween.chain(maj.tween);
        tween = maj.tween;
        scene.add(maj);
    });

    first.start();
    last.onComplete(function () {
        hands.forEach((maj2, index) => {
            const t = new TWEEN.Tween(maj2.rotation).to({x: Math.PI / 2}, 500).easing(TWEEN.Easing.Quadratic.InOut);
            t.start();
            if (index === hands.length - 1) {
                t.onComplete(function () {
                    sortHands(hands);
                    resetPosition(hands, majConfig, firstHandMajPosition);
                    hands.forEach((maj2) => {
                        const t = new TWEEN.Tween(maj2.rotation).to({x: 0}, 500).easing(TWEEN.Easing.Quadratic.InOut);
                        t.start();
                    });
                    if (win(hands)) {
                        winAnimate(hands);
                    }
                })
            }
        });
    });

    document.addEventListener(EventType.MOUSEMOVE, moveHandler);

    document.addEventListener(EventType.CLICK, handClickHandler);
}


function render() {
    if (shouldResize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
    TWEEN.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

render();
