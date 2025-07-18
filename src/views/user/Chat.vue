<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { WATER_API, WATER_CHAT_API } from '../../config';
import axios from 'axios';
import { attempt } from "../../service/attempt";

const messages = ref([]);
const newMessage = ref('');
const agentName = ref();
const conversationId = ref('');

const userData = JSON.parse(localStorage.getItem("user_data"));

const fullName = computed(() => {
    return `${userData.firstname} ${userData.lastname}`;
});

let socket = null;

function connectWebSocket() {
    socket = new WebSocket(`${WATER_CHAT_API}/chat?convo_id=${conversationId.value}`);

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

function sendMessage() {
    if (newMessage.value.trim() !== '' && socket) {
        const msg = {
            sender_id: userData.uid,
            sender_name: fullName.value,
            content: newMessage.value,
        };

        socket.send(JSON.stringify(msg));
        newMessage.value = '';
    }
};

const getAgent = async () => {
    const [res, err] = await attempt(
        axios.get(`${WATER_API}/v2/api/agent/assigned/${userData.area_id}`)
    );
    if (err) {
        console.error("Error fetching schedule:", err);
    }
    agentName.value = res.data.data;
};

const getMessages = async () => {
    const [res, err] = await attempt(
        axios.get(`${WATER_API}/chat/client/${userData.uid}/messages`)
    );
    if (err) {
        throw new Error('Failed to fetch messages');
    } else {
        conversationId.value = res.data.convo_id;
        messages.value = res.data.messages.map((msg) => ({
            content: msg.content,
            sender_id: msg.sender_id,
            sender_name: msg.sender_name,
            timestamp: new Date(msg.timestamp).toLocaleTimeString(),
        }));
    }
};


onMounted(() => {
    getMessages();
    connectWebSocket();
    getAgent();
});

onUnmounted(() => {
    if (socket) {
        socket.close();
    }
});
</script>

<template>
  <div class="flex flex-col md:flex-row gap-8">
    <div class="md:w-full flex flex-col h-[88vh] border border-gray-200 rounded-xl shadow-lg bg-white overflow-hidden">
      <div class="bg-blue-600 text-white font-semibold text-xl p-4 rounded-t-xl shadow-sm">
        <i class="pi pi-user pr-2 !font-semibold"/>{{ agentName || 'Agent' }}
      </div>
      <div class="flex-grow p-6 overflow-y-auto space-y-4 bg-gray-50">
        <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-gray-500">
          <i class="pi pi-comment h-16 w-16 !text-5xl"></i>
          <p class="text-center text-lg">No messages yet</p>
          <p class="text-sm text-center">Start the conversation below </p>
        </div>

        <div v-else v-for="(msg, index) in messages" :key="index" class="flex flex-col space-y-1">
          <div v-if="msg.sender_id === userData.uid"
            class="self-end bg-blue-500 text-white p-3 rounded-2xl max-w-xs shadow-md">
            <p class="text-sm font-semibold">{{ fullName }}</p>
            <p class="text-sm">{{ msg.content }}</p>
            <span class="text-xs text-white/70 text-right block mt-1">{{ msg.timestamp }}</span>
          </div>

          <div v-else class="self-start bg-white border border-gray-300 p-3 rounded-2xl max-w-xs shadow-sm">
            <p class="text-sm font-semibold text-gray-800">{{ msg.sender_name }}</p>
            <p class="text-sm text-gray-700">{{ msg.content }}</p>
            <span class="text-xs text-gray-500 text-right block mt-1">{{ msg.timestamp }}</span>
          </div>
        </div>
      </div>

      <div class="p-4 border-t border-gray-200 flex items-center gap-4 bg-white">
        <InputText v-model="newMessage" placeholder="Type a message…" class="flex-grow rounded-lg border-gray-300" />
        <Button label="Send" @click="sendMessage" :disabled="newMessage === ''"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-md transition duration-200" />
      </div>
    </div>
  </div>
</template>
