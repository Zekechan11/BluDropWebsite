<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { WATER_API } from "../../../config";

const router = useRouter();

const email = ref("");
const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const handleForgotPassword = async () => {
  errorMessage.value = "";
  successMessage.value = "";
  isLoading.value = true;

  const forgotData = { email: email.value };

  try {
    const request = await fetch(`${WATER_API}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(forgotData),
    });

    const responseData = await request.json();

    if (!request.ok) {
      errorMessage.value = responseData.message || "Failed to send reset email.";
    } else {
      successMessage.value = responseData.message || "Check your email for reset instructions!";
    }
  } catch (error) {
    errorMessage.value = "Network error: " + error.message;
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="flex min-w-[100vw] min-h-screen justify-center items-center bg-[#d6eaf8]">
    <div class="rounded-[20px] p-1 bg-gradient-to-b from-sky-400 to-transparent w-full max-w-4xl">
      <div class="flex flex-col md:flex-row">
        <div class="flex-1">
          <img src="/demo/images/bg.jpg" alt="Forgot Password" class="w-full h-full object-cover rounded-l-[20px] shadow-md" />
        </div>
        <div class="flex-1 flex items-center justify-center">
          <div class="bg-white dark:bg-gray-900 p-10 sm:p-12 rounded-r-[20px] shadow-md w-full">
            <div class="text-center mb-6">
              <router-link to="/" class="layout-topbar-logo">
                <img src="/demo/images/logo.png" class="mb-6 w-16 mx-auto" />
              </router-link>
              <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-2">Forgot your password?</h1>
              <p class="text-gray-600 dark:text-gray-300">Enter your email to receive a password reset link.</p>
            </div>

            <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
              {{ errorMessage }}
            </div>
            <div v-if="successMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
              {{ successMessage }}
            </div>

            <div class="mb-4">
              <label class="block text-xl font-medium mb-1">Email Address</label>
              <InputText type="email" placeholder="Enter your email" class="w-full mb-4" v-model="email" />
            </div>

            <Button severity="info" class="w-full flex items-center justify-center gap-2" :disabled="isLoading"
              @click="handleForgotPassword">
              <template #default>
                <span v-if="isLoading">
                  <i class="pi pi-spin pi-spinner text-white text-xl"></i>
                </span>
                <span v-else>Send Reset Link</span>
              </template>
            </Button>
            <div class="text-center mt-4">
              <p class="text-gray-600 dark:text-gray-300">
                Remember your account?
                <router-link to="/login" class="text-blue-600 hover:underline">Back to Login</router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flex {
  display: flex;
}

.max-w-4xl {
  max-width: 1024px;
}

.relative {
  position: relative;
}

.pi-eye,
.pi-eye-slash {
  font-size: 1.5rem;
  color: #007bff;
}

.text-blue-600 {
  color: #3b82f6;
}

.text-blue-600:hover {
  text-decoration: underline;
}
</style>
