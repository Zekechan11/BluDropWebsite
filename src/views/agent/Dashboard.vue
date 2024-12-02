<script setup>
import { useLayout } from "@/layout/composables/layout";
import { onBeforeMount, ref } from 'vue';

const { getPrimary, getSurface, isDarkTheme } = useLayout();
const customers2 = ref(null);

onBeforeMount(() => {});

const formatCurrency = (value) => {
  return value.toLocaleString("en-US", { style: "currency", currency: "PHP" });
};
</script>

<template>
  <div class="space">
    <h1 class="font-semibold text-2xl md:text-4xl mb-6 text-gray-500">Container on Loan</h1>
  </div>

  <div class="card shadow-md h-auto md:h-550px p-4">
    <!-- Tab content -->
    <div class="flex flex-col items-center justify-center h-full">
      <h1 class="font-semibold text-2xl md:text-4xl mb-6 text-gray-500 text-center">Guadalupe</h1>

      <ul class="list-none p-0 m-0 mt-10 px-4 md:px-10 w-full">
        <li class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div class="bg-blue-500 p-5 rounded-lg text-white flex justify-between w-full">
            <span class="font-semibold text-lg md:text-2xl">Container on loan:</span>
            <span class="ml-8 font-medium text-lg md:text-2xl">50</span>
          </div>
        </li>

        <li class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div class="bg-blue-500 p-5 rounded-lg text-white flex justify-between w-full">
            <span class="font-semibold text-lg md:text-2xl">Gallons Delivered:</span>
            <span class="ml-8 font-medium text-lg md:text-2xl">50</span>
          </div>
        </li>

        <li class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div class="bg-blue-500 p-5 rounded-lg text-white flex justify-between w-full">
            <span class="font-semibold text-lg md:text-2xl">Gallons Collected:</span>
            <span class="ml-8 font-medium text-lg md:text-2xl">50</span>
          </div>
        </li>

        <li class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div class="bg-blue-500 p-5 rounded-lg text-white flex justify-between w-full">
            <span class="font-semibold text-lg md:text-2xl">Amount Collected:</span>
            <span class="ml-8 font-medium text-lg md:text-2xl">₱50</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

