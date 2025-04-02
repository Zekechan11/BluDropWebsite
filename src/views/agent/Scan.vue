<script setup>
import { ref } from 'vue';
import { QrcodeCapture, QrcodeStream } from 'vue3-qrcode-reader';

// State references
const error = ref('');
const decodedString = ref('');
const torch = ref(false);
const selectedFile = ref(null);
const uploadMode = ref(false);
const savedImages = ref([]);

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

// Native Device Gallery Selection
const selectFromGallery = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (event) => {
    const file = event.target.files[0];
    if (file) {
      selectedFile.value = file;
    }
  };
  input.click();
};

// Save image and additional methods remain the same as in previous implementation
const handleFileSelect = (event) => {
  const file = event.target.files[0] || event;
  selectedFile.value = file;
};

const saveImage = () => {
  if (!selectedFile.value) return;

  const imageURL = URL.createObjectURL(selectedFile.value);

  savedImages.value.push({
    name: selectedFile.value.name,
    url: imageURL,
    scannedAt: new Date().toLocaleString()
  });

  localStorage.setItem('savedQRImages', JSON.stringify(savedImages.value));
};
</script>

<template>
  <div class="space">
    <h1 class="text-4xl font-semibold mb-6" style="color: #899499">
      QR Code Scanner
    </h1>
  </div>

  <div class="card shadow-md flex flex-col justify-center items-center" style="height: 550px;">
    <!-- Error Display -->
    <p v-if="error" class="text-red-500 mb-4">{{ error }}</p>

    <!-- Camera Mode -->
    <qrcode-stream 
      @init="onInit" 
      @decode="onDecode" 
      :torch="torch" 
      class="w-full h-full"
    />

    <!-- Device Image Selection Buttons -->
    <div class="mt-4 flex space-x-2">
      <button 
        @click="selectDeviceImage" 
        class="px-4 py-2 bg-blue-500 text white rounded"
      >
        Capture Screen
      </button>

      <button 
        @click="selectFromGallery" 
        class="px-4 py-2 bg-green-500 text-white rounded"
      >
        Select from Gallery
      </button>
    </div>

    <!-- Selected File Preview and Scan -->
    <div v-if="selectedFile" class="mt-4 text-center">
      <qrcode-capture 
        :file="selectedFile" 
        @decode="onDecode"
      >
        <button class="px-4 py-2 bg-purple-500 text-white rounded">
          Scan Selected Image
        </button>
      </qrcode-capture>
    </div>
  </div>
</template>