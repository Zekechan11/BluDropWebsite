<script setup>
import { useLayout } from "@/layout/composables/layout";
import axios from 'axios';
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { WATER_API } from '../../config';

const { getPrimary, getSurface, isDarkTheme } = useLayout();

// State to hold parsed customer data
const customerData = ref({
  orderId: null,
  customerId: null,
  customerFirstName: "",
  customerLastName: "",
  gallons: 0,
  date: "",
  dateCreated: "",
  totalPrice: 0,
  status: "",
  customerArea: "",
  amountPaid: 0,
  gallonsReturned: 0,
});

const error = ref("");
const isLoading = ref(false);
const successMessage = ref("");

const route = useRoute();
const router = useRouter();
const slug = route.params.slug;

// Parse the route parameter dynamically
onMounted(() => {
  try {
    const decodedData = decodeURIComponent(slug);
    const parsedData = JSON.parse(decodedData);
    
    // Ensure all required fields are present
    Object.assign(customerData.value, {
      ...parsedData,
      amountPaid: 0,
      gallonsReturned: 0
    });
  } catch (error) {
    console.error("Failed to parse QR code data:", error);
    error.value = "Invalid QR code data";
  }
});

// Method to handle payment submission
const submitPayment = async () => {
  error.value = "";
  successMessage.value = "";
  
  // Input validation
  if (!customerData.value.orderId || !customerData.value.customerId) {
    error.value = "Missing order or customer information";
    return;
  }

  if (customerData.value.amountPaid <= 0) {
    error.value = "Please enter a valid payment amount";
    return;
  }

  // if (customerData.value.amountPaid < customerData.value.totalPrice) {
  //   error.value = "The amount paid is less than the total price";
  //   return;
  // }

  if (customerData.value.gallonsReturned < 0) {
    error.value = "Gallons returned cannot be negative";
    return;
  }

  isLoading.value = true;

  try {
    const response = await axios.post(`${WATER_API}/api/process-payment`, {
      orderId: customerData.value.orderId,
      customerId: customerData.value.customerId,
      amountPaid: customerData.value.amountPaid,
      gallonsReturned: customerData.value.gallonsReturned
    });

    // Handle successful response
    if (response.data) {
      successMessage.value = response.data.message || "Payment processed successfully!";
      customerData.value.status = response.data.status || "Completed";
      
      // Redirect after successful payment
      setTimeout(() => {
        router.push("/agent/dashboard");
      }, 2000);
    }
  } catch (error) {
    console.error("Payment submission failed:", error);
    
    // Handle different types of errors
    if (error.response) {
      // Server responded with an error
      error.value = error.response.data.error || "Payment processing failed";
    } else if (error.request) {
      // Request made but no response received
      error.value = "Unable to connect to the server. Please try again";
    } else {
      // Something else went wrong
      error.value = "An unexpected error occurred";
    }
  } finally {
    isLoading.value = false;
  }
};

// Utility function for formatting currency
const formatCurrency = (value) => {
  return value.toLocaleString("en-US", { style: "currency", currency: "PHP" });
};
</script>

<template>
  <div class="space">
    <div v-if="error" class="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{{ error }}</div>
    <div v-if="successMessage" class="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">{{ successMessage }}</div>

    <h1 class="text-2xl font-semibold mb-6">
      {{ customerData.customerFirstName }} {{ customerData.customerLastName }}'s Payment
    </h1>
  </div>

  <div class="card shadow-md flex flex-col justify-between" style="height: 565px">
    <!-- Customer Details -->
    <div class="flex-grow">
      <ul class="list-none p-0 m-0 mt-4">
        <!-- <li class="mb-4 text-base">
          <strong>Order ID:</strong> {{ customerData.orderId }}
        </li>
        <li class="mb-4 text-base">
          <strong>Customer ID:</strong> {{ customerData.customerId }}
        </li> -->
        <li class="mb-4 text-base">
          <strong>Name:</strong> {{ customerData.customerFirstName }} {{ customerData.customerLastName }}
        </li>
        <li class="mb-4 text-base">
          <strong>Area:</strong> {{ customerData.customerArea }}
        </li>
        <li class="mb-4 text-base">
          <strong>Date:</strong> {{ customerData.date }}
        </li>
        <!-- <li class="mb-4 text-base">
          <strong>Date Created:</strong> {{ customerData.dateCreated }}
        </li> -->
        <li class="mb-4 text-base">
          <strong>Status:</strong> 
          <span :class="{
            'text-yellow-600': customerData.status === 'Pending',
            'text-green-600': customerData.status === 'Completed'
          }">
            {{ customerData.status }}
          </span>
        </li>
        <li class="mb-4 text-base">
          <strong>Total Gallons:</strong> {{ customerData.gallons }}
        </li>
        <li class="mb-4 text-base">
          <strong>Total Price:</strong> {{ formatCurrency(customerData.totalPrice) }}
        </li>
      </ul>
    </div>

    <!-- Payment Details -->
    <div>
      <ul class="list-none p-0 m-0 mt-8">
        <li class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <span class="text-surface-900 dark:text-surface-0 font-semibold mr-2 mb-1 md:mb-0 text-xl">Amount to Pay:</span>
          </div>
          <div class="mt-2 md:mt-0 flex items-center">
            <span class="ml-4 font-medium text-xl">{{ formatCurrency(customerData.totalPrice) }}</span>
          </div>
        </li>
        <li class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <span class="text-surface-900 dark:text-surface-0 font-semibold mr-2 mb-1 md:mb-0 text-xl">Amount Payables:</span>
          </div>
          <div class="mt-2 md:mt-0 flex items-center">
            <span class="ml-4 font-medium text-xl">0</span>
          </div>
        </li>
        <li class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <span class="text-surface-900 dark:text-surface-0 font-semibold mr-2 mb-1 md:mb-0 text-xl">Payment:</span>
          </div>
          <div class="mt-2 md:mt-0 flex items-center">
            <input
              class="ml-4 p-2 border rounded-md text-xl w-40"
              type="number"
              v-model.number="customerData.amountPaid"
              min="0"
              step="0.01"
              :disabled="isLoading"
            />
          </div>
        </li>

        <li class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <span class="text-surface-900 dark:text-surface-0 font-semibold mr-2 mb-1 md:mb-0 text-xl">Gallons to Return:</span>
          </div>
          <div class="mt-2 md:mt-0 flex items-center">
            <input
              class="ml-4 p-2 border rounded-md text-xl w-40"
              type="number"
              v-model.number="customerData.gallonsReturned"
              min="0"
              :disabled="isLoading"
            />
          </div>
        </li>
      </ul>
    </div>

    <!-- Submit Button -->
    <div class="flex justify-end mt-6">
      <button 
        @click="submitPayment" 
        :disabled="isLoading" 
        class="px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors">
        <span v-if="isLoading" class="flex items-center">
          Processing...
        </span>
        <span v-else>
          Submit Payment
        </span>
      </button>
    </div>
  </div>
</template>