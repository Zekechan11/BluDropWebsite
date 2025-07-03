<script setup>
import { ref } from "vue";

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
      <!-- Tabs -->
      <div class="flex mb-4">
        <button
          :class="[
            'flex-1 py-2 text-center',
            activeTab === 'profileImage' ? 'bg-blue-600' : 'bg-blue-400',
          ]"
          @click="setActiveTab('profileImage')"
          style="color: white; font-weight: bold; border-radius: 10px"
        >
          Admin Details
        </button>
        <div class="mx-2"></div>
        <!-- Add space here -->
        <button
          :class="[
            'flex-1 py-2 text-center',
            activeTab === 'userDetails' ? 'bg-blue-600' : 'bg-blue-400',
          ]"
          @click="setActiveTab('userDetails')"
          style="color: white; font-weight: bold; border-radius: 10px"
        >
          Account Security
        </button>
      </div>

      <!-- Tab Content -->
      <div
        v-if="activeTab === 'profileImage'"
        style="
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);border-radius: 10px; /* Add your box shadow here */
        "
      >
        <div class="card flex gap-8">

          <div class="flex flex-col gap-4 flex-1">
            <!-- Container for the inputs -->
            <div class="flex flex-col gap-2">
              <label for="name1">First Name</label>
              <InputText id="name1" type="text" :value="userData.firstname"/>
            </div>
            <div class="flex flex-col gap-2">
              <label for="name2">Last Name</label>
              <InputText id="name2" type="text" :value="userData.lastname"/>
            </div>
            <div class="flex flex-col gap-2">
              <label for="email1">Email</label>
              <InputText id="email1" type="text" :value="userData.email"/>
            </div>
            <button
              class="flex-1 py-2 text-center"
              style="
                color: darkblue;
                background-color: #007fff;
                font-weight: bold;
                color: white;
                border-radius: 10px;
              "
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="activeTab === 'userDetails'"
        style="
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);border-radius: 10px; /* Add your box shadow here */
        "
      >
        <div class="card flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <label for="oldPassword">Old Password</label>
            <InputText id="oldPassword" type="text" />
          </div>
          <div class="flex flex-col gap-2">
            <label for="newPassword">New Password</label>
            <InputText id="newPassword" type="text" />
          </div>
          <div class="flex flex-col gap-2">
            <label for="confirmPassword">Confirm New Password</label>
            <InputText id="confirmPassword" type="text" />
          </div>
          <button
            class="flex-1 py-2 text-center"
            style="
              color: darkblue;
              background-color: #007fff;
              font-weight: bold;
              color: white;
              border-radius: 10px;
            "
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </Fluid>
</template>
