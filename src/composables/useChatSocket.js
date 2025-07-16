import { ref } from 'vue';
import { WATER_CHAT_API } from '../config';

export function useChatSocket(userData, onMessageCallback) {
    const socket = ref(null);
    const messages = ref([]);
    const isConnected = ref(false);

    function connectWebSocket() {
        socket.value = new WebSocket(`${WATER_CHAT_API}/chat`);

        socket.value.onopen = () => {
            console.log('WebSocket connected');
            isConnected.value = true;
        };

        socket.value.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const message = {
                content: data.content,
                sender_id: data.sender_id,
                timestamp: new Date(data.timestamp).toLocaleTimeString(),
            };

            messages.value.push(message);

            if (typeof onMessageCallback === 'function') {
                onMessageCallback(message);
            }
        };

        socket.value.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        socket.value.onclose = () => {
            console.log('WebSocket closed, reconnecting...');
            isConnected.value = false;
            setTimeout(connectWebSocket, 1000);
        };
    }

    function sendMessage(customer, content) {
        if (!socket.value || socket.value.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket not ready. Message not sent.');
            return;
        }

        const trimmed = content.trim();
        if (trimmed === '') return;

        const msg = {
            sender_id: userData.uid.toString(),
            area_id: userData.area_id,
            customer,
            content: trimmed,
        };

        socket.value.send(JSON.stringify(msg));
    }

    function closeWebSocket() {
        if (socket.value) {
            socket.value.close();
        }
    }

    return {
        socket,
        messages,
        isConnected,
        connectWebSocket,
        closeWebSocket,
        sendMessage,
    };
}
