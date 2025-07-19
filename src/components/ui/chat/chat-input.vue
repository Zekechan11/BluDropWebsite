<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:modelValue', 'send']);
const message = ref(props.modelValue);

watch(() => props.modelValue, val => {
    message.value = val;
});

watch(message, val => {
    emit('update:modelValue', val);
});

const sendMessage = () => {
    const trimmed = message.value.trim();
    if (trimmed) {
        emit('send', trimmed);
        message.value = '';
    }
}
</script>

<template>
    <div class="p-4 border-t border-gray-200 flex items-center gap-4 flex-shrink-0">
        <InputText v-model="message" placeholder="Type a message" class="flex-grow" @keyup.enter="sendMessage" />
        <Button label="Send" @click="sendMessage" :disabled="message.trim() === ''"
            class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            severity="primary" />
    </div>
</template>
