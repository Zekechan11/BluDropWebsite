<script setup>
import { ref } from 'vue';
import { useLayout } from "@/layout/composables/layout";
import { useRoute } from 'vue-router';

const { getPrimary, getSurface, isDarkTheme } = useLayout();


const customer = ref({
  firstName: "John",
  lastName: "Doe",
  amountPayable: 20
});

const route = useRoute(); // Get the route object
const slug = route.params.slug;

// Method to handle payment submission
const submitPayment = () => {
  console.log("Payment submitted!");
  // Add your payment submission logic here (API call, form processing, etc.)
};

const formatCurrency = (value) => {
  return value.toLocaleString("en-US", { style: "currency", currency: "PHP" });
};
</script>

<template>

<div class="space">
  <h1 class="font-semibold">{{ slug }}'s Payment</h1>
  </div>

  <div class="card shadow-md flex flex-col justify-between" style="height: 565px">
    <!-- Tab content -->
    <div class="flex-grow">
      <ul class="list-none p-0 m-0 mt-12">
        <li class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <span class="text-surface-900 dark:text-surface-0 font-semibold mr-2 mb-1 md:mb-0" style="font-size: 24px;">Gallons Returned :</span>
          </div>
          <div class="mt-2 md:mt-0 flex items-center">
            <input class="ml-4 font-medium" style="font-size: 24px;border: solid 1px;"
            id="gallonsReturned"
            type="number"
            v-model="customer.gallonsReturned"
            min="0"
          />
          </div>
        </li>
        <li class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <span class="text-surface-900 dark:text-surface-0 font-semibold mr-2 mb-1 md:mb-0" style="font-size: 24px;">Gallons Deliver :</span>
          </div>
          <div class="mt-2 md:mt-0 ml-0 md:ml-20 flex items-center">
            <input class="ml-4 font-medium" style="font-size: 24px;border: solid 1px;"
            id="gallonsDelivered"
            type="number"
            v-model="customer.gallonsDelivered"
            min="0"
          />
          </div>
        </li>
        <li class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <span class="text-surface-900 dark:text-surface-0 font-semibold mr-2 mb-1 md:mb-0" style="font-size: 24px;">Amount Paid :</span>
          </div>
          <div class="mt-2 md:mt-0 ml-0 md:ml-20 flex items-center">
            <input class="ml-4 font-medium" style="font-size: 24px;border: solid 1px;"
            id="amountPaid"
            type="number"
            v-model="customer.amountPaid"
            min="0"
          />
          </div>
        </li>
        <li class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <span class="text-surface-900 dark:text-surface-0 font-semibold mr-2 mb-1 md:mb-0" style="font-size: 24px;">Amount Payables :</span>
          </div>
          <div class="mt-2 md:mt-0 ml-0 md:ml-20 flex items-center">
            <span class="ml-4 font-medium" style="font-size: 24px;">{{ formatCurrency(20) }}</span>
          </div>
        </li>
      </ul>
    </div>
    <!-- Submit Payment Button at the bottom -->
    <div class="flex justify-end mt-4">
      <button @click="submitPayment" class="px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-700">
        Submit Payment
      </button>
    </div>
  </div>
  
</template>
