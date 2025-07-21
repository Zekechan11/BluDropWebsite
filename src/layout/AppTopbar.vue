<script setup>
import { useLayout } from "@/layout/composables/layout";
import { useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { attempt } from "../service/attempt";
import { WATER_API } from "../config";
import NotificationBell from "../components/NotificationBell.vue"
import axios from "axios";

const { onMenuToggle } = useLayout();
const topbarMenuActive = ref(false);
const chatNotification = ref([]);
const router = useRouter();

const userData = JSON.parse(localStorage.getItem("user_data"));

const getChatNotif = async () => {
  const [chatNotifResponse, chatNotifError] = await attempt(
    axios.get(`${WATER_API}/chat/conversation`)
  );
  if (chatNotifError) {
    console.error("Error fecthing chat notif", chatNotifError);
  } else {
    chatNotification.value = chatNotifResponse.data.conversations;
  }
};

const onSettingsClick = () => {
  topbarMenuActive.value = false;
  router.push("/admin/settings"); a
};

const onViewAllMessagesClick = () => {
  topbarMenuActive.value = false;
  router.push("/admin/message"); a
};

const filteredNotifications = computed(() => {
    return chatNotification.value.filter(notification => {
        return notification.sender_id !== null && notification.sender_id !== 0 && notification.sender_id !== userData.uid;
    });
})

onMounted(() => {
  getChatNotif();
});

</script>

<template>
  <div class="layout-topbar shadow-md">
    <div class="layout-topbar-logo-container">
      <button class="layout-menu-button layout-topbar-action" @click="onMenuToggle">
        <i class="pi pi-bars"></i>
      </button>
      <router-link to="/" class="layout-topbar-logo">
        <img src="/demo/images/logo2.png" alt="" style="height: 30px; width: 150px" />
      </router-link>
    </div>

    <div class="layout-topbar-actions">
      <div class="layout-config-menu">
      </div>

      <button class="layout-topbar-menu-button layout-topbar-action" v-styleclass="{
        selector: '@next',
        enterFromClass: 'hidden',
        enterActiveClass: 'animate-scalein',
        leaveToClass: 'hidden',
        leaveActiveClass: 'animate-fadeout',
        hideOnOutsideClick: true,
      }">
        <i class="pi pi-ellipsis-v"></i>
      </button>

      <div class="layout-topbar-menu hidden lg:block">
        <div class="layout-topbar-menu-content">
          <NotificationBell :chatNotification="filteredNotifications" @update:viewAllMessages="onViewAllMessagesClick" />

          <button type="button" class="layout-topbar-action" @click="onSettingsClick">
            <i class="pi pi-user" v-tooltip.bottom="'Profile'"></i>
            <span class="font-semibold">Profile</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@media (max-width: 768px) {
  .notification-dropdown {
    min-width: 100%;
    left: 0;
    right: auto;
  }
}
</style>
