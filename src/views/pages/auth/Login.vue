<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const email = ref("");
const password = ref("");
const checked = ref(false);
const passwordVisible = ref(false); // State to control password visibility

// Function to toggle password visibility
const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value;
};

const handelLogin = async () => {
  const url = "http://localhost:9090/login";

  const loginData = {
    email: email.value,
    password: password.value,
  };

  try {
    const request = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    const responseData = await request.json(); // Extract response data

    if (!request.ok) {
      // Handle error case
      console.error("Error during login:", responseData);
      alert("Login failed: " + (responseData.error || "Unknown error"));
    } else {
      // Validate that all fields are present
      const { id, token, role, firstName, lastName, area } = responseData;

      if (id && token && role && firstName && lastName && area) {
        // Save to localStorage
        localStorage.setItem("id", id);
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("firstName", firstName);
        localStorage.setItem("lastName", lastName);
        localStorage.setItem("area", area);

        // Redirect based on role
        if (role === "Staff") {
          router.push("/agent/dashboard");
        } else if (role === "Customer") {
          router.push("/user/dashboard");
        } else if (role === "Admin") {
          router.push("/views/dashboard");
        }
      } else {
        console.error("Missing data in the response:", responseData);
        alert("Login failed: Missing data in response from the server.");
      }
    }
  } catch (error) {
    // Handle fetch errors
    console.error("Fetch error:", error);
    alert("An error occurred: " + error.message);
  }
};
</script>

<template>
  <div
    class="flex min-w-[100vw] min-h-screen overflow-hidden justify-center items-center"
    style="background-color: #d6eaf8"
  >
    <div
      style="
        border-radius: 20px;
        padding: 0.3rem;
        background: linear-gradient(
          180deg,
          #87cefa 10%,
          rgba(135, 206, 250, 0) 60%
        );
      "
    >
      <div class="flex flex-col md:flex-row w-full max-w-4xl">
        <div class="flex-1 flex items-center justify-center">
          <img
            src="/demo/images/bg.jpg"
            alt="Welcome"
            class="w-full h-full object-cover rounded-l-[20px] shadow-md"
          />
        </div>
        <div class="flex-1 flex items-center justify-center">
          <div
            class="card1 w-full bg-surface-0 dark:bg-surface-900 py-10 px-8 sm:px-12 shadow-md"
            style="border-radius: 0 20px 20px 0"
          >
            <div class="text-center mb-6">
              <router-link to="/" class="layout-topbar-logo">
                <img
                  src="/demo/images/logo.png"
                  class="mb-6 w-16 shrink-0 mx-auto"
                />
              </router-link>
              <div
                class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4"
              >
                Welcome to Blu Drop!
              </div>
              <span class="text-muted-color font-medium"
                >Sign in to continue</span
              >
            </div>

            <div>
              <label
                for="email1"
                class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2"
                >User Name</label
              >
              <InputText
                id="email1"
                type="text"
                placeholder="User Name"
                class="w-full md:w-[30rem] mb-6"
                v-model="email"
              />

              <label
                for="password1"
                class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2"
                >Password</label
              >

              <!-- Password input with eye icon -->
              <div class="relative w-full md:w-[30rem] mb-4">
                <input
                  :type="passwordVisible ? 'text' : 'password'"
                  id="password"
                  v-model="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter your password"
                  required
                />
                <span
                  class="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                  @click="togglePasswordVisibility"
                >
                  <i
                    :class="passwordVisible ? 'pi pi-eye-slash' : 'pi pi-eye'"
                    class="text-gray-500"
                  ></i>
                </span>
              </div>

              <div class="flex items-center justify-between mt-2 mb-6 gap-8">
                <div class="flex items-center">
                  <Checkbox
                    v-model="checked"
                    id="rememberme1"
                    binary
                    class="mr-2"
                  ></Checkbox>
                  <label for="rememberme1">Remember me</label>
                </div>
                <span
                  class="font-medium no-underline ml-2 text-right cursor-pointer text-primary"
                  >Forgot password?</span
                >
              </div>
              <Button
                label="Sign In"
                severity="info"
                class="w-full"
                @click="handelLogin"
              ></Button>
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
  color: #007bff; /* Customize icon color */
}
</style>
