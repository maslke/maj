require('../css/index.css');
import * as THREE from 'three';
import {TWEEN} from "three/examples/jsm/libs/tween.module.min";
import {
    createPerspectiveCamera,
    createWebGLRenderer,
    createOrbitControls,
    createVector3,
    shouldResize
} from "./util/common";
import {createTable, initMajs, shuffle, initStartMajs, sortHands, resetPosition} from "./util/mahjong";
import * as EventType from "./util/event-type";
import * as MajPosition from './util/maj-position';
import {majHandMousemoveHandler, majHandMouseClickHandler, majMountainMouseClickHandler} from "./util/event";

const canvas = document.querySelector("#canvas");

const scene = new THREE.Scene();
const renderer = createWebGLRenderer(canvas, window.innerWidth, window.innerHeight, 0x000000);

const fov = 60;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 2000;

const camera = createPerspectiveCamera(fov, aspect, near, far);
camera.lookAt(0, 0, 0);
camera.position.set(0, 600, 800);
scene.add(camera);


const ambientLight = new THREE.AmbientLight(0x444444);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xffffff, 1, 0, Math.PI * 2);
spotLight.position.set(200, 200, 200);
scene.add(spotLight);

const orbitControls = createOrbitControls(camera, canvas);
orbitControls.update();
// orbitControls.enabled = false;

const table = createTable();
scene.add(table);

const majConfig = {
    width: 40,
    height: 60,
    depth1: 6,
    depth2: 20
}

const startX = -270;
const startY = majConfig.height / 2 + 1;
const startZ = 300;
const firstHandMajPosition = createVector3(startX, startY, startZ);

let majList = [];

// const majs = initMajs(majConfig, firstHandMajPosition.x, -100);
// majs.forEach(maj => {
//     maj.typeName = 'mountain';
//     scene.add(maj);
//     majList.push(maj.children[maj.children.length - 1]);
// });

// shuffle
const mountains = shuffle();

// 起始手牌
const hands = initStartMajs(mountains, majList, majConfig);
let tween = new TWEEN.Tween();
const first = tween;
hands.forEach((maj, inx) => {
    majList.push(maj.children[maj.children.length - 1]);
    maj.typeName = MajPosition.HAND;
    if (inx === 13) {
        maj.position.set(1000, firstHandMajPosition.y, firstHandMajPosition.z)
        maj.tween = new TWEEN.Tween(maj.position).to({x: firstHandMajPosition.x + (majConfig.width + 1) * inx + 10}, 120)
            .easing(TWEEN.Easing.Quadratic.InOut);
        maj.tween.onUpdate(function(object) {
            if (object.x === firstHandMajPosition.x + (majConfig.width + 1) * inx + 10) {
                hands.forEach((maj2, index) => {
                    const t = new TWEEN.Tween(maj2.rotation).to({x: Math.PI / 2}, 500).easing(TWEEN.Easing.Quadratic.InOut);
                    t.start();
                    if (index === hands.length - 1) {
                        t.onUpdate(function (obj) {
                            if (obj.x === Math.PI / 2) {
                                sortHands(hands);
                                resetPosition(hands, majConfig, firstHandMajPosition);
                                hands.forEach((maj2) => {
                                    const t = new TWEEN.Tween(maj2.rotation).to({x: 0}, 500).easing(TWEEN.Easing.Quadratic.InOut);
                                    t.start();
                                });
                            }
                        })

                    }
                });

            }
        });

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

// 弃牌
const discards = [];


const rayCaster = new THREE.Raycaster();

document.addEventListener(EventType.MOUSEMOVE,
    majHandMousemoveHandler(rayCaster, majList, hands, canvas, camera, firstHandMajPosition));

// document.addEventListener(EventType.CLICK,
//     majMountainMouseClickHandler(rayCaster, majList, hands, scene, canvas, camera, firstHandMajPosition, majConfig));
document.addEventListener(EventType.CLICK,
    majHandMouseClickHandler(rayCaster, majList, hands, scene, canvas, camera));

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
