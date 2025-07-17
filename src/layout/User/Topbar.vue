<script setup>
import { useLayout } from "@/layout/composables/layout";
import { useRouter } from "vue-router";
import { ref, computed } from "vue";

const { onMenuToggle } = useLayout();
const topbarMenuActive = ref(false);
const notificationsVisible = ref(false);
const router = useRouter();

const onSettingsClick = () => {
  topbarMenuActive.value = false;
  router.push("/user/settings"); a
};

const notifications = ref([
  { id: 1, message: "Payables #124: ₱200. Due Date: 2024-10-10. Status: Due", addLine: true },
  { id: 2, message: "Payables #125: ₱200. Due Date: 2024-10-15. Status: Due", addLine: true },
  { id: 3, message: "Payables #126: ₱300. Due Date: 2024-10-20. Status: Due", addLine: true },
]);

const notificationsCount = computed(() => notifications.value.length);

const toggleNotifications = () => {
  notificationsVisible.value = !notificationsVisible.value;
};
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

          <div class="relative">
            <button class="layout-topbar-action relative flex items-center gap-2 text-gray-700"
              @click="toggleNotifications">
              <i class="pi pi-bell text-xl" v-tooltip.bottom="'Notifications'"></i>
              <span class="text-sm font-medium">Notifications</span>
            </button>
            <span v-if="notificationsCount > 0"
              class="absolute -top-1 -right-1 bg-red-500 text-white text-[0.7rem] px-1.5 py-0.5 rounded-full animate-pulse">
              {{ notificationsCount }}
            </span>

            <div v-if="notificationsVisible"
              class="absolute right-0 top-[120%] w-72 bg-white border border-gray-200 rounded-md shadow-xl p-4 z-50">
              <div class="border-b border-gray-100 pb-2 mb-3">
                <h4 class="text-base font-semibold text-gray-800 m-0">Notifications</h4>
              </div>

              <ul class="space-y-2">
                <li v-if="notifications.length === 0"
                  class="text-center text-gray-400 text-sm py-4 flex flex-col items-center">
                  <i class="pi pi-inbox text-xl mb-1"></i>
                  No due payables
                </li>
                <li v-for="notification in notifications" :key="notification.id"
                  class="border-b border-gray-100 pb-2 text-sm text-gray-700">
                  <span>{{ notification.message }}</span>
                  <span v-if="notification.content?.length" class="block text-xs text-gray-500 mt-1">
                    {{ notification.content }}
                  </span>
                </li>
              </ul>
            </div>
          </div>

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
