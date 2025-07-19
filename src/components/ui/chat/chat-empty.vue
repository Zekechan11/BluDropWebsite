<script setup>
defineProps({
    icon: String,
    title: String,
    subtitle: String,
    buttonText: String,
    showButton: Boolean,
});
const emit = defineEmits(['buttonClick']);
</script>

<template>
    <div class="flex flex-col items-center justify-center h-full p-8 text-gray-500">
        <i :class="['pi', icon, '!text-6xl', 'mb-4', 'text-gray-400']"></i>
        <p class="text-lg font-medium mb-2">{{ title }}</p>
        <p class="text-sm text-center">{{ subtitle }}</p>
        <button v-if="showButton" @click="$emit('buttonClick')"
            class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            {{ buttonText }}
        </button>
    </div>
</template>

<!-- <div v-if="!selectedConversation"
            class="hidden md:flex w-full items-center justify-center border border-gray-300 rounded-lg shadow-md bg-gray-50">
            <div class="text-center text-gray-500">
                <i class="pi pi-comments w-16 h-16 mx-auto text-gray-400 !text-5xl" />
                <p class="text-lg font-medium">Select a conversation to start chatting</p>
                <p class="text-sm">Choose a conversation from the list to view messages</p>
            </div>
        </div> -->
