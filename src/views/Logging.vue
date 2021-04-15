<template>
  <div class="pa-10">
    <div>
      <v-progress-linear indeterminate height="3" />
    </div>
    <div class="text-center pa-10 headline">
      <p>{{ $t('logging.temporary.screen.connecting') }}.</p>
    </div>
  </div>
</template>
<script>
export default {
  data: () => ({})
};
</script>