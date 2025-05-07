<script setup>
import { useLayout } from "@/layout/composables/layout";
import { useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { attempt } from "../../service/attempt";
import { WATER_API } from "../../config";
import axios from "axios";

const { onMenuToggle, toggleDarkMode, isDarkTheme } = useLayout();
const topbarMenuActive = ref(false);
const notificationsVisible = ref(false);
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


const toggleNotifications = () => {
  notificationsVisible.value = !notificationsVisible.value;
};

const notificationsCount = computed(() => chatNotification.value.length);

onMounted(() => {
  getChatNotif();
});
</script>

<template>
  <div class="layout-topbar shadow-md">
    <div class="layout-topbar-logo-container">
      <button
        class="layout-menu-button layout-topbar-action"
        @click="onMenuToggle"
      >
        <i class="pi pi-bars"></i>
      </button>
      <router-link to="/" class="layout-topbar-logo">
        <img
          src="/demo/images/logo2.png"
          alt=""
          style="height: 30px; width: 150px"
        />
      </router-link>
    </div>

    <div class="layout-topbar-actions">
      <div class="layout-config-menu">
        <!-- <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button> -->
      </div>

      <button
        class="layout-topbar-menu-button layout-topbar-action"
        v-styleclass="{
          selector: '@next',
          enterFromClass: 'hidden',
          enterActiveClass: 'animate-scalein',
          leaveToClass: 'hidden',
          leaveActiveClass: 'animate-fadeout',
          hideOnOutsideClick: true,
        }"
      >
        <i class="pi pi-ellipsis-v"></i>
      </button>

      <div class="layout-topbar-menu hidden lg:block">
        <div class="layout-topbar-menu-content">
          <div class="notification-container">
            <button
              type="button"
              class="layout-topbar-action"
              @click="toggleNotifications"
            >
              <i class="pi pi-bell"
              v-tooltip.bottom="'Notification'"></i>
              <span class="font-semibold">Notification</span>
            </button>
            <span class="notification-badge">{{ notificationsCount }}</span>

            <div v-if="notificationsVisible" class="notification-dropdown">
              <div class="notification-dropdown-content">
                <h4 class="font-semibold">Notifications</h4>
                <ul>
                  <li
                    v-for="notification in chatNotification"
                    :key="notification.message_id"
                  >
                    {{ notification.fullname }} message you
                    <span v-if="notification.content?.length > 0" class="line"></span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <button
            type="button"
            class="layout-topbar-action"
            @click="onSettingsClick"
          >
            <i class="pi pi-user"
            v-tooltip.bottom="'Profile'"></i>
            <span>Profile</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.notification-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 5px;
  background: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 10px 0;
  min-width: 200px; /* Adjust for wider screens */
}

.notification-dropdown::before {
  content: "";
  position: absolute;
  top: -5px;
  right: 10px;
  border-width: 5px;
  border-style: solid;
  border-color: transparent transparent white transparent;
}

.notification-dropdown-content {
  padding: 10px;
}

.notification-dropdown h4 {
  margin: 0 0 10px;
}

.notification-dropdown ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.notification-dropdown li {
  padding: 5px 10px; /* Add padding for touch targets */
}

.line {
  display: block;
  width: 100%;
  height: 1px; /* Line thickness */
  background-color: #ccc; /* Line color */
  margin: 5px 0; /* Spacing around the line */
}

/* Responsive Styles */
@media (max-width: 768px) {
  .notification-dropdown {
    min-width: 100%; /* Full width on smaller screens */
    left: 0; /* Align it to the left */
    right: auto; /* Remove right alignment */
  }

  .notification-dropdown::before {
    right: calc(50% - 10px); /* Center the arrow */
  }
}
</style>
