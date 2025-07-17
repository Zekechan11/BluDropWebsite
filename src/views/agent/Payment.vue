<script setup>
import axios from 'axios';
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { WATER_API } from '../../config';

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
  <div class="space-y-6">
    <!-- Alerts -->
    <div v-if="error" class="p-4 rounded-md text-sm font-medium bg-red-100 text-red-800 border border-red-300">
      {{ error }}
    </div>
    <div v-if="successMessage"
      class="p-4 rounded-md text-sm font-medium bg-green-100 text-green-800 border border-green-300">
      {{ successMessage }}
    </div>

    <div class="space mb-6">
      <h1 class="text-4xl font-semibold text-gray-700 flex items-center gap-3">
        <i class="pi pi-user text-blue-500 !text-4xl"></i>
        {{ customerData.customerFirstName || "N/A" }} {{ customerData.customerLastName || "N/A" }}'s Payment
      </h1>
    </div>

    <!-- Main Card -->
    <div class="card shadow-lg rounded-lg p-6 bg-white space-y-6">

      <!-- Customer Info Section -->
      <div>
        <h2 class="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Customer Details</h2>
        <ul class="space-y-3 text-base text-gray-600">
          <li><strong>Name:</strong> {{ customerData.customerFirstName || "Not Available" }} {{
            customerData.customerLastName || "Not Available" }}</li>
          <li><strong>Area:</strong> {{ customerData.customerArea || "No Area Found" }}</li>
          <li><strong>Date:</strong> {{ customerData.date || "00/00/000" }}</li>
          <li>
            <strong>Status:</strong>
            <span :class="[
              'inline-block px-2 py-1 rounded text-sm font-semibold',
              {
                'bg-yellow-100 text-yellow-800': customerData.status === 'Pending',
                'bg-green-100 text-green-800': customerData.status === 'Completed',
                'bg-gray-100 text-gray-800': !customerData.status || customerData.status === 'None'
              }
            ]">
              {{ customerData.status || 'None' }}
            </span>
          </li>
          <li><strong>Total Gallons:</strong> {{ customerData.gallons }}</li>
          <li><strong>Total Price:</strong> {{ formatCurrency(customerData.totalPrice) }}</li>
        </ul>
      </div>

      <!-- Payment Form Section -->
      <div>
        <h2 class="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Payment Details</h2>
        <div class="space-y-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <label class="text-gray-700 font-medium">Amount to Pay:</label>
            <span class="text-lg font-medium text-gray-900">{{ formatCurrency(customerData.totalPrice) }}</span>
          </div>

          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <label class="text-gray-700 font-medium">Amount Payables:</label>
            <span class="text-lg font-medium text-gray-900">0</span>
          </div>

          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <label class="text-gray-700 font-medium">Payment:</label>
            <input type="number" v-model.number="customerData.amountPaid"
              class="border border-gray-300 rounded-md p-2 w-40 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              min="0" step="0.01" :disabled="isLoading" />
          </div>

          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <label class="text-gray-700 font-medium">Gallons to Return:</label>
            <input type="number" v-model.number="customerData.gallonsReturned"
              class="border border-gray-300 rounded-md p-2 w-40 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              min="0" :disabled="isLoading" />
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end pt-4 border-t mt-6">
        <button @click="submitPayment" :disabled="isLoading"
          class="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors">
          <span v-if="isLoading">Processing...</span>
          <span v-else>Submit Payment</span>
        </button>
      </div>
    </div>
  </div>
</template>
