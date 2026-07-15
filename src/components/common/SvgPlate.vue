<script setup>
defineProps({
  steel: { type: Boolean, default: false },
  size: { type: Number, default: 18 },
})
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
    class="plate-icon" aria-hidden="true">
    <!-- <title id="title">Weight Plate Logo</title>
          <desc id="desc">Concentric rings representing a weightlifting plate</desc> -->
    <!-- Weight plate: 4 concentric rings (outside to center) -->

    <!-- 1. Outermost thick ring -->
    <circle cx="200" cy="220" r="168" :stroke="steel ? 'var(--color-steel)' : 'var(--color-accent)'" stroke-width="34"
      :fill="steel ? 'var(--color-steel)' : 'var(--color-accent)'">
    </circle>

    <!-- 2. Thin ring -->
    <circle cx="200" cy="220" r="122" :stroke="steel ? 'var(--color-steel)' : 'var(--color-accent)'" stroke-width="9"
      :fill="steel ? 'var(--color-steel)' : 'var(--color-accent)'">
    </circle>

    <!-- 3. Medium-thin ring -->
    <!-- high detail not good when icon is small -->
    <!-- <circle cx="200" cy="220" r="98" :stroke="steel ? 'var(--color-steel)' : 'var(--color-accent)'" stroke-width="14" :fill="steel ? 'var(--color-steel)' : 'var(--color-accent)'">
    </circle> -->

    <!-- 4. Inner thick ring (hub area) -->
    <circle cx="200" cy="220" r="35" :stroke="steel ? 'var(--color-steel)' : 'var(--color-accent)'" stroke-width="26"
      :fill="steel ? 'var(--color-steel)' : 'var(--color-accent)'">
    </circle>
  </svg>
</template>

<style scoped>
.plate-icon {
  transition: transform 0.15s ease;
  flex-shrink: 0;
}

.plate-icon:hover {
  transform: scale(1.15);
}
</style>