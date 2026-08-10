//lets the currently open color picker receive colors clicked on the image canvases
//the canvases are owned by app.vue, while the color picker is mounted several levels down
//in one of the dither/filter sections, so this acts as the rendezvous point between them
//safe as a singleton, since the color picker overlay means only 1 picker can be open at a time

let pickedColorCallback = null;
let activeChangedCallback = null;

function isActive() {
    return pickedColorCallback !== null;
}

//called by color-picker.vue when it is mounted
function register(callback) {
    pickedColorCallback = callback;
    if (activeChangedCallback) {
        activeChangedCallback(true);
    }
}

//called by color-picker.vue when it is unmounted
function unregister(callback) {
    if (pickedColorCallback !== callback) {
        return;
    }
    pickedColorCallback = null;
    if (activeChangedCallback) {
        activeChangedCallback(false);
    }
}

//called by app.vue, so it can show the canvases as pickable while a picker is open
function onActiveChanged(callback) {
    activeChangedCallback = callback;
}

//called by app.vue when one of the image canvases is clicked
//hex is in the form #ffffff
function pickColor(hex) {
    if (pickedColorCallback) {
        pickedColorCallback(hex);
    }
}

export default {
    isActive,
    register,
    unregister,
    onActiveChanged,
    pickColor,
};
