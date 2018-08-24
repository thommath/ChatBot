

const cleanString = str => lowerFirstLetter(str.replace(/ /g, ''));

function lowerFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

exports.intentToAction = (intent, rs) => {

    console.log(cleanString(intent));

    const func = rs[cleanString(intent)];

    if (typeof func === 'function') {
        return func();
    } else {
        return `Sorry I have not been taught how to handle ${intent} yet`;
    }
}
