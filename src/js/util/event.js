import * as THREE from "three";
import * as MajPosition from './maj-position';
import {discard, resetPosition, sortHands} from './mahjong';

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

function clickHandler(rayCaster, majList, canvas, camera, callback) {
    return function(event) {
        const mouse = convertMouseVector(event, canvas);
        rayCaster.setFromCamera(mouse, camera);
        const intersects = rayCaster.intersectObjects(majList, false);
        if (intersects.length > 0) {
            callback(intersects[0]);
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

                        if (inx === hands.length - 1) {
                            // 弃牌为最后一张
                            for (let inx2 = len - 1; inx2 > inx; inx2--) {
                                hands[inx2].position.copy(hands[inx2 - 1].position);
                            }
                            hands.splice(inx, 1);
                            break;
                        } else {
                            // 弃牌为其它手牌
                            for (let inx2 = len - 1; inx2 > inx; inx2--) {
                                hands[inx2].position.copy(hands[inx2 - 1].position);
                            }
                            hands.splice(inx, 1);
                            break;
                        }


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

export {majHandMousemoveHandler, majHandMouseClickHandler, convertMouseVector, clickHandler}