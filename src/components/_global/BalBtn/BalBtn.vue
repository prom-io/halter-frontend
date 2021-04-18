<template>
  <component
    :is="tag"
    :class="['bal-btn', btnClasses]"
    :disabled="disabled || loading"
  >
    <div v-if="loading" class="flex items-center justify-center">
      <BalLoadingIcon :size="size" :color="iconColor" />
      <span v-if="loadingLabel" class="ml-2">
        {{ loadingLabel }}
      </span>
    </div>
    <div v-else class="content">
      <span v-if="label">
        {{ label }}
      </span>
      <slot v-else />
    </div>
  </component>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import BalLoadingIcon from '../BalLoadingIcon/BalLoadingIcon.vue';

export default defineComponent({
  name: 'BalBtn',

  components: {
    BalLoadingIcon
  },

  props: {
    tag: {
      type: String,
      default: 'button',
      validator: (val: string): boolean =>
        ['button', 'a', 'div', 'router-link'].includes(val)
    },
    size: {
      type: String,
      default: 'md',
      validator: (val: string): boolean => ['sm', 'md', 'lg'].includes(val)
    },
    color: {
      type: String,
      default: 'primary',
      validator: (val: string): boolean =>
        ['primary', 'gradient', 'gradient-reverse', 'gray', 'red'].includes(val)
    },
    label: { type: String, default: '' },
    block: { type: Boolean, default: false },
    circle: { type: Boolean, default: false },
    outline: { type: Boolean, default: false },
    flat: { type: Boolean, default: false },
    rounded: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    loadingLabel: { type: String, default: 'loading...' },
    disabled: { type: Boolean, default: false }
  },

  setup(props) {
    const sizeClasses = (): string => {
      switch (props.size) {
        case 'sm':
          return 'px-4 h-10 text-xs';
        case 'lg':
          return 'px-2 md:px-12 h-18 text-lg md:text-2xl';
        default:
          return 'px-2 md:px-8 h-14 text-base';
      }
    };

    const circleSizeClasses = (): string => {
      switch (props.size) {
        case 'sm':
          return 'w-6 h-6 text-lg';
        case 'lg':
          return 'w-16 h-16 text-2xl';
        default:
          return 'w-10 h-10 text-base';
      }
    };

    const bgGradientClasses = (): string => {
      if (props.outline) return 'bg-transparent';

      const fromColor = props.color === 'gradient' ? 'blue' : 'pink';
      const toColor = props.color === 'gradient' ? 'pink' : 'blue';

      if (props.disabled || props.loading) {
        return `bg-gradient-to-tr from-${fromColor}-50 to-${toColor}-50`;
      }
      return `
        bg-gradient-to-tr from-${fromColor}-500 to-${toColor}-500
        hover:from-${fromColor}-600 hover:to-${toColor}-600
      `;
    };

    const bgFlatClasses = computed(() => {
      return `
        bg-${props.color}-50 hover:bg-${props.color}-100
        dark:hover:bg-${props.color}-dark-800
      `;
    });

    const bgColorClasses = (): string => {
      if (props.color.includes('gradient')) return bgGradientClasses();
      if (props.outline) return 'bg-transparent';
      if (props.flat) return bgFlatClasses.value;

      if (props.disabled || props.loading) {
        return `bg-${props.color}-400 dark:bg-${props.color}-dark-400`;
      }

      return `
        bg-${props.color}-500 hover:bg-${props.color}-600
        dark:bg-${props.color}-dark-500 dark:hover:bg-${props.color}-dark-600
      `;
    };

    const borderClasses = (): string => {
      if (props.outline) return `border border-${props.color}-200`;
      return 'border-none';
    };

    const textColorClasses = (): string => {
      if (props.outline || props.flat) return `text-${props.color}-500`;
      return 'text-white';
    };

    const displayClasses = (): string => {
      if (props.circle) return 'flex justify-center items-center';
      if (props.block) return 'block w-full';
      return 'inline-block';
    };

    const shapeClasses = (): string => {
      if (props.circle || props.rounded) return 'rounded-full';
      return 'rounded-lg';
    };

    const cursorClasses = (): string => {
      if (props.disabled || props.loading) return 'cursor-not-allowed';
      return 'cursor-pointer';
    };

    const shadowClasses = (): string => {
      if (props.outline || props.flat || props.disabled || props.loading)
        return '';
      return 'shadow-lg hover:shadow-none';
    };

    const btnClasses = computed(() => {
      return {
        [sizeClasses()]: !props.circle,
        [circleSizeClasses()]: props.circle,
        [bgColorClasses()]: true,
        [textColorClasses()]: true,
        [borderClasses()]: true,
        [displayClasses()]: true,
        [shapeClasses()]: true,
        [shadowClasses()]: true,
        [cursorClasses()]: true
      };
    });

    const iconColor = computed(() => {
      if (props.outline) return props.color;
      return 'white';
    });

    return {
      btnClasses,
      iconColor
    };
  }
});
</script>

<style scoped>
.bal-btn {
  @apply font-medium overflow-hidden;
  transition: all 0.2s ease;
  text-decoration: none !important;
  line-height: 0;
}

.bal-btn:focus,
.bal-btn:active {
  outline: none !important;
}

.content {
  @apply flex justify-center items-center w-full h-full;
}
</style>