<script setup lang="ts">
import { ref } from "vue";
import GoogleDrive from "./components/GoogleDrive.vue";

const userName = ref("John Doe");
</script>

<template>
  <GoogleDrive
    clientId="560824043182-6c6mmksm8sl7613o0f2ub2m33r24p9lc.apps.googleusercontent.com"
    redirectUri="http://localhost:3000/oauth2callback"
    :allowedFormats="['image/png']"

  />
</template>

<style scoped></style>
