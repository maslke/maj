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
            majs.push(number);
        } else if (type === 'p') {
            majs.push(number + 10);
        } else if (type === 's') {
            majs.push(number + 20);
        } else if (type === 'w') {
            majs.push(30 + 2 * number - 1);
        }
    }
    majs.sort((a, b) => a - b);
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
    const array = [1,9,11,19,21,29,31,33,35,37,39,41,43];
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

function win(hands) {
    let majs = convert(hands);
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

export {win};