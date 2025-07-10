<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { WATER_API, WATER_CHAT_API } from '../../config';
import { ChatContainer } from '../../components/ui/chat';
import { chatServices } from '../../service/chat';

const messages = ref([]);
const newMessage = ref('');
const selectedConversation = ref(null);
const searchQuery = ref('');
const showMobileChat = ref(false);

const conversations = ref([]);

const userData = JSON.parse(localStorage.getItem("user_data"));

let socket = null;

function getConversations() {
    fetch(`${WATER_API}/chat/list/admin`)
        .then((res) => {
            if (!res.ok) {
                throw new Error('Failed to fetch convo');
            }
            return res.json();
        })
        .then((data) => {
            console.log(data);
            conversations.value = data.messages.map((msg) => ({
                name: msg.fullname,
                lastMessage: msg.content,
                img: `https://eu.ui-avatars.com/api/?name=${msg.fullname}`,
                cus: msg.customer,
                time: new Date(msg.timestamp).toLocaleTimeString(),
            }));
        })
        .catch((err) => {
            console.error('Error fetching convo:', err);
        });
};

function connectWebSocket() {
    socket = new WebSocket(`${WATER_CHAT_API}/chat`);

    socket.onopen = () => {
        console.log('WebSocket connected');
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        messages.value.push({
            content: data.content,
            sender_id: data.sender_id,
            timestamp: new Date(data.timestamp).toLocaleTimeString(),
        });
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
        console.log('WebSocket closed, reconnecting...');
        setTimeout(connectWebSocket, 1000);
    };
};

function selectConversation(conversation) {
    selectedConversation.value = conversation;
    showMobileChat.value = true;
    const conversationId = conversation.cus;

    fetch(`${WATER_API}/chat/customer/${conversationId}`)
        .then((res) => {
            if (!res.ok) {
                throw new Error('Failed to fetch messages');
            }
            return res.json();
        })
        .then((data) => {
            messages.value = data.messages.map((msg) => ({
                content: msg.content,
                sender_id: msg.sender_id,
                timestamp: new Date(msg.timestamp).toLocaleTimeString(),
            }));
        })
        .catch((err) => {
            console.error('Error fetching messages:', err);
        });
};

function goBackToList() {
    showMobileChat.value = false;
    selectedConversation.value = null;
};

function clearSearch() {
  searchQuery.value = '';
};

const filteredConversations = computed(() => {
    console.log('Filter running:', searchQuery.value, conversations.value.length);
    return conversations.value.filter((conversation) => {
        const name = conversation.name ?? '';
        return name.toLowerCase().includes(searchQuery.value.toLowerCase());
    });
});

// const truncateMessage = (message, maxLength = 40) => {
//     return message.length > maxLength ? message.slice(0, maxLength) + '...' : message;
// };

function sendMessage(customer) {
    if (newMessage.value.trim() !== '') {
        const msg = {
            sender_id: userData.uid.toString(),
            area_id: userData.area_id,
            customer: customer,
            content: newMessage.value,
        };
        socket.send(JSON.stringify(msg));
        newMessage.value = '';
    }
}

onMounted(async () => {
    conversations.value = await chatServices.getConversations(`${WATER_API}/chat/list/admin`)
    // getConversations();
    connectWebSocket();
});

onUnmounted(() => {
    if (socket) {
        socket.close();
    }
});
</script>

<template>
    <div class="flex flex-col md:flex-row gap-4 md:gap-8 h-full">
        <ChatContainer :showMobileChat="showMobileChat">
            <ChatSearch v-model="searchQuery"/>
            <ConversationList
                :conversations="conversations"
                :filteredConversations="filteredConversations"
                :searchQuery="searchQuery"
                :selectedConversation="selectedConversation"
                @selectConversation="selectConversation"
                @clearSearch="clearSearch"
            />
        </ChatContainer>

        <div v-if="selectedConversation" :class="[
            'w-full h-[88vh] flex flex-col border border-gray-300 rounded-lg shadow-md min-h-0',
            showMobileChat ? 'flex' : 'hidden md:flex'
        ]">
            <div class="bg-blue-500 text-white font-semibold text-xl p-4 rounded-t-lg flex items-center flex-shrink-0">
                <button @click="goBackToList" class="md:hidden mr-3 text-white hover:text-gray-200 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7">
                        </path>
                    </svg>
                </button>
                <span class="truncate">{{ selectedConversation.name }}</span>
            </div>

            <div class="flex-grow p-4 overflow-y-auto space-y-4 min-h-0">
                <div v-if="messages.length === 0"
                    class="flex flex-col items-center justify-center h-full text-gray-500">
                    <svg class="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z">
                        </path>
                    </svg>
                    <p class="text-lg font-medium mb-2">No messages yet</p>
                    <p class="text-sm text-center">Start the conversation by sending a message below</p>
                </div>

                <div v-else>
                    <div v-for="(msg, index) in messages" :key="index" class="flex flex-col space-y-1">
                        <div v-if="msg.sender_id === userData.uid.toString()"
                            class="self-end bg-blue-500 text-white p-3 rounded-lg max-w-xs break-words">
                            <p>{{ msg.content }}</p>
                            <span class="text-xs text-right block mt-1 opacity-75">{{ msg.timestamp }}</span>
                        </div>
                        <div v-else class="self-start bg-gray-300 p-3 rounded-lg max-w-xs break-words">
                            <p>{{ msg.content }}</p>
                            <span class="text-xs text-right block mt-1 opacity-75">{{ msg.timestamp }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="p-4 border-t border-gray-200 flex items-center gap-4 flex-shrink-0">
                <InputText v-model="newMessage" placeholder="Type a message" class="flex-grow"
                    @keyup.enter="sendMessage(selectedConversation.cus)" />
                <Button label="Send" @click="sendMessage(selectedConversation.cus)" :disabled="newMessage.trim() === ''"
                    class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    severity="primary" />
            </div>
        </div>

        <div v-if="!selectedConversation"
            class="hidden md:flex w-full items-center justify-center border border-gray-300 rounded-lg shadow-md bg-gray-50">
            <div class="text-center text-gray-500">
                <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z">
                    </path>
                </svg>
                <p class="text-lg font-medium">Select a conversation to start chatting</p>
                <p class="text-sm">Choose a conversation from the list to view messages</p>
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