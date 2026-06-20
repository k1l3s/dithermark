<template>
    <div
        :class="{
            [$style.colorContainer]: true,
            [$style.colorDisabled]: isDisabled,
        }"
        :style="{ 'background-color': modelValue, color: textColor }"
    >
        <label class="label" :class="$style.colorLabel">
            <span :class="$style.labelText">
                {{ colorIndex + 1 }}
            </span>
            <select
                :class="$style.select"
                :value="modelValue"
                :disabled="isDisabled"
                @change="$emit('update:modelValue', $event.target.value)"
            >
                <option
                    v-for="color in palette"
                    :key="color.hex"
                    :value="color.hex"
                >
                    {{ color.name }}
                </option>
            </select>
        </label>
    </div>
</template>

<style lang="scss" module>
.colorContainer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-basis: 110px;
    border: 1px solid var(--border-color);
    border-radius: 5px;
    padding: 4px;

    &.colorDisabled {
        opacity: 0.4;
    }
}

.colorLabel {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 6px;
}

.labelText {
    cursor: default;
}

.select {
    max-width: 70px;
}
</style>

<script>
//color picker for overriding palette colors with Amstrad CPC colors

import ColorPicker from '../color-picker.js';
import AmstradCpcPalette from '../models/amstrad-cpc-palette.js';
import { lightness } from '../../shared/pixel-math-lite.js';

export default {
    props: {
        colorIndex: {
            type: Number,
            default: 0,
        },
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
        };
    },
    computed: {
        //so text is visible on light color backgrounds
        textColor() {
            const colorLightness = lightness(
                ColorPicker.pixelFromHex(this.modelValue)
            );
            if (colorLightness >= 127) {
                return '#000';
            }
            return '#fff';
        },
    },
};
</script>
