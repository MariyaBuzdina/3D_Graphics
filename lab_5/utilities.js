function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}