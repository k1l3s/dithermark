//The Amstrad CPC 6128 hardware palette.
//The Gate Array can display 27 colors: each of the red, green and blue
//channels can be one of three levels (0x00, 0x80, 0xff), giving 3^3 = 27
//combinations. The names below are the ones used by the CPC firmware.

/**
 * @typedef {Object} AmstradCpcColor
 * @property {string} name
 * @property {string} hex - 6 digit hex color in form #rrggbb
 */

/**
 * @type {AmstradCpcColor[]}
 */
const AMSTRAD_CPC_PALETTE = [
    { name: 'Black', hex: '#000000' },
    { name: 'Blue', hex: '#000080' },
    { name: 'Bright Blue', hex: '#0000ff' },
    { name: 'Red', hex: '#800000' },
    { name: 'Magenta', hex: '#800080' },
    { name: 'Mauve', hex: '#8000ff' },
    { name: 'Bright Red', hex: '#ff0000' },
    { name: 'Purple', hex: '#ff0080' },
    { name: 'Bright Magenta', hex: '#ff00ff' },
    { name: 'Green', hex: '#008000' },
    { name: 'Cyan', hex: '#008080' },
    { name: 'Sky Blue', hex: '#0080ff' },
    { name: 'Yellow', hex: '#808000' },
    { name: 'White', hex: '#808080' },
    { name: 'Pastel Blue', hex: '#8080ff' },
    { name: 'Orange', hex: '#ff8000' },
    { name: 'Pink', hex: '#ff8080' },
    { name: 'Pastel Magenta', hex: '#ff80ff' },
    { name: 'Bright Green', hex: '#00ff00' },
    { name: 'Sea Green', hex: '#00ff80' },
    { name: 'Bright Cyan', hex: '#00ffff' },
    { name: 'Lime', hex: '#80ff00' },
    { name: 'Pastel Green', hex: '#80ff80' },
    { name: 'Pastel Cyan', hex: '#80ffff' },
    { name: 'Bright Yellow', hex: '#ffff00' },
    { name: 'Pastel Yellow', hex: '#ffff80' },
    { name: 'Bright White', hex: '#ffffff' },
];

function parseHex(hex) {
    return [
        parseInt(hex.substring(1, 3), 16),
        parseInt(hex.substring(3, 5), 16),
        parseInt(hex.substring(5, 7), 16),
    ];
}

function distanceSquared(a, b) {
    return (
        (a[0] - b[0]) * (a[0] - b[0]) +
        (a[1] - b[1]) * (a[1] - b[1]) +
        (a[2] - b[2]) * (a[2] - b[2])
    );
}

//returns the hex of the Amstrad CPC color closest (euclidean rgb distance) to the given hex color
function nearestColor(hex) {
    const source = parseHex(hex);
    let nearestHex = AMSTRAD_CPC_PALETTE[0].hex;
    let nearestDistance = Infinity;

    AMSTRAD_CPC_PALETTE.forEach(color => {
        const distance = distanceSquared(source, parseHex(color.hex));
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestHex = color.hex;
        }
    });

    return nearestHex;
}

//Assigns each input color the nearest Amstrad CPC color WITHOUT repeating a CPC
//color, as long as that's possible (the CPC palette has 27 colors, so it's always
//possible for up to 27 inputs). Uses a global greedy strategy: consider every
//(input, cpc-color) pair in ascending distance order and lock in the closest
//pairing whose input and cpc color are both still free. Any leftover inputs
//(more than 27) fall back to plain nearestColor and may repeat.
function nearestUniqueColors(hexColors) {
    const sources = hexColors.map(parseHex);
    const palette = AMSTRAD_CPC_PALETTE.map(color => parseHex(color.hex));

    const pairs = [];
    for (let i = 0; i < sources.length; i++) {
        for (let j = 0; j < palette.length; j++) {
            pairs.push([distanceSquared(sources[i], palette[j]), i, j]);
        }
    }
    pairs.sort((a, b) => a[0] - b[0]);

    const result = new Array(hexColors.length).fill(null);
    const usedCpc = new Set();
    let assigned = 0;
    for (const [, i, j] of pairs) {
        if (assigned === result.length) {
            break;
        }
        if (result[i] === null && !usedCpc.has(j)) {
            result[i] = AMSTRAD_CPC_PALETTE[j].hex;
            usedCpc.add(j);
            assigned++;
        }
    }
    //fallback for the (rare) case of more than 27 input colors
    for (let i = 0; i < result.length; i++) {
        if (result[i] === null) {
            result[i] = nearestColor(hexColors[i]);
        }
    }

    return result;
}

export default {
    palette: AMSTRAD_CPC_PALETTE,
    nearestColor,
    nearestUniqueColors,
};
