<script setup lang="ts" generic="T extends string | number">
defineProps<{ legend: string; options: readonly T[] }>()

const selected = defineModel<T>({ required: true })
</script>

<template>
  <fieldset class="mb-5 border-0 p-0">
    <legend class="mb-2 p-0 text-[13px] text-quiet">{{ legend }}</legend>
    <div class="flex flex-wrap gap-[7px]">
      <button
        v-for="option in options"
        :key="option"
        type="button"
        :aria-pressed="option === selected"
        class="min-h-[46px] min-w-[42px] flex-1 cursor-pointer rounded-[7px] border
               border-rule bg-transparent px-1.5 text-base leading-none text-ink
               transition-colors duration-100 hover:bg-accent-soft
               focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
               aria-pressed:border-accent aria-pressed:bg-accent-soft aria-pressed:text-accent
               motion-reduce:transition-none"
        @click="selected = option"
      >
        {{ option }}
      </button>
    </div>
  </fieldset>
</template>
