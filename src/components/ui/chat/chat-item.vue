<script setup>
defineProps({
    conversation: Object,
    isSelected: Boolean,
});
const emit = defineEmits(['select']);

const truncateMessage = (message, maxLength = 40) => {
    return message.length > maxLength ? message.slice(0, maxLength) + '...' : message;
};
</script>

<template>
    <div @click="$emit('select', conversation)" :class="[
        'p-4 border-b cursor-pointer transition-colors',
        isSelected ? 'bg-blue-200' : 'hover:bg-gray-200',
    ]">
        <div class="flex items-center gap-4">
            <img :src="conversation.img" alt="Profile image" class="w-10 h-10 rounded-full bg-gray-300" />
            <div class="flex-grow min-w-0">
                <p class="font-semibold truncate">{{ conversation.name }}</p>
                <p class="text-sm text-gray-500 truncate">{{ truncateMessage(conversation.lastMessage) }}</p>
            </div>
            <div class="text-sm text-gray-500 flex-shrink-0">{{ conversation.time }}</div>
        </div>
    </div>
</template>
