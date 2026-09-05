<script setup lang="ts">
import type { StaffLayout } from '../lib/note-position'

defineProps<{ layout: StaffLayout }>()
</script>

<template>
  <div class="-mx-1">
    <svg
      :viewBox="`0 0 400 ${layout.height}`"
      class="block h-auto w-full"
      role="img"
      aria-labelledby="staff-title"
    >
      <title id="staff-title">
        {{ layout.label }} on the {{ layout.clef }} staff. {{ layout.sentence }}
      </title>

      <g class="stroke-rule" stroke-width="1.1">
        <line
          v-for="y in layout.staffLineYs"
          :key="`staff-${y}`"
          :x1="layout.staffLeft"
          :y1="y"
          :x2="layout.staffRight"
          :y2="y"
        />
      </g>

      <g class="stroke-ink" stroke-width="1.6">
        <line
          v-for="y in layout.ledgerYs"
          :key="`ledger-${y}`"
          :x1="layout.ledgerLeft"
          :y1="y"
          :x2="layout.ledgerRight"
          :y2="y"
        />
      </g>

      <text
        :x="layout.glyphX"
        :y="layout.glyphY"
        :font-size="layout.glyphSize"
        class="fill-ink font-music"
      >{{ layout.glyph }}</text>

      <ellipse
        :cx="layout.noteX"
        :cy="layout.noteY"
        rx="9"
        ry="6.8"
        :transform="`rotate(-20 ${layout.noteX} ${layout.noteY})`"
        class="fill-ink"
      />
    </svg>
  </div>
</template>
