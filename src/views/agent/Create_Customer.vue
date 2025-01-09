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
    alert('All fields are required!');
    return;
  }

  if (password.value !== confirmPassword.value) {
    alert('Passwords do not match!');
    return;
  }

  // Save user data with role set to 'customer'
  const userData = {
    firstname: firstName.value,
    lastname: lastName.value,
    username: username.value,
    email: email.value,
    area_id: area.value.area_name,
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
      area.value = "";
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
  <div class="space">
    <h1 class="text-2xl md:text-4xl font-bold mb-6 text-gray-500">Create Account</h1>
  </div>

  <div class="card p-8 shadow-lg">
    <form @submit.prevent="handleFormSubmit">
      <!-- First Name -->
      <div class="mb-4">
        <label for="firstName" class="block text-gray-600 font-bold mb-2">First Name</label>
        <input type="text" id="firstName" v-model="firstName"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          placeholder="Enter your first name" required />
      </div>

      <!-- Last Name -->
      <div class="mb-4">
        <label for="lastName" class="block text-gray-600 font-bold mb-2">Last Name</label>
        <input type="text" id="lastName" v-model="lastName"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          placeholder="Enter your last name" required />
      </div>

      <!-- Email -->
      <div class="mb-4">
        <label for="email" class="block text-gray-600 font-bold mb-2">Email</label>
        <input type="email" id="email" v-model="email"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          placeholder="Enter your email" required />
      </div>

      <!-- Area -->
      <div class="mb-4">
        <label for="area" class="block text-gray-600 font-bold mb-2">Area</label>
        <Dropdown id="area" v-model.trim="area.area_name" :options="areas" optionLabel="area"
                  optionValue="id" placeholder="Select an Area" />
        <small v-if="submitted && !area.area_name" class="text-red-500">Area is required.</small>
      </div>

      <!-- Password -->
      <div class="mb-4 relative">
        <label for="password" class="block text-gray-600 font-bold mb-2">Password</label>
        <input :type="passwordVisible ? 'text' : 'password'" id="password" v-model="password"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          placeholder="Enter your password" required />
        <span class="absolute inset-y-0 right-3 flex items-center cursor-pointer" @click="togglePasswordVisibility">
          <i :class="passwordVisible ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-gray-500"></i>
        </span>
      </div>

      <!-- Confirm Password -->
      <div class="mb-4 relative">
        <label for="confirmPassword" class="block text-gray-600 font-bold mb-2">Confirm Password</label>
        <input :type="confirmPasswordVisible ? 'text' : 'password'" id="confirmPassword" v-model="confirmPassword"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          placeholder="Confirm your password" required />
        <span class="absolute inset-y-0 right-3 flex items-center cursor-pointer" @click="togglePasswordVisibility2">
          <i :class="confirmPasswordVisible ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-gray-500"></i>
        </span>
      </div>

      <!-- Username -->
      <div class="mb-4">
        <label for="username" class="block text-gray-600 font-bold mb-2">Username</label>
        <input type="text" id="username" v-model="username"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          placeholder="Enter your username" required />
      </div>

      <!-- QR Code Preview -->
      <qrcode-vue v-if="username" :value="username" :size="200" level="H" class="mt-4 mx-auto" />

      <!-- Submit Button -->
      <div>
        <button type="submit"
          class="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none">
          Create Account & Generate QR Code
        </button>
      </div>
    </form>
  </div>
</template>
