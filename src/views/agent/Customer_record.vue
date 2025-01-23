<script setup>
import axios from "axios";
import { computed, onMounted, ref } from "vue";
import { WATER_API } from "../../config";
import { attempt } from "../../service/attemptservice";

// State
const searchQuery = ref("");
const visible = ref(false); // For customer detail modal
const orderModalVisible = ref(false); // For order modal
const selectedCustomer = ref(null); // Selected customer for the detail modal
const newOrder = ref({
  orderId: null,
  customerId: null,
  name: "",
  area: "",
  date: "",
  dateCreated: "",
  totalGallons: 0,
  gallonsToOrder: 0,
  totalPrice: 0,
  payment: 0,
  gallonsToReturn: 0,
});

const userData = JSON.parse(localStorage.getItem("user_data"));

const fetchCustomerRecords = async () => {
  const [customerCountResponse, customerCountError] = await attempt(
    axios.get(`${WATER_API}/v2/api/get_client/all?area_id=${userData.area_id}`)
  );
  if (customerCountError) {
    console.error("Error fetching customer records:", customerCountError);
  }

  customerRecords.value = customerCountResponse.data.data;
};

const customerRecords = ref([]);
onMounted(() => {
  fetchCustomerRecords();
});

const filteredCustomers = computed(() => {
  if (!searchQuery.value) {
    return customerRecords.value;
  }
  const query = searchQuery.value.toLowerCase();
  return customerRecords.value.filter((customer) => {
    return (
      (customer.firstname + " " + customer.lastname).toLowerCase().includes(query) ||
      customer.area.toLowerCase().includes(query) ||
      customer.total_payable.toString().toLowerCase().includes(query)
    );
  });
});

// Open the customer details modal
const openDetailsModal = (customer) => {
  selectedCustomer.value = customer;
  visible.value = true;
};

// Open the order modal with the selected customer's details
const openOrderModal = (customer) => {
  selectedCustomer.value = customer;
  newOrder.value = {
    orderId: Math.floor(Math.random() * 1000), // Example ID generation
    customerId: customer.client_id,
    name: `${customer.firstname} ${customer.lastname}`,
    area: customer.area,
    date: new Date().toISOString().split("T")[0],
    dateCreated: new Date().toISOString(),
    totalGallons: customer.gallons || 0,
    gallonsToOrder: 0,
    totalPrice: 0,
    payment: 0,
    gallonsToReturn: 0,
  };
  orderModalVisible.value = true;
};

// Calculate total price dynamically
const calculateTotalPrice = () => {
  newOrder.value.totalPrice = newOrder.value.gallonsToOrder * 20; // Example price per gallon
};

// Submit the new order
const submitOrder = async () => {
  const { customerId, gallonsToOrder, payment, gallonsToReturn } = newOrder.value;

  if (!gallonsToOrder || gallonsToOrder <= 0) {
    alert("Please enter a valid number of gallons to order.");
    return;
  }

  if (payment < newOrder.value.totalPrice) {
    alert("Payment must be equal to or greater than the total price.");
    return;
  }

  try {
    const response = await axios.post(`${WATER_API}/v2/api/process-manual-order`, {
      customerId,
      gallonsToOrder,
      payment,
      gallonsToReturn,
    });
    
    // Use the response data if needed
    alert(response.data.message || "Order successfully processed!");
    orderModalVisible.value = false; // Close modal after success
    
    // Optional: Refresh customer records
    fetchCustomerRecords();
  } catch (error) {
    console.error("Error processing order:", error);
    
    // More detailed error handling
    const errorMessage = error.response?.data?.error || "Failed to process order.";
    alert(errorMessage);
  }
};
</script>

<template>
  <div class="card shadow-md">
    <!-- DataTable -->
    <DataTable :value="filteredCustomers" paginator :rows="10" dataKey="client_id" filterDisplay="row">
      <template #header>
        <div class="flex justify-end items-center space-x-4">
          <InputText v-model="searchQuery" placeholder="Search..." class="w-48" />
        </div>
      </template>

      <template #empty> No customers found. </template>

      <Column header="Customer Name" style="min-width: 14rem">
        <template #body="{ data }">
          <span>{{ data.firstname }} {{ data.lastname }}</span>
        </template>
      </Column>

      <Column field="total_payable" header="Total Amount Payable" style="min-width: 12rem">
        <template #body="{ data }">
          ₱ {{ data.total_payable }}
        </template>
      </Column>

      <Column header="Action" style="min-width: 12rem">
        <template #body="{ data }">
          <i class="pi pi-eye cursor-pointer text-blue-500 mr-4" @click="openDetailsModal(data)"></i>
          <i class="pi pi-shopping-cart cursor-pointer text-green-500" @click="openOrderModal(data)"></i>
        </template>
      </Column>
    </DataTable>

    <!-- Customer Details Modal -->
    <Dialog v-model:visible="visible" maximizable modal header="Customer Details" :style="{ width: '30rem' }">
      <div>
        <p><strong>Name:</strong> {{ selectedCustomer.firstname }} {{ selectedCustomer.lastname }}</p>
        <p><strong>Area:</strong> {{ selectedCustomer.area }}</p>
        <p><strong>Total Payable:</strong> ₱{{ selectedCustomer.total_payable }}</p>
      </div>
    </Dialog>

    <!-- Order Modal -->
    <Dialog v-model:visible="orderModalVisible" maximizable modal header="Create New Order" :style="{ width: '40rem' }">
      <div class="card shadow-md flex flex-col justify-between" style="height: 565px">
        <!-- Customer Details -->
        <div class="flex-grow">
          <ul class="list-none p-0 m-0 mt-12">
            <li class="mb-4 text-base"><strong>Order ID:</strong> {{ newOrder.orderId }}</li>
            <li class="mb-4 text-base"><strong>Customer ID:</strong> {{ newOrder.customerId }}</li>
            <li class="mb-4 text-base"><strong>Name:</strong> {{ newOrder.name }}</li>
            <li class="mb-4 text-base"><strong>Area:</strong> {{ newOrder.area }}</li>
            <li class="mb-4 text-base"><strong>Date:</strong> {{ newOrder.date }}</li>
            <li class="mb-4 text-base"><strong>Date Created:</strong> {{ newOrder.dateCreated }}</li>
            <li class="mb-4 text-base"><strong>Total Gallons:</strong> {{ newOrder.totalGallons }}</li>
          </ul>
        </div>

        <!-- Order Details -->
        <div>
          <ul class="list-none p-0 m-0 mt-12">
            <li class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div><span class="text-xl font-semibold">Gallons to Order:</span></div>
              <input
                class="ml-4 p-2 border rounded-md text-xl w-40"
                type="number"
                v-model.number="newOrder.gallonsToOrder"
                min="0"
                @input="calculateTotalPrice"
              />
            </li>
            <li class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div><span class="text-xl font-semibold">Total Price:</span></div>
              <span class="ml-4 font-medium text-xl">₱{{ newOrder.totalPrice }}</span>
            </li>
            <li class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div><span class="text-xl font-semibold">Payment:</span></div>
              <input
                class="ml-4 p-2 border rounded-md text-xl w-40"
                type="number"
                v-model.number="newOrder.payment"
                min="0"
              />
            </li>
            <li class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div><span class="text-xl font-semibold">Gallons to Return:</span></div>
              <input
                class="ml-4 p-2 border rounded-md text-xl w-40"
                type="number"
                v-model.number="newOrder.gallonsToReturn"
                min="0"
              />
            </li>
          </ul>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end mt-6">
          <button
            @click="submitOrder"
            class="px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Submit Order
          </button>
        </div>
      </div>
    </Dialog>
  </div>
</template>
