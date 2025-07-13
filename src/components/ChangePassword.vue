<script setup>
import { ref } from "vue";
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { WATER_API } from "../config";

const oldPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");

const toast = useToast();
const userData = JSON.parse(localStorage.getItem("user_data"));

async function changePassword() {

    if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
        toast.add({ severity: 'error', summary: 'Error', detail: "All password fields are required.", life: 3000 });
        return;
    }

    if (newPassword.value !== confirmPassword.value) {
        toast.add({ severity: 'error', summary: 'Error', detail: "New password and confirmation do not match.", life: 3000 });
        return;
    }

    if (newPassword.value === "") {
        toast.add({ severity: 'error', summary: 'Error', detail: "New password cannot be empty.", life: 3000 });
        return;
    }

    try {
        const res = await axios.post(
            `${WATER_API}/api/profile/change-password/management`,
            {
                id: userData.uid,
                current_password: oldPassword.value,
                password: newPassword.value,
            }
        );

        toast.add({ severity: 'success', summary: 'Successful', detail: res.data.message || "Password updated successfully.", life: 3000 });
        oldPassword.value = "";
        newPassword.value = "";
        confirmPassword.value = "";

    } catch (error) {
        const message =
            error.response?.data?.error ||
            error.message ||
            "Network or server error.";
        toast.add({ severity: 'error', summary: 'Error', detail: message, life: 3000 });
    }
}
</script>

<template>
    <div class="card flex flex-col gap-4">
        <div class="flex flex-col gap-2">
            <label for="oldPassword">Old Password</label>
            <InputText id="oldPassword" type="password" v-model="oldPassword" />
        </div>
        <div class="flex flex-col gap-2">
            <label for="newPassword">New Password</label>
            <InputText id="newPassword" type="password" v-model="newPassword" />
        </div>
        <div class="flex flex-col gap-2">
            <label for="confirmPassword">Confirm New Password</label>
            <InputText id="confirmPassword" type="password" v-model="confirmPassword" />
        </div>

        <button class="flex-1 py-2 text-center" style="
        color: darkblue;
        background-color: #007fff;
        font-weight: bold;
        color: white;
        border-radius: 10px;
      " @click="changePassword">
            Save Changes
        </button>
    </div>
</template>