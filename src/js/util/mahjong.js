import * as THREE from "three";


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
    const types = ['m', 'p', 's', 'w'];
    const majs = [];
    for (let i = 0; i < types.length; i++) {
        const type = types[i];
        const z = startZ + (majConfig.height + 2) * i;
        if (type === 'w') {
            const ws = ['e', 'w', 'n', 's', 'g', 'wh', 'r'];
            for (let inx = 0; inx < ws.length; inx++) {
                const maj = createMaj(majConfig.width, majConfig.height, majConfig.depth1, majConfig.depth2, type, ws[inx]);
                maj.rotation.x = -Math.PI / 2;
                maj.position.set(startX + (majConfig.width + 2) * inx,  majConfig.depth2/ 2 + 1, z);
                majs.push(maj);
            }
        } else {
            for (let inx = 0; inx < 10; inx++) {
                const maj = createMaj(majConfig.width, majConfig.height, majConfig.depth1, majConfig.depth2, type, inx);
                maj.rotation.x = -Math.PI / 2;
                maj.position.set(startX + (majConfig.width + 2) * inx, majConfig.depth2/ 2 + 1, z);
                majs.push(maj);
            }
        }
    }
    majs.forEach(maj => maj.typeName = 'mountain');
    return majs;
}

export {createTable, createMaj, initMajs};