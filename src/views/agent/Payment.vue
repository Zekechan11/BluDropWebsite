<script setup>
import { useLayout } from "@/layout/composables/layout";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router"; // Import useRouter

const ORDER_URL = "http://localhost:9090";

const { getPrimary, getSurface, isDarkTheme } = useLayout();

// State to hold parsed customer data
const customerData = ref({
  orderId: null,
  customerId: null, // Include customerId here
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

// Extract route parameter (if QR code data is passed via route)
const route = useRoute();
const router = useRouter(); // Initialize the router
const slug = route.params.slug;

// Parse the route parameter dynamically
onMounted(() => {
  try {
    const decodedData = decodeURIComponent(slug);
    const parsedData = JSON.parse(decodedData);

    Object.assign(customerData.value, parsedData);

    // Ensure additional fields are initialized
    customerData.value.amountPaid = 0;
    customerData.value.gallonsReturned = 0;
  } catch (error) {
    console.error("Failed to parse QR code data:", error);
    error.value = "Invalid QR code data";
  }
});

// Method to handle payment submission
const submitPayment = async () => {
  error.value = "";
  successMessage.value = "";

  const backendURL = "http://localhost:9090/api/process-payment";

  if (customerData.value.amountPaid < customerData.value.totalPrice) {
    error.value = "The amount paid is less than the total price.";
    return;
  }

  isLoading.value = true;

  try {
    const response = await fetch(backendURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: customerData.value.orderId,
        customerId: customerData.value.customerId, // Include customerId here
        amountPaid: customerData.value.amountPaid,
        gallonsReturned: customerData.value.gallonsReturned || 0,
      }),
    });

    let result = {};
    try {
      result = await response.json();
    } catch {
      if (!response.ok) throw new Error("Unexpected server error");
    }

    if (response.ok) {
      successMessage.value = result.message || "Payment processed successfully!";
      customerData.value.status = "Completed";

      // Redirect to /agent/dashboard after successful payment
      setTimeout(() => {
        router.push("/agent/dashboard");
      }, 2000); // Optional: Add a slight delay for UX
    } else {
      error.value = result.error || "An error occurred while processing the payment.";
    }
  } catch (err) {
    console.error("Payment submission failed:", err);
    error.value = "Failed to connect to the server. Please try again later.";
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
    <p v-if="error" class="text-red-500 mb-4">{{ error }}</p>
    <p v-if="successMessage" class="text-green-500 mb-4">{{ successMessage }}</p>

    <h1 class="font-semibold">
      {{ customerData.customerFirstName }} {{ customerData.customerLastName }}'s Payment
    </h1>
  </div>

  <div class="card shadow-md flex flex-col justify-between" style="height: 565px">
    <!-- Customer Details -->
    <div class="flex-grow">
      <ul class="list-none p-0 m-0 mt-12">
        <li class="mb-4 text-base">
          <strong>Order ID:</strong> {{ customerData.orderId }}
        </li>
        <li class="mb-4 text-base">
          <strong>Customer ID:</strong> {{ customerData.customerId }}
        </li>
        <li class="mb-4 text-base">
          <strong>Name:</strong> {{ customerData.customerFirstName }} {{ customerData.customerLastName }}
        </li>
        <li class="mb-4 text-base">
          <strong>Area:</strong> {{ customerData.customerArea }}
        </li>
        <li class="mb-4 text-base">
          <strong>Date:</strong> {{ customerData.date }}
        </li>
        <li class="mb-4 text-base">
          <strong>Date Created:</strong> {{ customerData.dateCreated }}
        </li>
        <li class="mb-4 text-base">
          <strong>Status:</strong> {{ customerData.status }}
        </li>
        <li class="mb-4 text-base">
          <strong>Total Gallons:</strong> {{ customerData.gallons }}
        </li>
        <li class="mb-4 text-base">
          <strong>Total Price:</strong> {{ formatCurrency(customerData.totalPrice) }}
        </li>
      </ul>
    </div>

    <!-- Inputs for Payment Details -->
    <div>
      <ul class="list-none p-0 m-0 mt-12">
        <li class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <span class="text-surface-900 dark:text-surface-0 font-semibold mr-2 mb-1 md:mb-0" style="font-size: 1.25rem;">Amount to Pay:</span>
          </div>
          <div class="mt-2 md:mt-0 flex items-center">
            <span class="ml-4 font-medium" style="font-size: 1.25rem;">{{ formatCurrency(customerData.totalPrice) }}</span>
          </div>
        </li>
        <li class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <span class="text-surface-900 dark:text-surface-0 font-semibold mr-2 mb-1 md:mb-0" style="font-size: 1.25rem;">Payment:</span>
          </div>
          <div class="mt-2 md:mt-0 flex items-center">
            <input
              class="ml-4 font-medium"
              style="font-size: 1.25rem; border: solid 1px;"
              id="amountPaid"
              type="number"
              v-model.number="customerData.amountPaid"
              min="0"
            />
          </div>
        </li>
        <li class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <span class="text-surface-900 dark:text-surface-0 font-semibold mr-2 mb-1 md:mb-0" style="font-size: 1.25rem;">Gallons to Return:</span>
          </div>
          <div class="mt-2 md:mt-0 flex items-center">
            <input
              class="ml-4 font-medium"
              style="font-size: 1.25rem; border: solid 1px;"
              id="gallonsReturned"
              type="number"
              v-model.number="customerData.gallonsReturned"
              min="0"
            />
          </div>
        </li>
      </ul>
    </div>

    <!-- Submit Payment Button -->
    <div class="flex justify-end" style="margin-top: -1rem;">
      <button 
        @click="submitPayment" 
        :disabled="isLoading" 
        class="px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-700">
        {{ isLoading ? "Processing..." : "Submit Payment" }}
      </button>
    </div>
  </div>
</template>
