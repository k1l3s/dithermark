<template>
    <div :class="$style.canvasSupercontainer">
        <div
            :class="[$style.canvasContainer, {[$style.eyedropperActive]: isEyedropperActive}]">
            <canvas
                ref="sourceCanvasOutput"
                v-show="showOriginalImage"
                @click="canvasClicked(true, $event)">
            </canvas>
            <canvas
                ref="transformCanvasOutput"
                @click="canvasClicked(false, $event)">
            </canvas>
        </div>
    </div>
</template>

<style lang="scss" module>
.canvasSupercontainer{
    display: flex;
    overflow-x: scroll;
    max-width: calc(100vw - #{variables.$chrome_fullscreen_horizontal_scrollbar_height});
}

.canvasContainer{
    display: flex;
    column-gap: 25px;
    margin-top: 12px;
}

//while a color picker is open, the image can be clicked to sample a color from it
//note the color picker overlay only covers the controls container, so it doesn't
//block the canvases, and they don't need to be raised above it
.eyedropperActive{
    canvas{
        cursor: crosshair;
    }
}

@include mixins.pinned_controls_mq{
    .canvasSupercontainer{
        overflow-x: initial;
        max-width: none;
    }

    .canvasContainer{
        &::before, &::after{
            content: '';
            width: variables.$pinned_controls_canvas_padding;
        }
    }
}
</style>

<script>
export default {
    expose: ['sourceCanvasOutput', 'transformCanvasOutput'],
    props: {
        showOriginalImage: {
            type: Boolean,
            required: true,
        },
        isEyedropperActive: {
            type: Boolean,
            required: true,
        },
        onCanvasClicked: {
            type: Function,
            required: true,
        },
    },
    computed: {
        sourceCanvasOutput(){
            return this.$refs.sourceCanvasOutput;
        },
        transformCanvasOutput(){
            return this.$refs.transformCanvasOutput;
        },
    },
    methods: {
        canvasClicked(isSourceCanvas, event){
            if(!this.isEyedropperActive){
                return;
            }
            this.onCanvasClicked(isSourceCanvas, event);
        },
    },
};
</script>
