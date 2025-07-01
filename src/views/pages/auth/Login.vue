<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { WATER_API } from "../../../config";

const router = useRouter();

const email = ref("");
const password = ref("");
const checked = ref(false);
const passwordVisible = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value;
};

const handelLogin = async () => {
  errorMessage.value = "";
  isLoading.value = true;

  const loginData = {
    email: email.value,
    password: password.value,
  };

  try {
    const request = await fetch(`${WATER_API}/v2/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    const responseData = await request.json();

    if (!request.ok) {
      errorMessage.value = responseData.error || "Invalid credentials.";
    } else {
      const { token, user_info } = responseData;

      if (token && user_info) {
        localStorage.setItem("token", token);
        localStorage.setItem("user_data", JSON.stringify(user_info));

        switch (user_info.role) {
          case "Agent":
            router.push("/agent/dashboard");
            break;
          case "Customer":
            router.push("/user/dashboard");
            break;
          case "Admin":
            router.push("/views/dashboard");
            break;
          default:
            errorMessage.value = "Unknown user role.";
        }
      } else {
        errorMessage.value = "Missing data in response.";
      }
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
    <div class="absolute top-6 left-6">
      <router-link to="/">
        <button class="flex items-center text-blue-600 hover:text-blue-800 font-medium transition">
          <i class="pi pi-arrow-left mr-2"></i> Back
        </button>
      </router-link>
    </div>
    <div class="rounded-[20px] p-1 bg-gradient-to-b from-sky-400 to-transparent w-full max-w-4xl">
      <div class="flex flex-col md:flex-row">
        <div class="flex-1">
          <img src="/demo/images/bg.jpg" alt="Welcome" class="w-full h-full object-cover rounded-l-[20px] shadow-md" />
        </div>
        <div class="flex-1 flex items-center justify-center">
          <div class="bg-white dark:bg-gray-900 p-10 sm:p-12 rounded-r-[20px] shadow-md w-full">
            <div class="text-center mb-6">
              <router-link to="/" class="layout-topbar-logo">
                <img src="/demo/images/logo.png" class="mb-6 w-16 mx-auto" />
              </router-link>
              <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-2">Welcome to Blu Drop!</h1>
              <p class="text-gray-600 dark:text-gray-300">Sign in to continue</p>
            </div>

            <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
              {{ errorMessage }}
            </div>

            <div class="mb-4">
              <label class="block text-xl font-medium mb-1">User Name</label>
              <InputText type="text" placeholder="User Name" class="w-full mb-4" v-model="email" />

              <label class="block text-xl font-medium mb-1">Password</label>
              <div class="relative w-full mb-4">
                <input :type="passwordVisible ? 'text' : 'password'" v-model="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter your password" />
                <span class="absolute right-3 top-2/4 transform -translate-y-2/4 cursor-pointer"
                  @click="togglePasswordVisibility">
                  <i :class="passwordVisible ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-gray-500"></i>
                </span>
              </div>

              <div class="flex items-center justify-between mb-6">
                <label class="flex items-center">
                  <Checkbox v-model="checked" binary class="mr-2" />
                  Remember me
                </label>
                <span class="text-blue-600 hover:underline cursor-pointer">Forgot password?</span>
              </div>

              <Button severity="info" class="w-full flex items-center justify-center gap-2" :disabled="isLoading"
                @click="handelLogin">
                <template #default>
                  <span v-if="isLoading">
                    <i class="pi pi-spin pi-spinner text-white text-xl"></i>
                  </span>
                  <span v-else>Sign In</span>
                </template>
              </Button>

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
</style>
