<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import axios from 'axios';
import { WATER_API } from '../../config';
import { attempt } from "../../service/attempt";
import { ChatContainer } from '../../components/ui/chat';
import ConversationList from '../../components/ConversationList.vue'
import { useChatSocket } from '../../composables/useChatSocket';

const newMessage = ref('');
const selectedConversation = ref(null);
const searchQuery = ref('');
const showMobileChat = ref(false);
const conversations = ref([]);

const userData = JSON.parse(localStorage.getItem("user_data"));


const {
  socket,
  messages,
  connectWebSocket,
  closeWebSocket,
  sendMessage,
} = useChatSocket(userData, (msg) => {
  console.log('Incoming message:', msg);
});

const getConversations = async () => {
    const [res, err] = await attempt(
        axios.get(`${WATER_API}/chat/conversation`)
    );
    if (err) {
        throw new Error('Failed to fetch convo');
    }
    conversations.value = res.data.conversations.map((msg) => ({
        convoId: msg.conversation_id,
        fullname: msg.fullname,
        lastMessage: msg.content,
        role: msg.role,
        areaName: msg.area_name,
        timestamp: new Date(msg.timestamp).toLocaleTimeString(),
    }));
};

const selectConversation = async (conversation) => {
    if (socket.value) {
        closeWebSocket();
    }
    connectWebSocket(conversation.convoId);
    selectedConversation.value = conversation;
    showMobileChat.value = true;

    messages.value = [];

    const [res, err] = await attempt(
        axios.get(`${WATER_API}/chat/${conversation.convoId}/messages`)
    );
    if (err) {
        throw new Error('Failed to fetch messages');
    } else {
        messages.value = res.data.messages.length > 0
            ? res.data.messages.map((msg) => ({
                content: msg.content,
                sender_id: msg.sender_id,
                sender_name: msg.sender_name,
                role: msg.role,
                timestamp: new Date(msg.timestamp).toLocaleTimeString(),
            }))
            : [];
    }
};

const handleSend = () => {
    sendMessage(newMessage.value);
    newMessage.value = '';
};

function goBackToList() {
    showMobileChat.value = false;
    selectedConversation.value = null;
};

function clearSearch() {
  searchQuery.value = '';
};

const handleRefresh = () => {
    getConversations();
};

const filteredConversations = computed(() => {
    console.log('Filter running:', searchQuery.value, conversations.value.length);
    return conversations.value.filter((conversation) => {
        const name = conversation.name ?? '';
        return name.toLowerCase().includes(searchQuery.value.toLowerCase());
    });
});

onMounted(() => {
    getConversations();
});
onUnmounted(() => {
    closeWebSocket();
});
</script>

<template>
    <div class="flex flex-col md:flex-row gap-4 md:gap-8 h-full">
        <ChatContainer :showMobileChat="showMobileChat">
            <ChatSearch v-model="searchQuery" @update:refresh="handleRefresh" />
            <ConversationList :conversations="conversations" :filteredConversations="filteredConversations"
                :searchQuery="searchQuery" :selectedConversation="selectedConversation"
                @selectConversation="selectConversation" @clearSearch="clearSearch" />
        </ChatContainer>

        <ChatContainer v-if="selectedConversation" :showMobileChat="showMobileChat"
            :selectedConversation="selectedConversation" :conversationMode="false" @goBack="goBackToList">

            <div class="flex-grow p-4 overflow-y-auto space-y-4 min-h-0">
                <div v-if="!messages.length || !messages.some(msg => msg.content)"
                    class="flex flex-col items-center justify-center h-full text-gray-500">
                    <ChatEmpty icon="pi-comments" title="No messages yet"
                        subtitle="Start the conversation by sending a message below" :showButton="false" />
                </div>
                <ChatMessages :messages="messages" :userData="userData" :selectedConversation="selectedConversation" />
            </div>
            <ChatInput v-model="newMessage" @send="handleSend" />
        </ChatContainer>

        <div v-if="!selectedConversation"
            class="hidden md:flex w-full items-center justify-center border border-gray-300 rounded-lg shadow-md bg-gray-50">
            <ChatEmpty icon="pi-comments" title="Select a conversation to start chatting"
                subtitle="Choose a conversation from the list to view messages" :showButton="false" />
        </div>
    </div>
</template>
