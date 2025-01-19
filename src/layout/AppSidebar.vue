<script setup>
import { LogoutService } from "../service/logoutservice";
import AppMenu from './AppMenu.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

</script>

<template>
  <div class="layout-sidebar shadow-md">
    <AppMenu />
    <button type="button" class="logout-button" @click="LogoutService(router)">
      <i class="pi pi-sign-out"></i>
      <span>Logout</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.logout-button {
  position: absolute;
  bottom: 10px;
  left: 40px; // Move the button to the left
  display: flex; // Use flexbox for alignment
  align-items: center; // Center items vertically
  font-size: 16px;

  margin: 0;
  padding: 0;
  list-style-type: none;
  
  font-weight: 400;
  color: var(--text-color);
  margin: 1.75rem 0;
}

.logout-button i {
  margin-right: 8px; // Adjust the space between the icon and the text
}

</style>
