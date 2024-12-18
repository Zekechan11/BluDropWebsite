<script setup>
import { useLayout } from "@/layout/composables/layout";
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const { getPrimary, getSurface, isDarkTheme } = useLayout();

// State to hold parsed customer data
const customerData = ref({
  orderId: null,
  customerFirstName: "",
  customerLastName: "",
  gallons: 0,
  date: "",
  dateCreated: "",
  totalPrice: 0,
  status: "",
  customerArea: "",
});

// Extract route parameter (if QR code data is passed via route)
const route = useRoute();
const slug = route.params.slug;

// Mock raw data from QR code (replace this with actual decoded QR data)
const rawData = `{"orderId":39,"customerFirstName":"Ezekiel Angelo","customerLastName":"Pelayo","gallons":10,"date":"Tuesday","dateCreated":"2024-12-18 23:16:50","totalPrice":200,"status":"Pending","customerArea":"Cayang, Bogo City, Cebu"}`;

// Parse raw data and assign it to the customerData object
try {
  const parsedData = JSON.parse(rawData);
  Object.assign(customerData.value, parsedData);
} catch (error) {
  console.error("Failed to parse QR code data:", error);
}

// Method to handle payment submission
const submitPayment = async () => {
  try {
    const response = await fetch('/api/process_payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: customerData.orderId,
        amount_paid: customerData.amountPaid,
        gallons_returned: customerData.gallonsReturned || 0,
      }),
    });

    const result = await response.json();
    if (response.ok) {
      alert(result.message);
    } else {
      console.error(result.error);
      alert("Error processing payment: " + result.error);
    }
  } catch (error) {
    console.error("Payment submission failed:", error);
  }
};

const formatCurrency = (value) => {
  return value.toLocaleString("en-US", { style: "currency", currency: "PHP" });
};
</script>

<template>
  <div class="space">
    <h1 class="font-semibold">{{ customerData.customerFirstName }} {{ customerData.customerLastName }}'s Payment</h1>
  </div>

  <div class="card shadow-md flex flex-col justify-between" style="height: 565px">
    <!-- Customer Details -->
    <div class="flex-grow">
      <ul class="list-none p-0 m-0 mt-12">
        <li class="mb-4 text-base">
          <strong>Order ID:</strong> {{ customerData.orderId }}
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
              v-model="customerData.amountPaid"
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
              v-model="customerData.gallonsReturned"
              min="0"
            />
          </div>
        </li>
      </ul>
    </div>

    <!-- Submit Payment Button -->
    <div class="flex justify-end" style="margin-top: -1rem;">
      <button @click="submitPayment" class="px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-700">
        Submit Payment
      </button>
    </div>
  </div>
</template>
