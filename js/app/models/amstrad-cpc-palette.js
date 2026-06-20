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

//returns the hex of the Amstrad CPC color closest (euclidean rgb distance) to the given hex color
function nearestColor(hex) {
    const [r, g, b] = parseHex(hex);
    let nearestHex = AMSTRAD_CPC_PALETTE[0].hex;
    let nearestDistance = Infinity;

    AMSTRAD_CPC_PALETTE.forEach(color => {
        const [cr, cg, cb] = parseHex(color.hex);
        const distance =
            (r - cr) * (r - cr) +
            (g - cg) * (g - cg) +
            (b - cb) * (b - cb);
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestHex = color.hex;
        }
    });

    return nearestHex;
}

export default {
    palette: AMSTRAD_CPC_PALETTE,
    nearestColor,
};
