<script setup>
import { useLayout } from "@/layout/composables/layout";
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { attempt } from "../../service/attempt";
import { WATER_API } from "../../config";
import axios from "axios";
import NotificationBell from "../../components/NotificationBell.vue"

const { onMenuToggle } = useLayout();
const topbarMenuActive = ref(false);
const chatNotification = ref([]);
const router = useRouter();

const userData = JSON.parse(localStorage.getItem("user_data"));

const getChatNotif = async () => {
  const [chatNotifResponse, chatNotifError] = await attempt(
    axios.get(`${WATER_API}/chat/list/agent/${userData.area_id}`)
  );
  if (chatNotifError) {
    console.error("Error fecthing chat notif", chatNotifError);
  } else {
    chatNotification.value = chatNotifResponse.data.messages;
  }
};

const onSettingsClick = () => {
  topbarMenuActive.value = false;
  router.push("/agent/settings");
};

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
      <div class="layout-config-menu"></div>

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
          <NotificationBell :chatNotification="chatNotification" />

          <button type="button" class="layout-topbar-action" @click="onSettingsClick">
            <i class="pi pi-user" v-tooltip.bottom="'Profile'"></i>
            <span>Profile</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.2);
    opacity: 0.6;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
