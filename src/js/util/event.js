import * as THREE from "three";
import * as MajPosition from './maj-position';
import {discard, deal, sortHands, resetPosition} from './mahjong';
import {TWEEN} from "three/examples/jsm/libs/tween.module.min";

function convertMouseVector(event, canvas) {
    let getBoundingClientRect = canvas.getBoundingClientRect();
    let left = getBoundingClientRect.left;
    let top = getBoundingClientRect.top;
    // 屏幕坐标转换为标准设备坐标
    let x = 2 * (event.clientX - left) / canvas.offsetWidth - 1;
    let y = -2 * (event.clientY - top) / canvas.offsetHeight + 1;

    return new THREE.Vector3(x, y, 0.5);
}

function majHandMousemoveHandler(rayCaster, majList, hands, canvas, camera, vector3) {
    return function (event) {
        const mouse = convertMouseVector(event, canvas);
        rayCaster.setFromCamera(mouse, camera);
        const intersects = rayCaster.intersectObjects(majList, false);
        if (intersects.length > 0) {
            const selectedMesh = intersects[0].object;
            if (selectedMesh.parent.typeName === MajPosition.HAND) {
                hands.forEach(maj => {
                    if (maj !== selectedMesh.parent) {
                        maj.position.y = vector3.y;
                    }
                });
                if (selectedMesh.parent.position.y === vector3.y) {
                    selectedMesh.parent.position.y += 15;
                }
            }
        } else {
            hands.forEach(maj => {
                maj.position.y = vector3.y;
            });
        }
    }
}

function majHandMouseClickHandler(rayCaster, majList, hands, scene, canvas, camera, discards, discardConfig, majConfig, mountains, vector3) {
    return function (event) {
        const mouse = convertMouseVector(event, canvas);
        rayCaster.setFromCamera(mouse, camera);
        const intersects = rayCaster.intersectObjects(majList, false);
        if (intersects.length > 0) {
            const selectedMesh = intersects[0].object;
            if (selectedMesh.parent.typeName === MajPosition.HAND) {
                for (let inx = majList.length - 1; inx >= 0; inx--) {
                    if (majList[inx].parent === selectedMesh.parent) {
                        majList.splice(inx, 1);
                    }
                }

                for (let inx = 0, len = hands.length; inx < len; inx++) {
                    if (hands[inx] === selectedMesh.parent) {
                        for (let inx2 = len - 1; inx2 > inx; inx2--) {
                            hands[inx2].position.copy(hands[inx2 - 1].position);
                        }
                        hands.splice(inx, 1);
                        break;
                    }
                }
                discard(selectedMesh.parent, discards, discardConfig, majConfig)

                sortHands(hands);
                resetPosition(hands, majConfig, vector3);

                return true;
            }
        }
        return false;
    }
}



function majMountainMouseClickHandler(rayCaster, majList, hands, scene, canvas, camera, vector3, majConfig) {
    return function (event) {
        const mouse = convertMouseVector(event, canvas);
        rayCaster.setFromCamera(mouse, camera);
        const intersects = rayCaster.intersectObjects(majList, false);
        if (intersects.length > 0) {
            const selectedMesh = intersects[0].object;
            if (selectedMesh.parent.typeName === MajPosition.MOUNTAIN) {
                if (hands.length === 14) return;
                const group = new THREE.Group();
                group.attributes = selectedMesh.parent.attributes;
                selectedMesh.parent.children.forEach(mesh => group.add(mesh.clone()));
                group.typeName = MajPosition.HAND;
                group.rotation.x = 0;
                group.position.set(vector3.x + (majConfig.width + 1) * hands.length, vector3.y, vector3.z);

                hands.push(group);
                scene.add(group);
                majList.push(...group.children);
            }
        }
    }
}

export {majHandMousemoveHandler, majHandMouseClickHandler, majMountainMouseClickHandler}