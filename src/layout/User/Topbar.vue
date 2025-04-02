<script setup>
import { useLayout } from "@/layout/composables/layout";
import { useRouter } from "vue-router";
import { ref } from "vue";

const { onMenuToggle, toggleDarkMode, isDarkTheme } = useLayout();
const topbarMenuActive = ref(false);
const notificationsVisible = ref(false);
const router = useRouter();

const onSettingsClick = () => {
  topbarMenuActive.value = false;
  router.push("/user/settings");a
};

const notifications = ref([
  { id: 1, message: "Payables #124: ₱200. Due Date: 2024-10-10. Status: Due", addLine: true },
  { id: 2, message: "Payables #125: ₱200. Due Date: 2024-10-15. Status: Due", addLine: true },
  { id: 3, message: "Payables #126: ₱300. Due Date: 2024-10-20. Status: Due", addLine: true },
]);


const toggleNotifications = () => {
  notificationsVisible.value = !notificationsVisible.value;
};
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
            <span class="notification-badge">3</span>

            <div v-if="notificationsVisible" class="notification-dropdown">
              <div class="notification-dropdown-content">
                <h4 class="font-semibold">Notifications</h4>
                <ul>
                  <li
                    v-for="notification in notifications"
                    :key="notification.id"
                  >
                    {{ notification.message }}
                    <span v-if="notification.addLine" class="line"></span>
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
            <span class="font-semibold">Profile</span>
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
