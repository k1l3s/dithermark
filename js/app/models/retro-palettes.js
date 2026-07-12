//Hardware color palettes for the "override colors" feature. Each palette
//remaps the dithered output to colors a given retro machine could actually
//display. Helper functions snap arbitrary colors to the nearest palette entry.

/**
 * @typedef {Object} RetroColor
 * @property {string} name
 * @property {string} hex - 6 digit hex color in form #rrggbb
 */

/**
 * @typedef {Object} RetroPalette
 * @property {string} id
 * @property {string} name
 * @property {RetroColor[]} colors
 */

//The Amstrad CPC 6128 hardware palette. The Gate Array can display 27 colors:
//each of the red, green and blue channels can be one of three levels
//(0x00, 0x80, 0xff), giving 3^3 = 27 combinations. The names below are the
//ones used by the CPC firmware.
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

//The MSX1 (TMS9918A) fixed 15 color palette (the transparent entry is omitted).
const MSX_PALETTE = [
    { name: 'Black', hex: '#000000' },
    { name: 'Medium Green', hex: '#3eb849' },
    { name: 'Light Green', hex: '#74d07d' },
    { name: 'Dark Blue', hex: '#5955e0' },
    { name: 'Light Blue', hex: '#8076f1' },
    { name: 'Dark Red', hex: '#b95e51' },
    { name: 'Cyan', hex: '#65dbef' },
    { name: 'Medium Red', hex: '#db6559' },
    { name: 'Light Red', hex: '#ff897d' },
    { name: 'Dark Yellow', hex: '#ccc35e' },
    { name: 'Light Yellow', hex: '#ded087' },
    { name: 'Dark Green', hex: '#3aa241' },
    { name: 'Magenta', hex: '#b766b5' },
    { name: 'Gray', hex: '#cccccc' },
    { name: 'White', hex: '#ffffff' },
];

//The classic CGA/standard 16 color palette.
const CGA_PALETTE = [
    { name: 'Black', hex: '#000000' },
    { name: 'Blue', hex: '#0000aa' },
    { name: 'Green', hex: '#00aa00' },
    { name: 'Cyan', hex: '#00aaaa' },
    { name: 'Red', hex: '#aa0000' },
    { name: 'Magenta', hex: '#aa00aa' },
    { name: 'Brown', hex: '#aa5500' },
    { name: 'Light Gray', hex: '#aaaaaa' },
    { name: 'Dark Gray', hex: '#555555' },
    { name: 'Light Blue', hex: '#5555ff' },
    { name: 'Light Green', hex: '#55ff55' },
    { name: 'Light Cyan', hex: '#55ffff' },
    { name: 'Light Red', hex: '#ff5555' },
    { name: 'Light Magenta', hex: '#ff55ff' },
    { name: 'Yellow', hex: '#ffff55' },
    { name: 'White', hex: '#ffffff' },
];

function toHexChannel(value) {
    return value.toString(16).padStart(2, '0');
}

//builds every combination of the given per-channel levels, naming each entry
//by its hex value (used for the large generated EGA / Amiga palettes)
function generatePalette(levels) {
    const colors = [];
    levels.forEach(r => {
        levels.forEach(g => {
            levels.forEach(b => {
                const hex = `#${toHexChannel(r)}${toHexChannel(g)}${toHexChannel(
                    b
                )}`;
                colors.push({ name: hex, hex });
            });
        });
    });
    return colors;
}

//EGA: 6 bit RGB, each channel one of 4 levels -> 4^3 = 64 colors.
const EGA_PALETTE = generatePalette([0x00, 0x55, 0xaa, 0xff]);

//Amiga OCS: 12 bit RGB, each channel one of 16 levels -> 16^3 = 4096 colors.
const AMIGA_PALETTE = generatePalette([
    0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xaa, 0xbb,
    0xcc, 0xdd, 0xee, 0xff,
]);

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

//returns the hex of the palette color closest (euclidean rgb distance) to the
//given hex color
function nearestColor(palette, hex) {
    const source = parseHex(hex);
    let nearestHex = palette[0].hex;
    let nearestDistance = Infinity;

    palette.forEach(color => {
        const distance = distanceSquared(source, parseHex(color.hex));
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestHex = color.hex;
        }
    });

    return nearestHex;
}

//Assigns each input color the nearest palette color WITHOUT repeating a palette
//color, as long as that's possible (possible for up to palette.length inputs).
//Uses a global greedy strategy: consider every (input, palette-color) pair in
//ascending distance order and lock in the closest pairing whose input and
//palette color are both still free. Any leftover inputs (more than the palette
//size) fall back to plain nearestColor and may repeat.
function nearestUniqueColors(palette, hexColors) {
    const sources = hexColors.map(parseHex);
    const paletteColors = palette.map(color => parseHex(color.hex));

    const pairs = [];
    for (let i = 0; i < sources.length; i++) {
        for (let j = 0; j < paletteColors.length; j++) {
            pairs.push([distanceSquared(sources[i], paletteColors[j]), i, j]);
        }
    }
    pairs.sort((a, b) => a[0] - b[0]);

    const result = new Array(hexColors.length).fill(null);
    const usedPaletteColors = new Set();
    let assigned = 0;
    for (const [, i, j] of pairs) {
        if (assigned === result.length) {
            break;
        }
        if (result[i] === null && !usedPaletteColors.has(j)) {
            result[i] = palette[j].hex;
            usedPaletteColors.add(j);
            assigned++;
        }
    }
    //fallback for the case of more input colors than the palette size
    for (let i = 0; i < result.length; i++) {
        if (result[i] === null) {
            result[i] = nearestColor(palette, hexColors[i]);
        }
    }

    return result;
}

/**
 * @type {RetroPalette[]}
 */
const RETRO_PALETTES = [
    { id: 'amstrad-cpc', name: 'Amstrad CPC', colors: AMSTRAD_CPC_PALETTE },
    { id: 'msx', name: 'MSX', colors: MSX_PALETTE },
    { id: 'ega', name: 'EGA', colors: EGA_PALETTE },
    { id: 'cga', name: 'CGA', colors: CGA_PALETTE },
    { id: 'amiga', name: 'Amiga', colors: AMIGA_PALETTE },
];

const DEFAULT_RETRO_PALETTE_ID = 'amstrad-cpc';

function getPaletteById(id) {
    return (
        RETRO_PALETTES.find(palette => palette.id === id) || RETRO_PALETTES[0]
    );
}

export default {
    palettes: RETRO_PALETTES,
    defaultId: DEFAULT_RETRO_PALETTE_ID,
    getPaletteById,
    nearestColor,
    nearestUniqueColors,
};
