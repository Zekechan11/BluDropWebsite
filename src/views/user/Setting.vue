<script setup>
import { ref } from "vue";
import UpdateProfile from "../../components/UpdateProfile.vue";
import ChangePassword from "../../components/ChangePassword.vue";

const user_data = JSON.parse(localStorage.getItem("user_data"));

const activeTab = ref("profileImage");

const setActiveTab = (tab) => {
  activeTab.value = tab;
};
</script>

<template>
  <Fluid>
    <div class="space mb-6">
      <h1 class="text-4xl font-semibold text-gray-700 flex items-center gap-3">
        <i class="pi pi-user text-blue-500 !text-4xl"></i>
        My Profile
      </h1>
    </div>

    <div class="flex justify-start mb-6 space-x-4">
      <button :class="[
        'px-6 py-2 rounded-full font-semibold transition-all duration-300',
        activeTab === 'profileImage'
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
      ]" @click="setActiveTab('profileImage')">
        Profile
      </button>
      <button :class="[
        'px-6 py-2 rounded-full font-semibold transition-all duration-300',
        activeTab === 'password'
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
      ]" @click="setActiveTab('password')">
        Password
      </button>
    </div>

    <!-- Tab Content -->
    <div class="bg-white rounded-xl shadow-lg p-6 transition-all duration-300">
      <UpdateProfile v-if="activeTab === 'profileImage'" :user="user_data" type="customer" />
      <ChangePassword v-if="activeTab === 'password'" :user="user_data" type="customer" />
    </div>
  </Fluid>
</template>
