import { ref, computed } from "vue";
import { WATER_CHAT_API } from "../config";

export const useChatSocket = (userData, onMessageCallback) => {
  const socket = ref(null);
  const messages = ref([]);
  const isConnected = ref(false);
  const reconnectTimeout = ref(null);
  const currentConversationId = ref(null);

  const fullName = computed(() => {
    return `${userData.firstname} ${userData.lastname}`;
  });

  const connectWebSocket = async (conversationId) => {
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      return;
    }

    currentConversationId.value = conversationId;

    socket.value = new WebSocket(
      `${WATER_CHAT_API}/chat?convo_id=${conversationId}`
    );

    socket.value.onopen = () => {
      console.log("WebSocket connected");
      isConnected.value = true;
    };

    socket.value.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const message = {
        content: data.content,
        sender_id: data.sender_id,
        sender_name: data.sender_name,
        role: data.role,
        timestamp: new Date(data.timestamp).toLocaleTimeString(),
      };

      messages.value.push(message);

      if (typeof onMessageCallback === "function") {
        onMessageCallback(message);
      }
    };

    socket.value.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.value.onclose = () => {
      console.log("WebSocket closed, attempting reconnect...");
      isConnected.value = false;

      if (reconnectTimeout.value) {
        clearTimeout(reconnectTimeout.value);
      }

      reconnectTimeout.value = setTimeout(() => {
        connectWebSocket(currentConversationId.value);
      }, 1000);
    };
  };

  const sendMessage = (content) => {
    if (!socket.value || socket.value.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not ready. Message not sent.");
      return;
    }

    const trimmed = content.trim();
    if (trimmed === "") return;

    const msg = {
      sender_id: userData.uid,
      sender_name: fullName.value,
      role: userData.role,
      content: trimmed,
    };

    socket.value.send(JSON.stringify(msg));
  };

  const closeWebSocket = () => {
    if (socket.value) {
      socket.value.close();
      socket.value = null;
      isConnected.value = false;
      if (reconnectTimeout.value) {
        clearTimeout(reconnectTimeout.value);
        reconnectTimeout.value = null;
      }
    }
  };

  return {
    socket,
    messages,
    isConnected,
    connectWebSocket,
    closeWebSocket,
    sendMessage,
  };
};
