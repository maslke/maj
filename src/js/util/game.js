/**
 * 将手牌转换为数字表示形式
 * m1-m9 -> 1-9
 * p1-p9 -> 11-19
 * s1-s9 -> 21-29
 * w -> 31, 33, 35...
 * @param hands
 * @returns {*[]}
 */
function convert(hands) {
    const majs = [];
    for (let inx = 0, length = hands.length; inx < length; inx++) {
        let {type, number} = hands[inx].attributes;
        if (number === 0) {
            number = 5;
        }
        if (type === 'm') {
            majs.push(number + 1);
        } else if (type === 'p') {
            majs.push(number + 10);
        } else if (type === 's') {
            majs.push(number + 20);
        } else if (type === 'w') {
            majs.push(30 + 2 * number - 1);
        }
    }
    majs.sort();
    return majs;
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
    if (hands.length < 3) {
        return false;
    }
    if (hands.length === 0) {
        return true;
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
        copy.splice(inx1, 1);
        copy.splice(inx2 - 1, 1);
        return allTriple(copy);
    }
    return false;
}

/**
 * win or not ?
 */

function win(hands) {
    const majs = convert(hands);
    const doubles = pickDouble(majs);
    for (let inx in doubles) {
        const copy = majs.slice(0, majs.length);
        copy.splice(inx, 2);
        if (allTriple(copy)) {
            return true;
        }
    }
    return false;
}

export {win};