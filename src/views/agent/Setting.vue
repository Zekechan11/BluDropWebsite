<script setup>
import { ref } from "vue";

const dropdownItem = ref(null);

const profileImage = ref(null);
const imagePreviewUrl = ref("https://via.placeholder.com/150"); // Default profile image URL

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Create a URL for the selected file and set it to imagePreviewUrl
    imagePreviewUrl.value = URL.createObjectURL(file);
    profileImage.value = file;
  }
};

// Tab management
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
          Profile Image
        </button>
        <div class="mx-2"></div>
      </div>

      <!-- Tab Content -->
      <div
        v-if="activeTab === 'profileImage'"
        style="
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);border-radius: 10px; /* Add your box shadow here */
        "
      >
        <div class="card flex gap-8">
          <!-- Use flex for horizontal layout -->
          <div class="flex flex-col items-center">
            <!-- Container for the image -->
            <div class="relative">
              <img
                src=""
                alt=""
                class="w-32 h-32 object-cover rounded-full border border-gray-300"
                style="border: 2px solid #aed6f1; background-color: #d6eaf8"
              />
              <i
                class="pi pi-user absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-400 text-3xl"
                style="color: #aed6f1; font-size: 80px"
              ></i>
            </div>
            <div class="flex flex-col gap-2 mt-2 items-center">
              <!-- Image upload input -->
              <label for="profileImageUpload">Upload Profile Image</label>
              <input
                class="w-2/3"
                type="file"
                id="profileImageUpload"
                accept="image/*"
                @change="handleImageUpload"
                style="color: darkblue; background-color: #007fff; color: white"
              />
            </div>
          </div>

          <div class="flex flex-col gap-4 flex-1">
            <!-- Container for the inputs -->
            <div class="flex flex-col gap-2">
              <label for="name1">First Name</label>
              <InputText id="name1" type="text" />
            </div>
            <div class="flex flex-col gap-2">
              <label for="name2">Last Name</label>
              <InputText id="name2" type="text" />
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

     
    </div>
  </Fluid>
</template>
