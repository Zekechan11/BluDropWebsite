<script setup>
import { ref } from "vue";
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { WATER_API } from "../config";

const userData = JSON.parse(localStorage.getItem("user_data"));

const firstname = ref(userData.firstname || "");
const lastname = ref(userData.lastname || "");
const email = ref(userData.email || "");

const toast = useToast();

async function updateProfile() {
    if (!firstname.value || !lastname.value || !email.value) {
        toast.add({ severity: 'error', summary: 'Error', detail: "All fields are required.", life: 3000 });
        return;
    }

    try {
        const res = await axios.post(
            `${WATER_API}/api/profile/edit/management`,
            {
                id: userData.uid,
                firstname: firstname.value,
                lastname: lastname.value,
                email: email.value,
            }
        );

        toast.add({ severity: 'success', summary: 'Successfuck', detail: res.data.message || "Profile updated successfully.", life: 3000 });

        userData.firstname = firstname.value;
        userData.lastname = lastname.value;
        userData.email = email.value;
        localStorage.setItem("user_data", JSON.stringify(userData));

    } catch (error) {
        const message =
            error.response?.data?.error ||
            error.message ||
            "Failed to update profile.";
        toast.add({ severity: 'error', summary: 'Error', detail: message, life: 3000 });
    }
}
</script>

<template>
    <div class="card flex gap-8">
        <div class="flex flex-col gap-4 flex-1">
            <div class="flex flex-col gap-2">
                <label for="firstname">First Name</label>
                <InputText id="firstname" type="text" v-model="firstname" />
            </div>
            <div class="flex flex-col gap-2">
                <label for="lastname">Last Name</label>
                <InputText id="lastname" type="text" v-model="lastname" />
            </div>
            <div class="flex flex-col gap-2">
                <label for="email">Email</label>
                <InputText id="email" type="text" v-model="email" />
            </div>
            <button class="flex-1 py-2 text-center"
                style="color: white; background-color: #007fff; font-weight: bold; border-radius: 10px;"
                @click="updateProfile">
                Save Changes
            </button>
        </div>
    </div>
</template>