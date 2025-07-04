<script setup>
defineProps({
    message: {
        type: String,
        default: 'Something went wrong!'
    },
    subMessage: {
        type: String,
        default: ''
    }
})
</script>


<template>
    <div class="flex flex-col items-center justify-center p-6 bg-red-100 rounded-md mt-4">
        <i class="pi pi-exclamation-triangle text-red-600 text-4xl mb-3"></i>
        <p class="text-red-700 text-lg font-semibold">
            {{ message }}
        </p>
        <p v-if="subMessage" class="text-red-500 text-sm mt-1">
            {{ subMessage }}
        </p>
    </div>
</template>
