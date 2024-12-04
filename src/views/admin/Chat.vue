<script setup>
import { ref, onMounted, computed } from 'vue';

const messages = ref([]);
const newMessage = ref('');
const selectedConversation = ref(null);
const searchQuery = ref(''); // New reactive property for search query

const conversations = ref([
    { name: 'Ezekiel Angelo Pelayo', lastMessage: 'Okay sir', time: '1h', img: 'https://i.pravatar.cc/100?u=edison' },
    { name: 'Anton Retuya', lastMessage: 'You sent a photo', time: '1h', img: 'https://i.pravatar.cc/100?u=gojo' },
    { name: 'Jemar Diamante', lastMessage: '.', time: '1h', img: 'https://i.pravatar.cc/100?u=diamante' },
    { name: 'Karl Lawrenz Pino', lastMessage: 'sir', time: '3h', img: 'https://i.pravatar.cc/100?u=kakashi' },
    { name: 'Leonard Balabat', lastMessage: '.', time: '3h', img: 'https://i.pravatar.cc/100?u=gago' },
]);

const filteredConversations = computed(() => {
    if (!searchQuery.value) return conversations.value;
    return conversations.value.filter(conversation =>
        conversation.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

// Limit the length of last messages to 40 characters
const truncateMessage = (message, maxLength = 40) => {
    return message.length > maxLength ? message.slice(0, maxLength) + '...' : message;
};

function sendMessage() {
    if (newMessage.value.trim() !== '') {
        messages.value.push({
            content: newMessage.value,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString(),
        });
        newMessage.value = '';
    }
}

function selectConversation(conversation) {
    selectedConversation.value = conversation;
}

onMounted(() => {
    if (conversations.value.length > 0) {
        selectedConversation.value = conversations.value[0];
    }
});
</script>

<template>
    <div class="flex flex-col md:flex-row gap-8">
        <!-- Conversation List (Scrollable) -->
        <div class="md:w-1/2 flex flex-col h-[620px] border border-gray-300 rounded-lg shadow-md">
            <div class="bg-blue-500 text-white font-semibold text-xl p-4 rounded-t-lg">Chat</div>
            <div class="p-4 bg-white">
                <input
                    type="text"
                    v-model="searchQuery" 
                    placeholder="Search Messenger"
                    class="w-full p-2 rounded-lg border border-gray-300"
                />
            </div>
            <!-- Scrollable conversation list -->
            <div class="overflow-y-auto flex-grow max-h-[520px]">
                <div
                    v-for="(conversation, index) in filteredConversations"
                    :key="index"
                    @click="selectConversation(conversation)"
                    :class="['p-4 border-b cursor-pointer', 
                             selectedConversation === conversation ? 'bg-blue-200' : 'hover:bg-gray-200']"
                >
                    <div class="flex items-center gap-4">
                        <!-- Profile Image -->
                        <img :src="conversation.img" alt="Profile image" class="w-10 h-10 rounded-full bg-gray-300" />
                        <div>
                            <p class="font-semibold">{{ conversation.name }}</p>
                            <p class="text-sm text-gray-500">{{ truncateMessage(conversation.lastMessage) }}</p>
                        </div>
                        <div class="ml-auto text-sm text-gray-500">{{ conversation.time }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Chat Window - Only displayed if a conversation is selected -->
        <div v-if="selectedConversation" class="md:w-full flex flex-col h-[620px] border border-gray-300 rounded-lg shadow-md">
            <div class="bg-blue-500 text-white font-semibold text-xl p-4 rounded-t-lg">{{ selectedConversation.name }}</div>
            <div class="flex-grow p-4 overflow-y-auto space-y-4">
                <div v-for="(msg, index) in messages" :key="index" class="flex flex-col space-y-1">
                    <div v-if="msg.sender === 'user'" class="self-end bg-blue-500 text-white p-2 rounded-lg max-w-xs">
                        <p>{{ msg.content }}</p>
                        <span class="text-xs text-right block">{{ msg.timestamp }}</span>
                    </div>
                    <div v-else class="self-start bg-gray-300 p-2 rounded-lg max-w-xs">
                        <p>{{ msg.content }}</p>
                        <span class="text-xs text-right block">{{ msg.timestamp }}</span>
                    </div>
                </div>
            </div>

            <!-- Message Input -->
            <div class="p-4 border-t border-gray-200 flex items-center gap-4">
                <InputText v-model="newMessage" placeholder="Type a message" class="flex-grow" />
                <Button label="Send" @click="sendMessage" :disabled="newMessage === ''" class="bg-blue-500 text-white" />
            </div>
        </div>
    </div>
</template>

<style scoped>
h1 {
    color: #4A5568;
    margin-bottom: 1.5rem;
}
</style>
