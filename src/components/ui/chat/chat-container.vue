<script setup>
import { computed } from 'vue';
import { getInitials as getInitialsUtil } from '../../../service/initials';

const props = defineProps({
    showMobileChat: Boolean,
    conversationMode: {
        type: Boolean,
        default: true
    },
    selectedConversation: {
        type: Object,
        default: () => ({})
    }
});

const emit = defineEmits(['goBack']);

const initials = computed(() => {
    return props.selectedConversation?.fullname
        ? getInitialsUtil(props.selectedConversation.fullname)
        : '';
});

const goBackToList = () => {
    emit('goBack');
}
</script>

<template>
    <div v-if="conversationMode" :class="[
        'w-full overflow-auto h-[88vh] md:w-1/2 flex flex-col border border-gray-300 rounded-lg shadow-md min-h-0',
        props.showMobileChat ? 'hidden md:flex' : 'flex'
    ]">
        <div class="bg-blue-500 text-white font-semibold text-xl p-4 rounded-t-lg flex-shrink-0">Chat</div>
        <slot />
    </div>

    <div v-else :class="[
        'w-full h-[88vh] flex flex-col border border-gray-300 rounded-lg shadow-md min-h-0',
        props.showMobileChat ? 'flex' : 'hidden md:flex'
    ]">
        <div class="bg-blue-500 text-white text-xl p-4 rounded-t-lg flex items-center flex-shrink-0">
            <button @click="goBackToList" class="md:hidden mr-3 text-white hover:text-gray-200 transition-colors">
                <i class="pi pi-chevron-left w-6 h-6" />
            </button>
            <div class="flex items-center">
                <div class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-300 text-gray-600">
                    <span v-if="props.selectedConversation?.fullname">
                        {{ initials }}
                    </span>
                    <i v-else class="pi pi-user"></i>
                </div>
                <span class="ml-2 truncate font-semibold">
                    {{ props.selectedConversation.fullname || 'No Name' }}
                </span>
            </div>
        </div>
        <slot />
    </div>
</template>
