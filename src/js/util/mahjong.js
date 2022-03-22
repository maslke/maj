import * as THREE from "three";
import {TWEEN} from "three/examples/jsm/libs/tween.module.min";
import * as MajType from './maj-type';
import * as MajPosition from './maj-position';
/**
 * 动画效果
 * @param hands
 */
function winAnimate(hands, maj) {
    hands.forEach((maj, inx) => {
        maj.animate = new TWEEN.Tween(maj.rotation)
            .to({x: -Math.PI / 2}, 200 + 50 * inx).easing(TWEEN.Easing.Quadratic.InOut);
        maj.animate.start();
    });
}

function createTable() {
    const geometry = new THREE.PlaneGeometry(1024, 1024);
    const texture = new THREE.TextureLoader().load('../../../static/assets/textures/table.jpg');
    texture.wrapT = THREE.RepeatWrapping;
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
    });

    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    return plane;
}

function createBg() {
    const geometry = new THREE.PlaneGeometry(270, 270);
    const texture = new THREE.TextureLoader().load('../../../static/assets/textures/bg.png');
    texture.wrapT = THREE.RepeatWrapping;
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        // side: THREE.DoubleSide,
        transparent: true
    });

    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    return plane;
}


function createBtn(src) {
    const geometry = new THREE.PlaneGeometry(210, 94);
    const texture = new THREE.TextureLoader().load(src);
    texture.wrapT = THREE.RepeatWrapping;
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true
    });

    const plane = new THREE.Mesh(geometry, material);
    plane.position.y = 94 /2 + 1;
    return plane;
}

function createMaj(width, height, depth1, depth2, type, number, color = 0xf18f68) {
    const group = new THREE.Group();
    const geometry1 = new THREE.BoxGeometry(width, height, depth1);
    const material1 = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color
    });
    const back = new THREE.Mesh(geometry1, material1);
    back.position.set(0, 0, -depth1 / 2);
    back.parent = group;
    group.add(back);
    const geometry2 = new THREE.BoxGeometry(width, height, depth2);
    const texture1 = new THREE.TextureLoader().load('../../../static/assets/textures/top.png');
    const material2 = new THREE.MeshPhongMaterial({
        color: 0xDFDFDC,
        specular: 0xDFDFDC,
        emissive: 0xffffff,
        shininess: 0
    });
    const topMaterial = new THREE.MeshBasicMaterial({
        map: texture1
    })
    const front = new THREE.Mesh(geometry2, [topMaterial, topMaterial, topMaterial, topMaterial, material2, material2]);
    front.position.set(0, 0, depth2 / 2);
    front.parent = group;
    group.add(front);

    const geometry3 = new THREE.PlaneGeometry(width - 4, height - 4);
    const texture = new THREE.TextureLoader().load('../../../static/assets/textures/majs/' + type + '/' + number + '.png');
    texture.repeat.set(1, 1);
    const mesh = new THREE.Mesh(geometry3, new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true
    }));
    mesh.position.set(0, 0, depth2 + 1);
    mesh.parent = group;
    group.add(mesh);
    group.attributes = group.attributes || {};
    group.attributes.type = type;
    group.attributes.number = number;
    return group;
}


// 287 336
// 40  56
function initMajs(majConfig, startX, startZ) {
    const types = [MajType.M, MajType.P, MajType.S, MajType.W];
    const majs = [];
    for (let i = 0; i < types.length; i++) {
        const type = types[i];
        const z = startZ + (majConfig.height + 2) * i;
        let start = 0, end = 10;
        if (type === MajType.W) {
            start = 1;
            end = 8;
        }
        for (let inx = start; inx < end; inx++) {
            const maj = createMaj(majConfig.width, majConfig.height, majConfig.depth1, majConfig.depth2, type, inx);
            maj.rotation.x = -Math.PI / 2;
            maj.position.set(startX + (majConfig.width + 2) * inx,  majConfig.depth2/ 2 + 1, z);
            majs.push(maj);
        }
    }
    majs.forEach(maj => maj.typeName = MajPosition.MOUNTAIN);
    return majs;
}

/**
 * 洗牌
 * @returns {*[]}
 */
function shuffle() {
    const majs = [];
    const types = [MajType.M, MajType.P, MajType.S, MajType.W];
    // 日麻中的红宝牌
    const other = {
        'm': 1,
        'p': 2,
        's': 1
    }
    for (let inx = 0; inx < types.length; inx++) {
        const type = types[inx];
        for (let i = 1, end = type === MajType.W ? 7 : 9; i <= end; i++) {
            for (let j = 0; j < 4; j++) {
                // 加入对宝牌的处理逻辑
                if (other.hasOwnProperty(type) && other[type] > 0 && i === 5) {
                    other[type]--;
                    majs.push({
                        type: type,
                        number: 0,
                    })
                } else {
                    majs.push({
                        type: type,
                        number: i
                    });
                }
            }
        }
    }

    const length = majs.length;
    for (let i = 0; i < length; i++) {
        const inx = i + parseInt(Math.random() * (length - i));
        let a = majs[i];
        majs[i] = majs[inx];
        majs[inx] = a;
    }
    return majs;
}

function initStartMajs(majs, majList, majConfig) {
    const list = [];
    const {width, height, depth1, depth2} = majConfig;

    for (let inx = 0; inx < 14; inx++) {
        const {type, number} = majs.pop();
        const maj = createMaj(width, height, depth1, depth2, type, number);
        list.push(maj);
    }
    return list;

}

function fillStartMajs(majs, majConfig, handsA, handsB) {
    const {width, height, depth1, depth2} = majConfig;
    for (let inx = 0; inx < 13; inx++) {
        let {type, number} = majs.pop();
        const maj = createMaj(width, height, depth1, depth2, type, number);
        handsA.push(maj);
        if (inx === 12) {
            let {type, number} = majs.pop();
            const maj = createMaj(width, height, depth1, depth2, type, number);
            handsA.push(maj);
        }

        const p = majs.pop();
        type = p.type;
        number = p.number;
        const maj2 = createMaj(width, height, depth1, depth2, type, number);
        handsB.push(maj2);
    }


}

/**
 * 对手牌进行排序
 * @param hands
 */
function sortHands(hands) {
    hands.sort(function (a, b) {
        const attributesA = a.attributes;
        const attributesB = b.attributes;
        const typeA = attributesA.type;
        let numberA = attributesA.number;
        const typeB = attributesB.type;
        let numberB = attributesB.number;

        if (typeA === typeB) {
            if (numberA === numberB) {
                return 0;
            }
            numberA = numberA === 0 ? 5 : numberA;
            numberB = numberB === 0 ? 5 : numberB;
            return numberA < numberB ? -1 : 1;
        } else {
            return typeA < typeB ? -1 : 1;
        }
    })
}


function discard(maj, discards, discardConfig, majConfig, negative) {
    const {colCount, x, y, z} = discardConfig;
    let {width, depth1, height} = majConfig;

    const row = parseInt(discards.length / colCount);
    const col = discards.length % colCount;
    discards.push(maj);
    if (arguments.length === 5 && negative) {
        maj.position.set(x - (width + 1) * col, depth1 + 1, z - (height + 1) * row);
        maj.rotation.x = Math.PI / 2;
        // maj.scale.set(0.8, 0.8, 0.8);
    } else {
        maj.position.set(x + (width + 1) * col, depth1 + 1, z + (height + 1) * row);
        maj.rotation.x = - Math.PI / 2;
    }

}

function deal(majs, majConfig) {
    const {type, number} = majs.pop();
    const {width, height, depth1, depth2} = majConfig;
    return createMaj(width, height, depth1, depth2, type, number);
}

function resetPosition(hands, majConfig, vector3, negative) {
    for (let inx = 0; inx < hands.length; inx++) {
        if (arguments.length === 4 && negative === true) {
            hands[inx].position.x = vector3.x - (majConfig.width + 1) * inx;
        } else {
            hands[inx].position.x = vector3.x + (majConfig.width + 1) * inx;
        }
    }
}

function clearMajs(scene) {
    const majs = [];
    scene.children.forEach(maj => {
        if (maj.typeName === MajPosition.MOUNTAIN || maj.typeName === MajPosition.HAND) {
            majs.push(maj);
        }
    });
    majs.forEach(maj => scene.remove(maj));
}

export {createTable, createBg, createMaj, initMajs, shuffle, initStartMajs, fillStartMajs, sortHands, resetPosition, deal, discard, clearMajs, winAnimate};