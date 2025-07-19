<script setup>
import { computed } from 'vue';
import { getInitials as getInitialsUtil } from '../../../service/initials';

const props = defineProps({
    messages: {
        type: Array,
        required: true
    },
    userData: {
        type: Object,
        required: true
    },
    selectedConversation: {
        type: Object,
        required: true
    }
});

const initials = computed(() => {
    return props.selectedConversation?.fullname
        ? getInitialsUtil(props.selectedConversation.fullname)
        : '';
});
</script>

<template>
    <div>
        <div v-for="(msg, index) in props.messages" :key="index" class="flex flex-col space-y-1">
            <div v-if="msg.sender_id === props.userData.uid" class="self-end pb-4">
                <div class="bg-blue-500 text-white p-3 ml-3 rounded-lg max-w-xs break-words">
                    <span>{{ msg.content }}</span>
                    <span class="text-xs text-right block mt-1 opacity-75">{{ msg.timestamp }}</span>
                </div>
            </div>
            <div v-else class="flex items-center pb-4">
                <div class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-300 text-gray-600">
                    <span v-if="props.selectedConversation.fullname">{{ initials }}</span>
                    <i v-else class="pi pi-user"></i>
                </div>
                <div class="self-start bg-gray-300 p-3 ml-3 rounded-lg max-w-xs break-words">
                    <span>{{ msg.content }}</span>
                    <span class="text-xs text-right block mt-1 opacity-75">{{ msg.timestamp }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
