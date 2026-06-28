<template>
    <div
        :class="{
            [$style.penContainer]: true,
            [$style.penDisabled]: isDisabled,
        }"
    >
        <span :class="$style.penNumber">{{ colorIndex + 1 }}</span>
        <span
            :class="$style.sourceSwatch"
            :style="{ 'background-color': sourceColor }"
            :title="`Palette color: ${sourceColor}`"
        ></span>
        <span :class="$style.arrow">&rarr;</span>
        <div :class="$style.penPickerWrap">
            <button
                type="button"
                :class="$style.penButton"
                :style="{ 'background-color': modelValue, color: textColor }"
                :disabled="isDisabled"
                :title="`Pen (Amstrad CPC): ${selectedName} ${modelValue}`"
                @click="toggleOpen"
            >
                <span :class="$style.penName">{{ selectedName }}</span>
                <span :class="$style.caret">▾</span>
            </button>
            <template v-if="isOpen">
                <div :class="$style.overlay" @click="close"></div>
                <div :class="$style.penGrid">
                    <button
                        v-for="color in palette"
                        :key="color.hex"
                        type="button"
                        :class="{
                            [$style.swatch]: true,
                            [$style.swatchSelected]: color.hex === modelValue,
                        }"
                        :style="{ 'background-color': color.hex }"
                        :title="`${color.name} ${color.hex}`"
                        @click="select(color.hex)"
                    ></button>
                </div>
            </template>
        </div>
    </div>
</template>

<style lang="scss" module>
.penContainer {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-basis: 200px;
    border: 1px solid var(--border-color);
    border-radius: 5px;
    padding: 4px 6px;

    &.penDisabled {
        opacity: 0.4;
        pointer-events: none;
    }
}

.penNumber {
    min-width: 1.4em;
    text-align: right;
    color: var(--hint-text-color);
    font-size: 14px;
}

.sourceSwatch {
    width: 28px;
    height: 24px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    flex-shrink: 0;
}

.arrow {
    color: var(--hint-text-color);
}

.penPickerWrap {
    position: relative;
    flex: 1;
    min-width: 0;
}

.penButton {
    width: 100%;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    padding: 0 6px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
}

.penName {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.caret {
    flex-shrink: 0;
    opacity: 0.7;
}

//full screen catcher so clicking elsewhere closes the grid
.overlay {
    position: fixed;
    inset: 0;
    z-index: 10;
}

.penGrid {
    position: absolute;
    z-index: 11;
    top: calc(100% + 4px);
    left: 0;
    display: grid;
    grid-template-columns: repeat(9, 22px);
    gap: 3px;
    padding: 6px;
    background-color: var(--pinned-controls-bg-color);
    border: 1px solid var(--border-color);
    border-radius: 5px;
    box-shadow: -1px 2px 4px rgba(0, 0, 0, 0.3);
}

.swatch {
    width: 22px;
    height: 22px;
    border: 1px solid var(--border-color);
    border-radius: 3px;
    cursor: pointer;
    padding: 0;

    &.swatchSelected {
        outline: 2px solid var(--active-control-bg-color, #fff);
        outline-offset: 1px;
    }
}
</style>

<script>
//pen assignment: maps a (non-CPC) palette color to an Amstrad CPC color,
//chosen from a visual grid of the 27 CPC colors

import ColorPicker from '../color-picker.js';
import AmstradCpcPalette from '../models/amstrad-cpc-palette.js';
import { lightness } from '../../shared/pixel-math-lite.js';

export default {
    props: {
        colorIndex: {
            type: Number,
            default: 0,
        },
        //the current palette color (non-CPC) this pen translates from
        sourceColor: {
            type: String,
            required: true,
        },
        //the assigned Amstrad CPC color (the "pen")
        modelValue: {
            type: String,
            required: true,
        },
        isDisabled: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            palette: AmstradCpcPalette.palette,
            isOpen: false,
        };
    },
    computed: {
        selectedName() {
            const match = this.palette.find(
                color => color.hex === this.modelValue
            );
            return match ? match.name : this.modelValue;
        },
        //so the color name is visible on dark CPC pen backgrounds
        textColor() {
            const colorLightness = lightness(
                ColorPicker.pixelFromHex(this.modelValue)
            );
            return colorLightness >= 127 ? '#000' : '#fff';
        },
    },
    methods: {
        toggleOpen() {
            if (this.isDisabled) {
                return;
            }
            this.isOpen = !this.isOpen;
        },
        close() {
            this.isOpen = false;
        },
        select(hex) {
            this.$emit('update:modelValue', hex);
            this.isOpen = false;
        },
    },
};
</script>
