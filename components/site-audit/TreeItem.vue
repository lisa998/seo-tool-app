<template>
  <div class="tree-item">
    <component
      :is="hasChildren ? 'button' : 'div'"
      :class="{ 'tree-item__row--interactive': hasChildren }"
      class="tree-item__row"
      v-bind="hasChildren ? { type: 'button' } : {}"
      @click="handleToggle"
    >
      <span :class="{ 'tree-item__caret--expanded': expanded }" class="tree-item__caret">
        <i v-if="loading" class="el-icon-loading"></i>
        <i v-else-if="hasChildren" class="el-icon-arrow-right"></i>
        <span v-else class="tree-item__dot"></span>
      </span>
      <div class="tree-item__content">
        <slot />
      </div>
    </component>
    <transition name="tree-item">
      <div v-if="expanded" class="tree-item__children">
        <slot name="children" />
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  hasChildren: {
    type: Boolean,
    default: false,
  },
  expanded: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['toggle']);

const handleToggle = () => {
  if (!props.hasChildren) return;
  emit('toggle');
};
</script>

<style lang="scss" scoped>
.tree-item {
  border: 1px solid #eadfda;
  border-radius: 14px;
  background: linear-gradient(180deg, #fffaf8 0%, #ffffff 100%);
  overflow: hidden;

  &__row {
    width: 100%;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px;
    border: 0;
    background: transparent;
    text-align: left;

    &--interactive {
      cursor: pointer;
      transition: background-color 0.2s ease;

      &:hover {
        background: #fbf4f1;
      }
    }
  }

  &__caret {
    width: 18px;
    min-width: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #6f5c54;
    transition: transform 0.2s ease;
    margin-top: 2px;

    &--expanded {
      transform: rotate(90deg);
    }
  }

  &__content {
    min-width: 0;
    flex: 1;
  }

  &__children {
    padding: 0 16px 14px;
  }

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 9999px;
    background: #d7c8c1;
  }

  &-enter-active,
  &-leave-active {
    transition:
      opacity 0.22s ease,
      transform 0.22s ease;
  }

  &-enter,
  &-leave-to {
    opacity: 0;
    transform: translateY(-6px);
  }
}
</style>
