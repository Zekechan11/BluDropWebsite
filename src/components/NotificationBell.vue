<script setup>
import { ref, computed, defineProps, defineEmits, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
    chatNotification: {
        type: Array,
        default: () => []
    },
    viewAllMessages: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:viewAllMessages']);

const notificationsVisible = ref(false);
const notificationsDropdownRef = ref(null);

const toggleNotifications = () => {
    notificationsVisible.value = !notificationsVisible.value
};

const closeNotificationsOnClickOutside = (event) => {
    if (notificationsDropdownRef.value && !notificationsDropdownRef.value.contains(event.target) && !event.target.closest('button')) {
        notificationsVisible.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', closeNotificationsOnClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', closeNotificationsOnClickOutside);
});

const notificationsCount = computed(() => props.chatNotification.length);

</script>

<template>
    <div class="relative">
        <button class="layout-topbar-action relative flex items-center gap-2 text-gray-700"
            @click="toggleNotifications">
            <i class="pi pi-bell text-xl" v-tooltip.bottom="'Notifications'"></i>
            <span class="text-sm font-medium">Notifications</span>
        </button>
        <span v-if="notificationsCount > 0"
            class="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[0.7rem] px-1.5 py-0.5 rounded-full animate-pulse">
            {{ notificationsCount }}
        </span>

        <div v-if="notificationsVisible"
            ref="notificationsDropdownRef"
            class="absolute right-0 top-[120%] w-96 bg-white border border-gray-200 rounded-md shadow-xl p-4 z-50">
            <div class="border-b border-gray-100 pb-2 mb-3">
                <h4 class="text-base font-semibold text-gray-800 m-0">Notifications</h4>
            </div>

            <ul class="space-y-2">
                <li v-if="props.chatNotification.length === 0"
                    class="text-center text-gray-400 text-sm py-4 flex flex-col items-center">
                    <i class="pi pi-inbox text-xl mb-1"></i>
                    No new messages
                </li>
                <li v-for="notification in props.chatNotification" :key="notification.message_id"
                    class="border-b border-gray-100 pb-2 text-sm text-gray-700">
                    <span><i class="pi pi-comments pr-2"/><strong>{{ notification.fullname }}</strong> messaged you</span>
                    <span v-if="notification.content?.length" class="block text-xs text-gray-500 mt-1 truncate">
                        {{ notification.content }}
                    </span>
                </li>
            </ul>
            <div class="mt-2 text-center">
                <button 
                    class="px-4 py-2 bg-blue-500 text-white rounded-full text-xs hover:bg-blue-600 transition-colors duration-200"
                    @click="emit('update:viewAllMessages', true)">View all messages</button>
            </div>
        </div>
    </div>
</template>
