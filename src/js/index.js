require('../css/index.css');
import * as THREE from 'three';
import {TWEEN} from "three/examples/jsm/libs/tween.module.min";
import {
    createOrbitControls,
    createPerspectiveCamera,
    createVector3,
    createWebGLRenderer,
    shouldResize
} from "./util/common";
import {
    clearMajs,
    createBg,
    createTable,
    deal,
    fillStartMajs,
    resetPosition,
    shuffle,
    sortHands,
    winAnimate
} from "./util/mahjong";
import * as EventType from "./util/event-type";
import * as MajPosition from './util/maj-position';
import {majHandMouseClickHandler, majHandMousemoveHandler, winCallback, skipCallback} from "./util/event";
import {autoDiscard, canWin, ronWinEvent, startGame, winGame, zimoWinEvent} from "./util/game";

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
    width: 30, height: 40, depth1: 3, depth2: 15
}

const firstHandMajPosition = createVector3(-200, majConfig.height / 2 + 1, 370);
const firstHandMajPositionB = createVector3(200, majConfig.height / 2 + 1, -370);


const discardConfig = {
    x: -1 * majConfig.width * 4, y: 0, z: 150, colCount: 9
}
const discardConfigB = {
    x: majConfig.width * 4, y: 0, z: -150, colCount: 9
}

startGame('#btnStart', startCallback);

function startCallback() {

    document.querySelector('#btnStart').classList.toggle('nodisplay');

    let majList = [];
    let mountains = shuffle();
    const discards = [];
    const discardsB = [];

    clearMajs(scene);

    const hands = [], handsB = [];

    const winAction = winCallback(hands);
    const skipAction = skipCallback;

    fillStartMajs(mountains, majConfig, hands, handsB);

    const handClickHandler = function (event) {
        const discard = majHandMouseClickHandler(rayCaster, majList, hands, canvas, camera, discards, discardConfig, majConfig, mountains, firstHandMajPosition)(event);
        if (discard === null) {
            return;
        }

        handsB.push(discard);
        if (canWin(handsB)) {
            winAnimate(handsB);
            winGame(1, false);
            return;
        }
        handsB.pop();

        if (mountains.length === 0) {
            // draw;
            document.removeEventListener(EventType.MOUSEMOVE, moveHandler);
            document.removeEventListener(EventType.CLICK, handClickHandler);
            return;
        }
        const m = deal(mountains, majConfig);
        handsB.push(m);
        m.rotation.y = Math.PI;
        m.typeName = MajPosition.HAND;

        m.position.set(-2000, firstHandMajPositionB.y, firstHandMajPositionB.z);
        m.tween = new TWEEN.Tween(m.position).to({x: firstHandMajPositionB.x - (majConfig.width + 1) * (handsB.length - 1) + 5}, 500)
            .easing(TWEEN.Easing.Quadratic.InOut);
        scene.add(m);
        m.tween.start();

        autoDiscard(handsB, discardsB, majConfig, firstHandMajPositionB, discardConfigB, 1000, function (discard) {
            if (canWin(hands, discard)) {
                winGame(0, true);
                ronWinEvent(winAction, skipAction);
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
                if (canWin(hands)) {
                    winGame(1, true);
                    zimoWinEvent(winAction, skipAction);
                }
            });
        })
    }

    const moveHandler = function (event) {
        majHandMousemoveHandler(rayCaster, majList, hands, canvas, camera, firstHandMajPosition)(event);
    };

    document.removeEventListener(EventType.MOUSEMOVE, moveHandler);

    document.removeEventListener(EventType.CLICK, handClickHandler);

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

    let tweenB = new TWEEN.Tween();
    const firstB = tweenB;
    handsB.forEach((maj, inx) => {
        maj.typeName = MajPosition.HAND;
        maj.position.set(-2000, firstHandMajPositionB.y, firstHandMajPositionB.z);
        maj.rotation.y = Math.PI;
        maj.tween = new TWEEN.Tween(maj.position).to({x: firstHandMajPositionB.x - (majConfig.width + 1) * inx}, 120)
            .easing(TWEEN.Easing.Quadratic.InOut);
        tweenB.chain(maj.tween);
        tweenB = maj.tween;
        scene.add(maj);
    })
    firstB.start();
    tweenB.onComplete(function () {
        handsB.forEach((maj2, index) => {
            const t = new TWEEN.Tween(maj2.rotation).to({x: Math.PI / -2}, 500).easing(TWEEN.Easing.Quadratic.InOut);
            t.start();
            if (index === handsB.length - 1) {
                t.onComplete(function () {
                    sortHands(handsB);
                    resetPosition(handsB, majConfig, firstHandMajPositionB, true);
                    handsB.forEach((maj2) => {
                        const t = new TWEEN.Tween(maj2.rotation).to({x: 0}, 500).easing(TWEEN.Easing.Quadratic.InOut);
                        t.start();
                    });
                })
            }
        })
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
                    if (canWin(hands)) {
                        winAnimate(hands);
                        winGame(0, true);
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
