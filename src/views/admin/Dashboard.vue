<script setup>
import axios from "axios";
import { ref, onMounted, computed, watch } from "vue";
import { WATER_API } from "../../config";
import { useToast } from "primevue/usetoast";
import { attempt } from "../../service/attempt";
import ErrorMessage from "../../components/ErrorMessage.vue"
import EmptyTableState from "../../components/EmptyTableState.vue"

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

  if (error) {
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

const filteredOrders = computed(() => orders.value.slice(0, 5))

</script>

<template>
  <div class="grid grid-cols-12 gap-8">
    <div v-tooltip.bottom="{
      value: 'View Total Customers',
      pt: {
        arrow: {
          style: {
            borderBottomColor: 'var(--p-primary-color)'
          }
        },
        text: '!bg-primary !text-primary-contrast !font-medium'
      }
    }" class="col-span-12 lg:col-span-6 xl:col-span-4 cursor-pointer" @click="customers = true">
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
          <template #empty>
            <EmptyTableState title="No recent customers found."
              description="Try refreshing your browser or check back later." />
          </template>
        </DataTable>
      </Dialog>
    </div>

    <div v-tooltip.bottom="{
      value: 'View Customers Order',
      pt: {
        arrow: {
          style: {
            borderBottomColor: 'var(--p-primary-color)'
          }
        },
        text: '!bg-primary !text-primary-contrast !font-medium'
      }
    }" class="col-span-12 lg:col-span-6 xl:col-span-4 cursor-pointer" @click="visible = true">
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
            <i class="pi pi-truck text-cyan-500 !text-4xl"></i>
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
          <template #empty>
            <EmptyTableState title="No recent delivery found."
              description="Try refreshing your browser or check back later." />
          </template>
        </DataTable>
      </Dialog>
    </div>

    <div v-tooltip.bottom="{
      value: 'Edit Gallon Price',
      pt: {
        arrow: {
          style: {
            borderBottomColor: 'var(--p-primary-color)'
          }
        },
        text: '!bg-primary !text-primary-contrast !font-medium'
      }
    }" class="col-span-12 lg:col-span-6 xl:col-span-4 cursor-pointer" @click="visible2 = true">
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
            <i class="pi pi-chart-line text-purple-500 !text-4xl"></i>
          </div>
        </div>
      </div>
    </div>

    <div class="col-span-12 xl:col-span-8">
      <div class="card shadow-md rounded-lg" style="background-color: #fbfcfc; border: 1px solid #e2e8f0;">
        <div class="font-semibold text-xl text-muted-color p-4">
          RECENT TRANSACTIONS
        </div>

        <div style="max-height: 400px; overflow-y: auto" class="px-4 pb-4">
          <DataTable :value="filteredOrders" resizableColumns columnResizeMode="fit" showGridlines
            tableStyle="min-width: 50rem" class="mt-4" stripedRows rowHover emptyMessage="">
            <Column header="Name" :style="{ minWidth: '180px' }">
              <template #body="slotProps">
                <div class="flex items-center space-x-3">
                  <img :src="'https://eu.ui-avatars.com/api/?name=' + slotProps.data.agent" alt="Profile"
                    class="w-10 h-10 object-cover rounded-full shadow" />
                  <span class="font-medium text-gray-900">
                    {{ slotProps.data.agent }}
                  </span>
                </div>
              </template>
            </Column>

            <Column field="area" header="Area" :style="{ minWidth: '120px' }">
              <template #body="slotProps">
                <span class="text-gray-700 font-normal">{{ slotProps.data.area }}</span>
              </template>
            </Column>

            <Column header="Status" :style="{ minWidth: '140px' }">
              <template #body="slotProps">
                <span :class="{
                  'bg-green-500 text-white font-semibold rounded-full py-1 px-3':
                    slotProps.data.status === 'Completed',
                  'bg-yellow-400 text-white font-semibold rounded-full py-1 px-3':
                    slotProps.data.status === 'Delayed',
                  'bg-blue-500 text-white font-semibold rounded-full py-1 px-3':
                    slotProps.data.status === 'Pending',
                }" class="uppercase tracking-wide text-xs">
                  {{
                  slotProps.data.status === 'Completed'
                  ? 'Complete'
                  : slotProps.data.status === 'Delayed'
                  ? 'Delayed'
                  : 'Pending'
                  }}
                </span>
              </template>
            </Column>

            <Column field="date" header="Date" :style="{ minWidth: '130px' }">
              <template #body="slotProps">
                <span class="text-gray-600 text-sm">
                  {{ new Date(slotProps.data.date).toLocaleDateString() }}
                </span>
              </template>
            </Column>
            <template #empty>
              <EmptyTableState title="No recent transactions found."
                description="Try adjusting your filters or check back later." />
            </template>
          </DataTable>
        </div>
      </div>
    </div>

    <div class="col-span-12 lg:col-span-6 xl:col-span-4">
      <div class="col-span-12 xl:col-span-4">
        <div class="card shadow-md rounded-lg bg-[#fbfcfc] p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="font-semibold text-xl text-muted-color">SCHEDULES</div>
            <div>
              <Button label="Save Schedule" icon="pi pi-fw pi-save" @click="saveSchedule" />
            </div>
          </div>

          <ul v-if="schedules.length > 0" class="list-none p-0 m-0 mb-4 space-y-2">
            <li v-for="(schedule, index) in schedules" :key="index" class="flex items-center justify-between py-2">
              <span class="leading-normal p-3 rounded w-full text-xl font-medium" :class="[
                schedule.color,
                schedule.type === true ? 'bg-green-300' : 'bg-gray-300'
              ]">
                {{ schedule.day }} ({{ schedule.date }})
              </span>

              <i v-if="schedule.type === true"
                class="pi pi-eye text-green-600 cursor-pointer ml-4 hover:text-green-700 transition-colors duration-200"
                @click="disableSchedule(index)" title="Disable Schedule"></i>
              <i v-else
                class="pi pi-eye-slash text-gray-500 cursor-pointer ml-4 hover:text-gray-700 transition-colors duration-200"
                @click="enableSchedule(index)" title="Enable Schedule"></i>
            </li>
          </ul>
          <ErrorMessage v-else message="Failed to load schedules."
            subMessage="Please try refreshing or check your internet connection." />
        </div>

        <!-- Modal -->
        <Dialog v-model:visible="visible2" modal header="Gallons Price" :style="{ width: '25rem' }">
          <div v-if="totalSales.pricing">
            <div class="flex items-center gap-4 mb-4">
              <label for="price" class="font-semibold w-24">Dealer {{ totalSales.pricing.dealer || "dd" }}</label>
              <InputText id="price" v-model="totalSales.pricing.dealer" class="w-full md:w-56"
                placeholder="Input pricing" />
            </div>
            <div class="flex items-center gap-4 mb-4">
              <label for="price" class="font-semibold w-24">Regular {{ totalSales.pricing.regular || "dd" }}</label>
              <InputText id="price" v-model="totalSales.pricing.regular" class="w-full md:w-56"
                placeholder="Input pricing" />
            </div>
            <div class="flex justify-end gap-2">
              <Button type="button" label="Cancel" severity="secondary" @click="visible2 = false"></Button>
              <Button type="button" label="Save" @click="savePrice(
                totalSales.pricing.regular,
                totalSales.pricing.dealer
              )
                "></Button>
            </div>
          </div>
          <ErrorMessage v-else message="Something went wrong."
            subMessage="Please try refreshing or check your internet connection." />
        </Dialog>
      </div>
    </div>
  </div>
</template>
