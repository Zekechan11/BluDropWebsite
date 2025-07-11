const getConversations = async (apiUrl) => {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch conversations');
        }

        const data = await response.json();

        return data.messages.map((msg) => ({
            name: msg.fullname,
            lastMessage: msg.content,
            img: `https://eu.ui-avatars.com/api/?name=${encodeURIComponent(msg.fullname)}`,
            cus: msg.customer,
            time: new Date(msg.timestamp).toLocaleTimeString(),
        }));
    } catch (error) {
        console.error('Error in getConversations:', error);
        throw error;
    }
}

export const chatServices = {
    getConversations
}
