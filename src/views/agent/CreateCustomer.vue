<script setup>
import { onMounted, ref } from 'vue';
import QrcodeVue from 'qrcode.vue';
import { WATER_API } from '../../config';
import { useToast } from "primevue/usetoast";
import axios from "axios";

// Define reactive variables
const firstName = ref('');
const lastName = ref('');
const username = ref('');
const email = ref('');
const userType = ref('');
const password = ref('');
const confirmPassword = ref('');
const passwordVisible = ref(false);
const confirmPasswordVisible = ref(false);
const areas = ref([]);
const area = ref([]);

const toast = useToast();

// Function to toggle password visibility
const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value;
};

const togglePasswordVisibility2 = () => {
  confirmPasswordVisible.value = !confirmPasswordVisible.value;
};

const user_data = JSON.parse(localStorage.getItem("user_data"));

const fetchAreas = async () => {
  try {
    const response = await axios.get(`${WATER_API}/area`);
    const data = response.data;

    areas.value = data.map((area) => {
      return {
        ...area,
      };
    });
  } catch (error) {
    console.error("Error fetching areas:", error);
  }
};

// Combined form submission
const handleFormSubmit = async () => {

  if (!firstName.value || !lastName.value || !username.value || !email.value || !area.value || !password.value || !confirmPassword.value) {
    toast.add({ severity: 'error', summary: 'Error', detail: "All fields are required!", life: 3000 });
    return;
  }

  if (password.value !== confirmPassword.value) {
    toast.add({ severity: 'error', summary: 'Error', detail: "Passwords do not match!", life: 3000 });
    return;
  }

  // Save user data with role set to 'customer'
  const userData = {
    firstname: firstName.value,
    lastname: lastName.value,
    username: username.value,
    email: email.value,
    area_id: parseInt(user_data.area_id),
    // area_id: area.value.area_name,
    type: userType.value.label,
    password: password.value, // Password can be stored, but consider hashing for security
  };

  try {
    const response = await fetch(`${WATER_API}/v2/api/create_client`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error creating customer:", errorData);
      alert("Failed to create customer: " + errorData.error);
    } else {
      const responseData = await response.json();
      console.log("Customer created successfully:", responseData);
      // alert("Customer created successfully: " + JSON.stringify(responseData));

      toast.add({
        severity: "success",
        summary: "Successful",
        detail: "User added sucker",
        life: 10000,
      });

      firstName.value = "";
      lastName.value = "";
      username.value = "";
      email.value = "";
      // area.value = "";
      userType.value = "";
      password.value = "";
      confirmPassword.value = "";

      // Optionally, redirect to login or dashboard after account creation
      // router.push('/login'); // Uncomment this if you want to redirect to login page
    }
  } catch (error) {
    console.error("Fetch error:", error);
    alert("An error occurred: " + error.message);
  }
};

onMounted(() => {
  fetchAreas();
});
</script>
<template>
  <div class="space mb-6">
    <h1 class="text-4xl font-semibold text-gray-700 flex items-center gap-3">
      <i class="pi pi-user text-blue-500 !text-4xl"></i>
      Create Account
    </h1>
  </div>

  <div class="card p-8 shadow-xl bg-white rounded-xl space-y-6">
    <form @submit.prevent="handleFormSubmit" class="space-y-5">
      <!-- Header -->
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-700 mb-1">Create Account</h2>
        <p class="text-sm text-gray-400">Generate QR after filling the form</p>
      </div>

      <!-- First Name -->
      <div>
        <label for="firstName" class="block text-sm font-semibold text-gray-600 mb-1">First Name</label>
        <InputText v-model="firstName" id="firstName" placeholder="Enter Firstname" class="w-full" required />
      </div>

      <!-- Last Name -->
      <div>
        <label for="lastName" class="block text-sm font-semibold text-gray-600 mb-1">Last Name</label>
        <InputText v-model="lastName" id="lastName" placeholder="Enter Lastname" class="w-full" required />
      </div>

      <!-- Email -->
      <div>
        <label for="email" class="block text-sm font-semibold text-gray-600 mb-1">Email</label>
        <InputText v-model="email" id="email" type="email" placeholder="Enter Valid Email" class="w-full" required />
      </div>

      <!-- Password -->
      <div class="relative">
        <label for="password" class="block text-sm font-semibold text-gray-600 mb-1">Password</label>
        <InputText :type="passwordVisible ? 'text' : 'password'" v-model="password" id="password"
          placeholder="Enter Password" class="w-full pr-10" required />
        <i :class="passwordVisible ? 'pi pi-eye-slash' : 'pi pi-eye'"
          class="absolute right-3 top-[42px] text-gray-500 cursor-pointer" @click="togglePasswordVisibility" />
      </div>

      <!-- Confirm Password -->
      <div class="relative">
        <label for="confirmPassword" class="block text-sm font-semibold text-gray-600 mb-1">Confirm Password</label>
        <InputText :type="confirmPasswordVisible ? 'text' : 'password'" v-model="confirmPassword" id="confirmPassword"
          placeholder="Confirm Password" class="w-full pr-10" required />
        <i :class="confirmPasswordVisible ? 'pi pi-eye-slash' : 'pi pi-eye'"
          class="absolute right-3 top-[42px] text-gray-500 cursor-pointer" @click="togglePasswordVisibility2" />
      </div>

      <!-- User Type -->
      <div>
        <label for="userType" class="block text-sm font-semibold text-gray-600 mb-1">User Type</label>
        <Select v-model="userType" id="userType"
          :options="[{ label: 'Dealer', value: 'Dealer' }, { label: 'Regular', value: 'Regular' }]" optionLabel="label"
          placeholder="Select a Type" class="w-full" required />
        <small v-if="submitted && !userType" class="text-red-500">User type is required.</small>
      </div>

      <!-- Username -->
      <div>
        <label for="username" class="block text-sm font-semibold text-gray-600 mb-1">Username</label>
        <InputText v-model="username" id="username" placeholder="Username" class="w-full" required />
      </div>

      <!-- QR Code -->
      <div v-if="username" class="flex justify-center mt-4">
        <qrcode-vue :value="username" :size="180" level="H" />
      </div>

      <!-- Submit -->
      <div>
        <button type="submit"
          class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition duration-200">
          <i class="pi pi-qrcode mr-2"></i>
          Create Account
        </button>
      </div>
    </form>
  </div>
</template>
