<script setup>
import { ref } from "vue";
import UpdateProfile from '../../components/UpdateProfile.vue';
import ChangePassword from '../../components/ChangePassword.vue';

const userData = JSON.parse(localStorage.getItem("user_data"));

const activeTab = ref("profileImage");

const setActiveTab = (tab) => {
  activeTab.value = tab;
};
</script>


<template>
  <Fluid>
    <div class="space">
      <h1 class="text-4xl font-semibold mb-4" style="color: #899499">Profile</h1>
    </div>

    <div class="flex flex-col">
      <div class="flex mb-4">
        <button :class="[
          'flex-1 py-2 text-center',
          activeTab === 'profileImage' ? 'bg-blue-600' : 'bg-blue-400',
        ]" @click="setActiveTab('profileImage')" style="color: white; font-weight: bold; border-radius: 10px">
          Admin Details
        </button>
        <div class="mx-2"></div>
        <button :class="[
          'flex-1 py-2 text-center',
          activeTab === 'userDetails' ? 'bg-blue-600' : 'bg-blue-400',
        ]" @click="setActiveTab('userDetails')" style="color: white; font-weight: bold; border-radius: 10px">
          Account Security
        </button>
      </div>
      <div v-if="activeTab === 'profileImage'" style="box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); border-radius: 10px;">
        <UpdateProfile :user="userData" type="management"/>
      </div>
      <div v-if="activeTab === 'userDetails'" style="box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);border-radius: 10px;">
        <ChangePassword :user="userData" type="management"/>
      </div>

    </div>
  </Fluid>
</template>
