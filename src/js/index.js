require('../css/index.css');
import * as THREE from 'three';
import {TWEEN} from "three/examples/jsm/libs/tween.module.min";

const canvas = document.querySelector("#canvas");

const scene = new THREE.Scene();
const renderer = createWebGLRenderer(canvas);
renderer.setClearColor(0x000000, 1);
renderer.setSize(window.innerWidth, window.innerHeight);

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



const table = createTable();
scene.add(table);

// const width = 40;
// const height = 60;
// const depth1 = 6;
// const depth2 = 20;

const width = 50;
const height = 80;
const depth1 = 10;
const depth2 = 20;



const startX = -250;
const startY = height / 2;
const startZ = 300;

let majList = [];


const majs = initMajs(width, height, depth1, depth2, startX, -100);
majs.forEach(maj => {
    scene.add(maj);
    majList.push(...maj.children);
});



const OrbitControls = require('three-orbit-controls')(THREE)
const orbitControls = new OrbitControls(camera, canvas);
orbitControls.update();
// orbitControls.enabled = false;

const rayCaster = new THREE.Raycaster();
const hands = [];

document.addEventListener('click', function (event) {
    let getBoundingClientRect = canvas.getBoundingClientRect();
    let left = getBoundingClientRect.left;
    let top = getBoundingClientRect.top;
    // 屏幕坐标转换为标准设备坐标
    let x = 2 * (event.clientX - left) / canvas.offsetWidth - 1;
    let y = -2 * (event.clientY - top) / canvas.offsetHeight + 1;

    const mouse = new THREE.Vector3(x, y, 0.5);

    rayCaster.setFromCamera(mouse, camera);
    const intersects = rayCaster.intersectObjects(majList, false);
    if (intersects.length > 0) {
        const selectedMesh = intersects[0].object;
        if (selectedMesh.parent.typeName === 'mountain') {
            if (hands.length === 14) return;
            const group = new THREE.Group();
            selectedMesh.parent.children.forEach(mesh => group.add(mesh.clone()));
            group.typeName = 'hand';
            group.rotation.x = 0;
            group.position.set(startX + (width + 1) * hands.length, startY, startZ);
            hands.push(group);
            scene.add(group);
            majList.push(...group.children);
        } else {
            majList = majList.filter(maj => maj.parent !== selectedMesh.parent);
            selectedMesh.parent.children.forEach(mesh => {
                mesh.geometry.dispose();
            })
            scene.remove(selectedMesh.parent);

            for (let inx = 0, len = hands.length; inx < len; inx++) {
                if (hands[inx] === selectedMesh.parent) {
                    for (let inx2 = len - 1; inx2 > inx; inx2--) {
                        hands[inx2].position.copy(hands[inx2 - 1].position);
                    }
                    hands.splice(inx, 1);
                    break;
                }
            }
        }

    }
});

function initMajs(width, height, depth1, depth2, startX, startZ) {
    const types = ['m', 'p', 's', 'w'];
    const majs = [];
    for (let i = 0; i < types.length; i++) {
        const type = types[i];
        const z = startZ + (height + 2) * i;
        if (type === 'w') {
            const ws = ['e', 'w', 'n', 's', 'g', 'wh', 'r'];
            for (let inx = 0; inx < ws.length; inx++) {
                const maj = createMaj(width, height, depth1, depth2, type, ws[inx]);
                maj.rotation.x = -Math.PI / 2;
                maj.position.set(startX + (width + 2) * inx, (depth1 + depth2) / 2 + 1, z);
                majs.push(maj);
            }
        } else {
            for (let inx = 0; inx < 10; inx++) {
                const maj = createMaj(width, height, depth1, depth2, type, inx);
                maj.rotation.x = -Math.PI / 2;
                maj.position.set(startX + (width + 2) * inx, (depth1 + depth2) / 2 + 1, z);
                majs.push(maj);
            }
        }


    }
    majs.forEach(maj => maj.typeName = 'mountain');
    return majs;
}

// 287 336
// 40  56
function createMaj(width, height, depth1, depth2, type, number) {
    const group = new THREE.Group();
    const geometry1 = new THREE.BoxGeometry(width, height, depth1);
    const material1 = new THREE.MeshPhongMaterial({
        color: 0xf18f68,
        emissive: 0xf18f68
    });
    const back = new THREE.Mesh(geometry1, material1);
    back.position.set(0, 0, - depth1 / 2);
    back.parent = group;
    group.add(back);
    const geometry2 = new THREE.BoxGeometry(width, height, depth2);
    const texture1 = new THREE.ImageUtils.loadTexture('../../static/assets/textures/top.png');
    const material2 = new THREE.MeshPhongMaterial({
        color: 0xDFDFDC,
        specular: 0xDFDFDC,
        emissive: 0xffffff,
        shininess: 0
    });
    const topMaterial = new THREE.MeshBasicMaterial({
        map: texture1
    })
    const front = new THREE.Mesh(geometry2, [material2, material2, topMaterial, topMaterial, material2, material2]);
    front.position.set(0, 0, depth2 / 2);
    front.parent = group;
    group.add(front);

    const geometry3 = new THREE.PlaneGeometry(width - 4, height - 4);
    const texture = new THREE.ImageUtils.loadTexture('../../static/assets/textures/majs/' + type + '/' + number +  '.png');
    texture.repeat.set(1, 1);
    const mesh = new THREE.Mesh(geometry3, new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true
    }));
    mesh.position.set(0, 0, depth2 + 1);
    mesh.parent = group;
    group.add(mesh);


    return group;
}

function createTable() {
    const geometry = new THREE.PlaneGeometry(1024, 1024);
    const texture = new THREE.ImageUtils.loadTexture('../../static/assets/textures/table.jpg');
    texture.wrapT = THREE.RepeatWrapping;
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI  / 2;
    return plane;
}


function createPerspectiveCamera(fov = 60, aspect = 1, near = 0.1, far = 2000) {
    return new THREE.PerspectiveCamera(fov, aspect, near, far);
}


function createWebGLRenderer(canvas) {
    return new THREE.WebGLRenderer({
        canvas,
        antialias: true
    })
}

function shouldResize(renderer) {
    const canvas = renderer.domElement;
    const resize = canvas.clientWidth !== canvas.width || canvas.clientHeight !== canvas.height;
    if (resize) {
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        return true;
    }
    return resize;
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
