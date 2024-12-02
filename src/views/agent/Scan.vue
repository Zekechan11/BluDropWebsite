<script setup>
import { ref } from 'vue';
import { QrcodeStream } from 'vue3-qrcode-reader';

const error = ref('');
const decodedString = ref('');
const torch = ref(false);

const onInit = async (promise) => {
  try {
    const { capabilities } = await promise;

  } catch (err) {
    if (err.name === 'NotAllowedError') {
      error.value = "User denied camera access permission";
    } else if (err.name === 'NotFoundError') {
      error.value = "No suitable camera device installed";
    } else if (err.name === 'NotSupportedError') {
      error.value = "Page is not served over HTTPS (or localhost)";
    } else if (err.name === 'NotReadableError') {
      error.value = "Maybe camera is already in use";
    } else if (err.name === 'OverconstrainedError') {
      error.value = "Did you request the front camera although there is none?";
    } else if (err.name === 'StreamApiNotSupportedError') {
      error.value = "Browser seems to be lacking features";
    }
  }
};

const onDecode = (decodedStr) => {
  decodedString.value = decodedStr;

  window.location.replace(`/agent/payment/${decodedString.value}`);
};
</script>

<template>
  <div class="space">
    <h1 class="text-4xl font-semibold mb-6" style="color: #899499">Scanner</h1>
  </div>

  <div class="card shadow-md flex justify-center items-center" style="height: 550px;">
    <p>{{ error }}</p>
    <!-- <p>{{ decodedString }}</p> -->
    <button @click="torch = !torch"></button>
    <qrcode-stream @init="onInit" @decode="onDecode" :torch="torch" />
  </div>
</template>
