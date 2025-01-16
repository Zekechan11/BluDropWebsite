<script setup>
import { useLayout } from "@/layout/composables/layout";
import DatePicker from "primevue/datepicker";
import axios from "axios"; // Import Axios
import { ref, onMounted, computed } from "vue";
import { WATER_API } from "../../config";
import { useToast } from "primevue/usetoast";

const { getPrimary, getSurface, isDarkTheme } = useLayout();

const products = ref();
const schedule = ref(false);
const selectedCity1 = ref();
const totalCustomer = ref(0);
const orders = ref([]);
const visible = ref(false);
const customers = ref(false);
const schedules = ref([]);

const toast = useToast();

const orderCount = computed(() => orders.value.length);

const fetchOrders = async () => {
  try {
    const response = await axios.get(`${WATER_API}/api/get_order`);
    orders.value = response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
};

const fetchTotalCustomer = async () => {
  try {
    const response = await axios.get(`${WATER_API}/users/count`);
    totalCustomer.value = response.data.total_users;
  } catch (error) {
    console.error("Error fetching total users:", error);
  }
};

const fetchSchedules = async () => {
  try {
    const response = await axios.get(`${WATER_API}/api/admin/get_schedule`);
    schedules.value = response.data.days;
  } catch (error) {
    console.error("Error fetching schedules:", error);
  }
};


const saveSchedule = async () => {
  try {
    const payload = {};

    schedules.value.forEach(day => {
      payload[day.day.toLowerCase()] = day.type;
    });

    const response = await axios.put(`${WATER_API}/api/admin/update_schedule`, payload);
    if(response.data.success) {
      toast.add({
      severity: "success",
      summary: "Successful",
      detail: response.data.message,
      life: 3000,
    });
    }
  } catch (error) {
    console.error("Error updating schedule:", error);
  }
};


onMounted(() => {
  products.value = [
    {
      name: "Zeke",
      area: "Guadalupe",
      status: "complete",
      profileImage: "/demo/images/user.jpg",
    },
  ];
  fetchTotalCustomer();
  fetchOrders();
  fetchSchedules();
});

const selectedDay = ref(null);
const selectedArea = ref("");

const disableSchedule = (index) => {
  if (schedules.value[index]) {
    schedules.value[index].type = false;
  }
};

const enableSchedule = (index) => {
  if (schedules.value[index]) {
    schedules.value[index].type = true;
  }
}

const formatCurrency = (value) => {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
};
</script>

<template>
  <div class="grid grid-cols-12 gap-8">
    <div class="col-span-12 lg:col-span-6 xl:col-span-4 cursor-pointer" @click="customers = true">
      <div class="card mb-0 shadow-md">
        <div class="flex justify-between mb-4">
          <div>
            <span class="block text-muted-color font-medium mb-4">TOTAL CUSTOMERS</span>
            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
              {{ totalCustomer }}
            </div>
          </div>
          <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border"
            style="width: 5rem; height: 5rem">
            <i class="pi pi-users text-orange-500 !text-4xl"></i>
          </div>
        </div>
      </div>
      <Dialog v-model:visible="customers" modal header="Total Customer's" :style="{ width: '50rem' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">

        <div class="flex justify-end mb-4">
          <div class="flex items-center gap-2 w-auto">
            <label for="areaFilter" class="font-semibold">Filter Area:</label>
            <Dropdown id="areaFilter" v-model="selectedArea" :options="areaOptions" optionLabel="label"
              placeholder="Select an area" style="width: 12rem;" />
          </div>
        </div>

        <DataTable :value="filteredCustomers" showGridlines tableStyle="min-width: 40rem">
          <Column field="name" header="Name"></Column>
          <Column field="area" header="Area"></Column>
          <Column field="payables" header="Payables"></Column>
          <Column field="col" header="COL"></Column>
        </DataTable>
      </Dialog>

    </div>

    <div class="col-span-12 lg:col-span-6 xl:col-span-4 cursor-pointer" @click="visible = true">
      <div class="card mb-0 shadow-md">
        <div class="flex justify-between mb-4">
          <div>
            <span class="block text-muted-color font-medium mb-4">DELIVERY</span>
            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
              {{ orderCount }}
            </div>
          </div>
          <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border"
            style="width: 5rem; height: 5rem">
            <i class="pi pi-users text-cyan-500 !text-4xl"></i>
          </div>
        </div>
      </div>
      <Dialog v-model:visible="visible" modal header="Customer's Order" :style="{ width: '50rem' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <DataTable :value="orders" showGridlines tableStyle="min-width: 40rem">
          <Column field="name" header="Name"></Column>
          <Column field="Num_gallons_order" header="Quantity"></Column>
          <Column field="payable" header="Payables"></Column>
          <Column field="Date" header="Date"></Column>
        </DataTable>
      </Dialog>
    </div>

    <div class="col-span-12 lg:col-span-6 xl:col-span-4">
      <div class="card mb-0 shadow-md">
        <div class="flex justify-between mb-4">
          <div>
            <span class="block text-muted-color font-medium mb-4">MONTHLY SALES</span>
            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
              20,000
            </div>
          </div>
          <div class="flex items-center justify-center bg-green-100 dark:bg-purple-400/10 rounded-border"
            style="width: 5rem; height: 5rem">
            <i class="pi pi-paypal text-purple-500 !text-4xl"></i>
          </div>
        </div>
      </div>
    </div>

    <div class="col-span-12 xl:col-span-8">
      <div class="card shadow-md" style="background-color: #fbfcfc">
        <div class="font-semibold text-xl">AGENTS</div>
        <!-- Add a wrapper for scrollable table -->
        <div style="max-height: 400px; overflow-y: auto">
          <!-- Set your desired height here -->
          <DataTable :value="products" resizableColumns columnResizeMode="fit" showGridlines
            tableStyle="min-width: 50rem" class="mt-4">
            <Column header="Name">
              <template #body="slotProps">
                <div class="flex items-center">
                  <img :src="slotProps.data.profileImage" alt="Profile"
                    class="w-8 h-8 object-cover rounded-full mr-2" />
                  {{ slotProps.data.name }}
                </div>
              </template>
            </Column>
            <Column field="area" header="Area"></Column>
            <Column header="Status">
              <template #body="slotProps">
                <span :class="{
                  'bg-green-500 text-white font-semibold rounded py-1 px-2':
                    slotProps.data.status === 'complete',
                  'bg-yellow-500 text-white font-semibold rounded py-1 px-2':
                    slotProps.data.status === 'delayed',
                  'bg-blue-500 text-white font-semibold rounded py-1 px-2':
                    slotProps.data.status === 'ongoing',
                }">
                  {{
                    slotProps.data.status === "complete"
                      ? "Complete"
                      : slotProps.data.status === "delayed"
                        ? "Delayed"
                        : "Ongoing"
                  }}
                </span>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>

    <div class="col-span-12 lg:col-span-6 xl:col-span-4">
      <div class="col-span-12 xl:col-span-4">
        <div class="card shadow-md" style="background-color: #fbfcfc">
          <div class="flex items-center justify-between mb-6">
            <div class="font-semibold text-xl">SCHEDULES</div>
            <div>
              <Button label="Save Schedule" icon="pi pi-fw pi-save" @click="saveSchedule" />
            </div>
          </div>

          <ul class="p-0 mx-0 mt-0 mb-6 list-none">
            <li v-for="(schedule, index) in schedules" :key="index" class="flex items-center justify-between py-2">
              <span class="leading-normal p-2 rounded w-full text-xl font-medium" :class="(schedule.color,
              {
                'bg-green-300': schedule.type === true,
                'bg-gray-300': schedule.type === false,
              })
                ">
                {{ schedule.day }} ({{ schedule.date }})
              </span>
              <i
                v-if="schedule.type === true"
                class="pi pi-eye text-green-500 cursor-pointer ml-4"
                @click="disableSchedule(index)"></i>
              <i
                v-if="schedule.type === false"
                class="pi pi-eye-slash text-gray-500 cursor-pointer ml-4"
                @click="enableSchedule(index)"></i>
            </li>
          </ul>
        </div>

        <!-- Modal -->
        <Dialog v-model:visible="schedule" modal header="Add Schedule" :style="{ width: '25rem' }">
          <div class="flex items-center gap-4 mb-4">
            <label for="day" class="font-semibold w-24">Day</label>
            <DatePicker id="day" v-model="selectedDay" class="flex-auto" dateFormat="dd/mm/yy"
              placeholder="Select a date" />
          </div>
          <div class="flex items-center gap-4 mb-8">
            <label for="area" class="font-semibold w-24">Area</label>
            <Select v-model="selectedCity1" placeholder="Select Area" class="w-full md:w-56" />
          </div>
          <div class="flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="schedule = false"></Button>
            <Button type="button" label="Save" @click="saveSchedule"></Button>
          </div>
        </Dialog>
      </div>
    </div>
  </div>
</template>
