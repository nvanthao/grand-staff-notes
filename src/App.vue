<script setup lang="ts">
import { computed, ref } from 'vue'
import ChoiceRow from './components/choice-row.vue'
import StaffView from './components/staff-view.vue'
import { LETTERS, OCTAVES, staffLayout, type Letter, type Octave } from './lib/note-position'

const letter = ref<Letter>('C')
const octave = ref<Octave>(4)

const layout = computed(() => staffLayout(letter.value, octave.value))
</script>

<template>
  <h1 class="my-[22px] mb-[18px] font-serif text-[17px]/[1.3] font-normal tracking-[0.01em] text-quiet">
    Where's the note?
  </h1>

  <StaffView :layout="layout" />

  <p class="mt-1 mb-1.5 font-serif text-[34px]/none font-normal">{{ layout.label }}</p>

  <p class="mb-[30px] max-w-[34em] min-h-[3em] text-[15px] text-quiet">
    {{ layout.sentence }}
    <b v-if="layout.isMiddleC" class="font-normal text-mark">This is middle C.</b>
  </p>

  <ChoiceRow v-model="letter" legend="Note" :options="LETTERS" />
  <ChoiceRow v-model="octave" legend="Octave" :options="OCTAVES" />
</template>
