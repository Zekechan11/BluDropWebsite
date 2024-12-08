<script setup>
import { ref } from "vue";

const firstName = localStorage.getItem("firstName");
const lastName = localStorage.getItem("lastName");

</script>

<template>
  <Fluid>
    <div class="space">
      <h1 class="text-4xl font-semibold mb-4" style="color: #899499">Profile</h1>
    </div>

    <div class="flex flex-col">
      <div class="flex mb-4">
        <p class="flex-1 py-2 text-center bg-blue-600 : bg-blue-400"
          style="color: white; font-weight: bold; border-radius: 10px">
          Profile Image
        </p>
        <div class="mx-2"></div>
      </div>

      <div style="
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);border-radius: 10px;
        ">
        <div class="card flex gap-8">

          <div class="flex flex-col gap-4 flex-1">
            <div class="flex flex-col gap-2">
              <label for="name1">First Name</label>
              <InputText v-model="firstName" id="name1" type="text" />
            </div>
            <div class="flex flex-col gap-2">
              <label for="name2">Last Name</label>
              <InputText v-model="lastName" id="name2" type="text" />
            </div>
            <button class="flex-1 py-2 text-center" style="
                color: darkblue;
                background-color: #007fff;
                font-weight: bold;
                color: white;
                border-radius: 10px;
              ">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  </Fluid>
</template>
