

const cleanString = str => lowerFirstLetter(str.replace(/ /g, ''));

function lowerFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

exports.intentToAction = (intent, rs, parameters) => {

    console.log(cleanString(intent));
    console.log((parameters));

    const func = rs[cleanString(intent)];

    if (typeof func === 'function') {
        return rs[cleanString(intent)](parameters);
    } else {
        return `Sorry I have not been taught how to handle ${intent} yet`;
    }
}
