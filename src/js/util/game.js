import * as MajType from './maj-type';
import {discard, sortHands} from "./mahjong";


function canChi(hands, maj) {
    let majs = convert(hands);
    let {type, number} = maj.attributes;
    const no = convertToNumber(type, number);
    if (no >= 30) return false;

    const r1 = majs.find(m => m === no - 2);
    const r2 = majs.find(m => m === no - 1);
    const r3 = majs.find(m => m === no + 1);
    const r4 = majs.find(m => m === no + 2);
    return (r1 && r2) || (r2 && r3) || (r3 && r4);
}

function canPon(hands, maj) {
    let majs = convert(hands);
    let {type, number} = maj.attributes;
    const no = convertToNumber(type, number);
    let count = majs.filter(m => m === no).length;
    return count >= 2;
}

function canGang(hands, maj) {
    let majs = convert(hands);
    let {type, number} = maj.attributes;
    const no = convertToNumber(type, number);
    let count = majs.filter(m => m === no).length;
    return count === 3;
}

function autoDiscard(hands, discards, majConfig, vector3, discardConfig, timeout, callback) {
    setTimeout(function () {
        const inx = parseInt(Math.random() * hands.length);
        const maj = hands[inx];
        hands.splice(inx, 1);
        sortHands(hands);
        for (let i = 0; i < hands.length; i++) {
            hands[i].position.x = vector3.x - (majConfig.width + 1) * i;
        }
        discard(maj, discards, discardConfig, majConfig, true)
        callback(maj);
    }, timeout);
}

function convert(hands) {
    const majs = [];
    for (let inx = 0, length = hands.length; inx < length; inx++) {
        let {type, number} = hands[inx].attributes;
        majs.push(convertToNumber(type, number));
    }
    majs.sort((a, b) => a - b);
    return majs;
}

function convertToNumber(type, number) {
    if (number === 0) {
        number = 5;
    }
    if (type === MajType.M) {
        return number;
    } else if (type === MajType.P) {
        return number + 10;
    } else if (type === MajType.S) {
        return number + 20;
    } else if (type === MajType.W) {
        return 30 + 2 * number - 1;
    }
}

function pickDouble(majs) {
    const indexes = [];
    let inx = 0, length = majs.length;
    while (inx < length - 1) {
        if (majs[inx] === majs[inx + 1]) {
            indexes.push(inx);
            inx = inx + 2;
        } else {
            inx = inx + 1;
        }
    }
    return indexes;
}

function allTriple(hands) {
    if (hands.length === 0) {
        return true;
    }

    if (hands.length < 3) {
        return false;
    }

    const val = hands[0];
    let copy;
    if (hands[1] === val && hands[2] === val) {
        copy = hands.slice(0, hands.length);
        copy.splice(0, 3);
        const ret = allTriple(copy);
        if (ret) return true;
    }
    if (hands.indexOf(val + 1) > 0 && hands.indexOf(val + 2) > 0) {
        let inx1 = hands.indexOf(val + 1);
        let inx2 = hands.indexOf(val + 2);
        copy = hands.slice(0, hands.length);
        copy.splice(0, 1);
        copy.splice(inx1 - 1, 1);
        copy.splice(inx2 - 2, 1);
        return allTriple(copy);
    }
    return false;
}

/**
 * 七对子
 * @param majs
 * @returns {boolean}
 */
function double7(majs) {
    const mapper = {};
    for (let inx in majs) {
        let val = majs[inx];
        if (mapper.hasOwnProperty(val)) {
            mapper[val] = mapper[val] + 1;
        } else {
            mapper[val] = 1;
        }
    }
    for (let key in mapper) {
        if (mapper[key] !== 2) return false;
    }
    return true;
}

/**
 * 国士无双
 * 打表实现
 * @param majs
 */
function all19(majs) {
    const str = majs.toString();
    const array = [1, 9, 11, 19, 21, 29, 31, 33, 35, 37, 39, 41, 43];
    for (let inx = 0; inx < 13; inx++) {
        array.splice(inx, 0, array[inx]);
        if (array.toString() === str) {
            return true;
        }
        array.splice(inx, 1);
    }
    return false;
}

/**
 * win or not ?
 */

function canWin(hands, maj) {
    let majs = convert(hands);
    if (maj) {
        const {type, number} = maj.attributes;
        const no = convertToNumber(type, number);
        majs.push(no);
        majs.sort((a, b) => a - b);
    }
    if (double7(majs) || all19(majs)) return true;
    const doubles = pickDouble(majs);
    if (doubles.length === 0) {
        return false;
    }
    for (let inx in doubles) {
        const copy = majs.slice(0, majs.length);
        copy.splice(doubles[inx], 2);
        if (allTriple(copy)) {
            return true;
        }
    }
    return false;
}

function findFirstGreaterIndex(hands) {
    const last = hands[hands.length - 1];
    const numberb = convertToNumber(last.attributes.type, last.attributes.number);
    let inx = 0;
    while (inx < hands.length - 1) {
        const numberA = convertToNumber(hands[inx].attributes.type, hands[inx].attributes.number);
        if (numberA > numberb) {
            break;
        }
        inx++;
    }
    return inx;
}

function startGame(selecotr, callback) {
    const btn = document.querySelector(selecotr);
    btn.addEventListener('click', callback);
}

function hiddenAll() {
    document.querySelector('#container2').classList.remove('nodisplay');
    for (let i = 0; i < document.querySelector('#container2').children.length; i++) {
        document.querySelector('#container2').children[i].classList.add('nodisplay');
    }
}

function displayStart() {
    document.querySelector('#container').classList.remove('nodisplay');
    for (let i = 0; i < document.querySelector('#container').children.length; i++) {
        document.querySelector('#container').children[i].classList.remove('nodisplay');
    }
}

function winGame(type, selectable) {
    document.querySelector('#container2').classList.remove('nodisplay');
    for (let i = 0; i < document.querySelector('#container2').children.length; i++) {
        document.querySelector('#container2').children[i].classList.add('nodisplay');
    }
    if (type === 0) {
        document.querySelector('#btnWin').classList.remove('nodisplay');
    } else {
        document.querySelector('#btnZimo').classList.remove('nodisplay');
    }
    if (selectable) {
        document.querySelector('#btnSkip').classList.remove('nodisplay');
    }
}

function drawGame() {
    document.querySelector('#container2').classList.remove('nodisplay');
    for (let i = 0; i < document.querySelector('#container2').children.length; i++) {
        document.querySelector('#container2').children[i].classList.add('nodisplay');
    }
    document.querySelector('#btnDraw').classList.remove('nodisplay');
}

function zimoWinEvent(zimoCallback, skipCallback) {
    const zimoBtn = document.querySelector('#btnZimo');
    const skipBtn = document.querySelector('#btnSkip');
    zimoBtn.removeEventListener('click', zimoCallback);
    skipBtn.removeEventListener('click', skipCallback);
    zimoBtn.addEventListener('click', zimoCallback);
    skipBtn.addEventListener('click', skipCallback);
}

function ronWinEvent(ronCallback, skipCallback) {
    const winBtn = document.querySelector('#btnWin');
    const skipBtn = document.querySelector('#btnSkip');
    winBtn.removeEventListener('click', ronCallback);
    skipBtn.removeEventListener('click', skipCallback);
    winBtn.addEventListener('click', ronCallback);
    skipBtn.addEventListener('click', skipCallback);
}

export {canWin, convertToNumber, autoDiscard, findFirstGreaterIndex, startGame, drawGame, winGame, canChi, canPon,
    canGang, hiddenAll, zimoWinEvent, ronWinEvent, displayStart};