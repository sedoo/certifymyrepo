<i18n>
{
  "en": {
    "connecting": "Connecting..."
  },
  "fr": {
    "connecting": "Connexion..."
  }
}
</i18n>
<template>
  <div class="pa-10">
    <div>
      <v-progress-linear indeterminate height="3" />
    </div>
    <div class="text-center pa-10 headline">
      <p>{{ $t('connecting') }}.</p>
    </div>
  </div>
</template>
<script>
export default {
  data: () => ({})
};
</script>