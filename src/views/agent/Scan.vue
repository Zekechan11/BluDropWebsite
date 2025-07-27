<script setup>
import { ref } from 'vue';
import { QrcodeCapture, QrcodeStream } from 'vue3-qrcode-reader';

// State references
const error = ref('');;
const torch = ref(false);
const selectedFile = ref(null);

// Camera initialization handler
const onInit = async (promise) => {
  try {
    const { capabilities } = await promise;
  } catch (err) {
    const errorMap = {
      'NotAllowedError': "User denied camera access permission",
      'NotFoundError': "No suitable camera device installed",
      'NotSupportedError': "Page is not served over HTTPS (or localhost)",
      'NotReadableError': "Maybe camera is already in use",
      'OverconstrainedError': "Did you request the front camera although there is none?",
      'StreamApiNotSupportedError': "Browser seems to be lacking features"
    };
    error.value = errorMap[err.name] || 'Unknown camera error';
  }
};

// Update the onDecode method to pass the decoded data as encoded JSON
const onDecode = (decodedStr) => {
  try {
    // Parse the decoded string to ensure it's valid JSON
    const parsedData = JSON.parse(decodedStr);
    
    // Encode the JSON string for URL routing
    const encodedData = encodeURIComponent(JSON.stringify(parsedData));
    
    // Log raw decoded data
    console.log('Raw Decoded Data:', decodedStr);

    // Redirect with encoded data as route parameter
    window.location.replace(`/agent/payment/${encodedData}`);
  } catch (error) {
    console.error('Error processing decoded data:', error);
    
    // If parsing fails, try redirecting with raw string (fallback)
    const encodedFallback = encodeURIComponent(decodedStr);
    window.location.replace(`/agent/payment/${encodedFallback}`);
  }
};

// Device Image Selection Handler
const selectDeviceImage = () => {
  if ('mediaDevices' in navigator && 'getDisplayMedia' in navigator.mediaDevices) {
    navigator.mediaDevices.getDisplayMedia({ 
      video: { displaySurface: 'browser' } 
    })
    .then(stream => {
      const video = document.createElement('video');
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(blob => {
          selectedFile.value = new File([blob], 'device-screenshot.png', { type: 'image/png' });
          stream.getTracks().forEach(track => track.stop());
        }, 'image/png');
      };
    })
    .catch(err => {
      error.value = 'Error capturing device screen: ' + err.message;
    });
  } else {
    error.value = 'Screen capture not supported in this browser';
  }
};
</script>

<template>
  <div class="space mb-6">
    <h1 class="text-4xl font-semibold text-gray-700 flex items-center gap-3">
      <i class="pi pi-qrcode text-blue-500 !text-4xl"></i>
      QR Code Scanner
    </h1>
  </div>

  <div class="card shadow-lg p-6 bg-white rounded-xl flex flex-col items-center justify-between gap-6 h-[82vh]">
    <!-- Error Display -->
    <div v-if="error" class="w-full text-center">
      <p class="text-red-500 font-semibold text-sm">{{ error }}</p>
    </div>

    <!-- Camera Stream -->
    <div class="w-full flex-1 rounded-md overflow-hidden border border-gray-300">
      <qrcode-stream @init="onInit" @decode="onDecode" :torch="torch" class="w-full h-full object-cover" />
    </div>

    <!-- Device Actions -->
    <div class="flex flex-col sm:flex-row items-center gap-3 mt-4">
      <button @click="selectDeviceImage"
        class="px-4 py-2 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition duration-150">
        <i class="pi pi-camera" />
        Capture Screen
      </button>
      <label for="selectFromGallery"
        class="px-4 py-2 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm transition duration-150">
        <i class="pi pi-image" />
        Select from Gallery
      </label>
      <qrcode-capture id="selectFromGallery" :file="selectedFile" @decode="onDecode" class="hidden" />
    </div>
  </div>
</template>