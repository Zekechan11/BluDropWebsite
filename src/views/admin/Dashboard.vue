<script setup>
import axios from "axios";
import { ref, onMounted, computed, watch } from "vue";
import { WATER_API } from "../../config";
import { useToast } from "primevue/usetoast";
import { attempt } from "../../service/attempt";

const products = ref();
const totalCustomer = ref(0);
const orders = ref([]);
const visible = ref(false);
const visible2 = ref(false);
const customers = ref(false);
const schedules = ref([]);
const totalSales = ref({});
const selectedArea = ref("");
const areas = ref([]);

const toast = useToast();

const orderCount = computed(() => orders.value.length);
const customerCount = computed(() => totalCustomer.value.length);

const fetchDashboardData = async () => {
  const [totalResponse, totalError] = await attempt(
    axios.get(`${WATER_API}/api/admin/dashboard`)
  );
  if (totalError) {
    console.error("Error fecthing total", totalError);
  } else {
    totalSales.value = totalResponse.data;
  }

  const [orderResponse, orderError] = await attempt(
    axios.get(`${WATER_API}/api/get_order`)
  );
  if (orderError) {
    console.error("Error fetching orders:", orderError);
  } else {
    orders.value = orderResponse.data;
  }

  const [customerCountResponse, customerCountError] = await attempt(
    axios.get(`${WATER_API}/v2/api/get_client/all`)
  );
  if (customerCountError) {
    console.error("Error fetching total users:", customerCountError);
  } else {
    totalCustomer.value = customerCountResponse.data.data;
  }

  const [scheduleResponse, scheduleError] = await attempt(
    axios.get(`${WATER_API}/api/admin/get_schedule`)
  );
  if (scheduleError) {
    console.error("Error fetching schedules:", scheduleError);
  } else {
    schedules.value = scheduleResponse.data.days;
  }

  const [areaResponse, areaError] = await attempt(
    axios.get(`${WATER_API}/area`)
  );
  if (areaError) {
    console.error("Error fecthing area", areaError)
  } else {
    const areaData = areaResponse.data;
    areas.value = areaData.map((area) => {
      return {
        label: area.area,
        value: area.id
      }
    });
  }
};

const saveSchedule = async () => {
  try {
    const payload = {};

    schedules.value.forEach((day) => {
      payload[day.day.toLowerCase()] = day.type;
    });

    const response = await axios.put(
      `${WATER_API}/api/admin/update_schedule`,
      payload
    );
    if (response.data.success) {
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


const savePrice = async (reg, dea) => {
  const payload = {
    dealer: parseFloat(dea),
    regular: parseFloat(reg),
  }
  
  const [, error] = await attempt(
    axios.put(`${WATER_API}/api/price/update`, payload)
  );

  if(error) {
    visible2.value = false;
    toast.add({
        severity: "error",
        summary: "Successful",
        detail: error,
        life: 3000,
      });
  } else {
    visible2.value = false;
    toast.add({
        severity: "success",
        summary: "Successful",
        detail: "response.data.message",
        life: 3000,
      });
  }
}


onMounted(() => {
  products.value = [
    {
      name: "Zeke",
      area: "Guadalupe",
      status: "complete",
      profileImage: "/demo/images/user.jpg",
    },
  ];

  fetchDashboardData();
});

const disableSchedule = (index) => {
  if (schedules.value[index]) {
    schedules.value[index].type = false;
  }
};

const enableSchedule = (index) => {
  if (schedules.value[index]) {
    schedules.value[index].type = true;
  }
};

const filteredCustomers = computed(() => {
  if (!selectedArea.value) {
    return totalCustomer.value;
  }
  return totalCustomer.value.filter(customer => customer.area === selectedArea.value.label);
})

const filteredOrders = computed(() => orders.value.slice(0 ,5))

</script>

<template>
  <div class="grid grid-cols-12 gap-8">
    <div class="col-span-12 lg:col-span-6 xl:col-span-4 cursor-pointer" @click="customers = true">
      <div class="card mb-0 shadow-md">
        <div class="flex justify-between mb-4">
          <div>
            <span class="block text-muted-color font-medium mb-4">TOTAL CUSTOMERS</span>
            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
              {{ customerCount || 0 }}
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
            <Dropdown id="areaFilter" v-model="selectedArea" :options="areas" optionLabel="label"
              placeholder="Select an area" style="width: 12rem" />
          </div>
        </div>

        <DataTable :value="filteredCustomers" showGridlines tableStyle="min-width: 40rem">
          <Column field="firstname" header="Firstname"></Column>
          <Column field="lastname" header="Lastame"></Column>
          <Column field="area" header="Area"></Column>
          <Column field="total_containers_on_loan" header="COL"></Column>
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
          <Column field="customer_fullname" header="Fullame"></Column>
          <Column field="num_gallons_order" header="Quantity"></Column>
          <Column field="agent" header="Agent"></Column>
          <Column field="total_price" header="Payables"></Column>
          <Column field="date" header="Date"></Column>
        </DataTable>
      </Dialog>
    </div>

    <div class="col-span-12 lg:col-span-6 xl:col-span-4" @click="visible2 = true">
      <div class="card mb-0 shadow-md">
        <div class="flex justify-between mb-4">
          <div>
            <span class="block text-muted-color font-medium mb-4">MONTHLY SALES</span>
            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
              ₱{{ totalSales.total_sales || 0 }}
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
          <DataTable :value="filteredOrders" resizableColumns columnResizeMode="fit" showGridlines
            tableStyle="min-width: 50rem" class="mt-4">
            <Column header="Name">
              <template #body="slotProps">
                <div class="flex items-center">
                  <img :src="'https://eu.ui-avatars.com/api/?name=' + slotProps.data.agent" alt="Profile"
                    class="w-8 h-8 object-cover rounded-full mr-2" />
                  {{ slotProps.data.agent }}
                </div>
              </template>
            </Column>
            <Column field="area" header="Area"></Column>
            <Column header="Status">
              <template #body="slotProps">
                <span :class="{
                    'bg-green-500 text-white font-semibold rounded py-1 px-2':
                      slotProps.data.status === 'Completed',
                    'bg-yellow-500 text-white font-semibold rounded py-1 px-2':
                      slotProps.data.status === 'Delayed',
                    'bg-blue-500 text-white font-semibold rounded py-1 px-2':
                      slotProps.data.status === 'Pending',
                  }">
                  {{
                  slotProps.data.status === "Completed"
                  ? "Complete"
                  : slotProps.data.status === "Delayed"
                  ? "Delayed"
                  : "Pending"
                  }}
                </span>
              </template>
            </Column>
            <Column field="date" header="Date"></Column>
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
              <span class="leading-normal p-2 rounded w-full text-xl font-medium" :class="
                  (schedule.color,
                  {
                    'bg-green-300': schedule.type === true,
                    'bg-gray-300': schedule.type === false,
                  })
                ">
                {{ schedule.day }} ({{ schedule.date }})
              </span>
              <i v-if="schedule.type === true" class="pi pi-eye text-green-500 cursor-pointer ml-4"
                @click="disableSchedule(index)"></i>
              <i v-if="schedule.type === false" class="pi pi-eye-slash text-gray-500 cursor-pointer ml-4"
                @click="enableSchedule(index)"></i>
            </li>
          </ul>
        </div>

        <!-- Modal -->
        <Dialog v-model:visible="visible2" modal header="Gallons Price" :style="{ width: '25rem' }">
          <div class="flex items-center gap-4 mb-4">
            <label for="price" class="font-semibold w-24">Dealer {{ totalSales.pricing.dealer || "dd" }}</label>
            <InputText id="price" v-model="totalSales.pricing.dealer" class="w-full md:w-56" placeholder="Input pricing" />
          </div>
          <div class="flex items-center gap-4 mb-4">
            <label for="price" class="font-semibold w-24">Regular {{ totalSales.pricing.regular || "dd" }}</label>
            <InputText id="price" v-model="totalSales.pricing.regular" class="w-full md:w-56" placeholder="Input pricing" />
          </div>
          <div class="flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="visible2 = false"></Button>
            <Button
              type="button"
              label="Save"
              @click="savePrice(
                totalSales.pricing.regular,
                totalSales.pricing.dealer
              )
              "></Button>
          </div>
        </Dialog>
      </div>
    </div>
  </div>
</template>
