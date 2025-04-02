<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const dt = ref();
const remittances = ref([]);
const remittanceDialog = ref(false);
const deleteRemittanceDialog = ref(false);
const deleteRemittancesDialog = ref(false);
const remittance = ref({});
const selectedRemittances = ref();
const agent = ref({});
const agents = ref([]);
const area = ref({});
const areas = ref([]);
const activeTab = ref('today');
const dateRange = ref({
    fromDate: '03/01/2025',
    toDate: '03/24/2025'
});

// Status options
const statuses = ref([
    { name: 'All Status', code: 'all' },
    { name: 'INTACT', code: 'intact' },
    { name: 'SHORT', code: 'short' }
]);
const selectedStatus = ref(statuses.value[0]);

// Agent options
const agentOptions = ref([
    { name: 'All Agents', code: 'all' }
]);
const selectedAgent = ref(agentOptions.value[0]);

const filters = ref({
    'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const submitted = ref(false);

// Dummy data for remittances
const dummyRemittances = [
    {
        id: 1,
        date: '03/24/2025',
        agent_name: 'Carlos Reyes',
        area: 'North District',
        gallons_loaded: 50,
        gallons_sold: 42,
        gallons_credited: 3,
        empty_returns: 38,
        loan_payments: 500.00,
        new_loans: 0.00,
        amount_collected: 10500.00,
        expected_amount: 10500.00,
        status: 'INTACT'
    },
    {
        id: 2,
        date: '03/24/2025',
        agent_name: 'Mark Santos',
        area: 'East District',
        gallons_loaded: 45,
        gallons_sold: 38,
        gallons_credited: 5,
        empty_returns: 32,
        loan_payments: 250.00,
        new_loans: 500.00,
        amount_collected: 9250.00,
        expected_amount: 9500.00,
        status: 'SHORT'
    },
    {
        id: 3,
        date: '03/24/2025',
        agent_name: 'Jenny Garcia',
        area: 'South District',
        gallons_loaded: 40,
        gallons_sold: 35,
        gallons_credited: 2,
        empty_returns: 33,
        loan_payments: 300.00,
        new_loans: 200.00,
        amount_collected: 8750.00,
        expected_amount: 8750.00,
        status: 'INTACT'
    }
];

// Dummy data for agents
const dummyAgents = [
    { id: 1, name: 'Carlos Reyes', area_id: 1 },
    { id: 2, name: 'Mark Santos', area_id: 2 },
    { id: 3, name: 'Jenny Garcia', area_id: 3 }
];

// Dummy data for areas
const dummyAreas = [
    { id: 1, area: 'North District' },
    { id: 2, area: 'East District' },
    { id: 3, area: 'South District' },
    { id: 4, area: 'West District' }
];

const openNew = () => {
    remittance.value = {
        date: new Date().toLocaleDateString('en-US')
    };
    submitted.value = false;
    remittanceDialog.value = true;
};

const hideDialog = () => {
    remittanceDialog.value = false;
    submitted.value = false;
};

const fetchRemittances = async () => {
    try {
        // In a real application, this would be an API call
        // const response = await axios.get(`${WATER_API}/v2/api/get_remittances`);
        // const data = response.data;
        
        // Using dummy data instead
        remittances.value = dummyRemittances.map((remittance) => {
            return {
                ...remittance,
            };
        });
    } catch (error) {
        console.error("Error fetching remittances:", error);
    }
};

const fetchAgents = async () => {
    try {
        // In a real application, this would be an API call
        // const response = await axios.get(`${WATER_API}/v2/api/get_agents`);
        // const data = response.data;
        
        // Using dummy data instead
        agents.value = dummyAgents.map((agent) => {
            return {
                ...agent,
            };
        });
        
        // Populate agent options
        agentOptions.value = [
            { name: 'All Agents', code: 'all' },
            ...agents.value.map(agent => ({ name: agent.name, code: agent.id }))
        ];
    } catch (error) {
        console.error("Error fetching agents:", error);
    }
};

const fetchAreas = async () => {
    try {
        // In a real application, this would be an API call
        // const response = await axios.get(`${WATER_API}/area`);
        // const data = response.data;
        
        // Using dummy data instead
        areas.value = dummyAreas.map((area) => {
            return {
                ...area,
            };
        });
    } catch (error) {
        console.error("Error fetching areas:", error);
    }
};

const saveRemittance = async () => {
    submitted.value = true;

    if (remittance.value.agent_name && remittance.value.date) {
        try {
            // Calculate expected amount (simple example)
            const gallonPrice = 250; // Example price per gallon
            const expectedAmount = (remittance.value.gallons_sold * gallonPrice) - 
                                  (remittance.value.new_loans || 0) + 
                                  (remittance.value.loan_payments || 0);
            
            // Determine status
            const status = (remittance.value.amount_collected >= expectedAmount) ? 'INTACT' : 'SHORT';
            
            const payload = {
                date: remittance.value.date,
                agent_id: remittance.value.agent_id,
                area_id: remittance.value.area_id,
                gallons_loaded: remittance.value.gallons_loaded,
                gallons_sold: remittance.value.gallons_sold,
                gallons_credited: remittance.value.gallons_credited,
                empty_returns: remittance.value.empty_returns,
                loan_payments: remittance.value.loan_payments,
                new_loans: remittance.value.new_loans,
                amount_collected: remittance.value.amount_collected,
                expected_amount: expectedAmount,
                status: status
            };

            if (remittance.value.id) {
                // In a real application, this would be an API call
                // await axios.put(`${WATER_API}/v2/api/update_remittance/${remittance.value.id}`, payload);
                
                // Update in local array
                const index = findIndexById(remittance.value.id);
                remittances.value[index] = { ...remittance.value, ...payload };
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Remittance Updated', life: 3000 });
            } else {
                // In a real application, this would be an API call
                // const response = await axios.post(`${WATER_API}/v2/api/create_remittance`, payload);
                
                // Add to local array
                const newRemittance = {
                    ...payload,
                    id: remittances.value.length + 1,
                    agent_name: agents.value.find(a => a.id === remittance.value.agent_id)?.name,
                    area: areas.value.find(a => a.id === remittance.value.area_id)?.area
                };
                remittances.value.push(newRemittance);
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Remittance Created', life: 3000 });
            }
            
            remittanceDialog.value = false;
            remittance.value = {};
        } catch (error) {
            console.error("Failed to save remittance:", error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save remittance', life: 3000 });
        }
    }
};

const editRemittance = (selectedRemittance) => {
    remittance.value = { ...selectedRemittance };
    remittanceDialog.value = true;
};

const confirmDeleteRemittance = (rem) => {
    remittance.value = rem;
    deleteRemittanceDialog.value = true;
};

const deleteRemittance = async () => {
    try {
        // In a real application, this would be an API call
        // await axios.delete(`${WATER_API}/v2/api/delete_remittance/${remittance.value.id}`);
        
        // Remove from local array
        remittances.value = remittances.value.filter(val => val.id !== remittance.value.id);
        deleteRemittanceDialog.value = false;
        remittance.value = {};
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Remittance Deleted', life: 3000 });
    } catch (error) {
        console.error("Failed to delete remittance:", error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete remittance', life: 3000 });
    }
};

const confirmDeleteSelected = () => {
    deleteRemittancesDialog.value = true;
};

const deleteSelectedRemittances = async () => {
    try {
        // In a real application, this would iterate through and delete each via API
        // for (const selected of selectedRemittances.value) {
        //     await axios.delete(`${WATER_API}/v2/api/delete_remittance/${selected.id}`);
        // }
        
        // Remove from local array
        remittances.value = remittances.value.filter(val => !selectedRemittances.value.includes(val));
        deleteRemittancesDialog.value = false;
        selectedRemittances.value = null;
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Selected Remittances Deleted', life: 3000 });
    } catch (error) {
        console.error("Failed to delete selected remittances:", error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete selected remittances', life: 3000 });
    }
};

const findIndexById = (id) => {
    return remittances.value.findIndex(rem => rem.id === id);
};

const filterByStatus = () => {
    if (selectedStatus.value.code === 'all') {
        return remittances.value;
    }
    return remittances.value.filter(rem => 
        rem.status.toLowerCase() === selectedStatus.value.code.toLowerCase()
    );
};

const filterByAgent = () => {
    if (selectedAgent.value.code === 'all') {
        return remittances.value;
    }
    return remittances.value.filter(rem => 
        rem.agent_id === selectedAgent.value.code || rem.agent_name === selectedAgent.value.name
    );
};

const getFilteredRemittances = () => {
    let filtered = [...remittances.value];
    
    // Apply status filter
    if (selectedStatus.value.code !== 'all') {
        filtered = filtered.filter(rem => 
            rem.status.toLowerCase() === selectedStatus.value.code.toLowerCase()
        );
    }
    
    // Apply agent filter
    if (selectedAgent.value.code !== 'all') {
        filtered = filtered.filter(rem => 
            rem.agent_id === selectedAgent.value.code || rem.agent_name === selectedAgent.value.name
        );
    }
    
    return filtered;
};

const generateReport = () => {
    // Logic to generate report based on date range
    toast.add({ severity: 'info', summary: 'Report', detail: 'Generating report...', life: 3000 });
};

const exportToExcel = () => {
    // Logic to export data to Excel
    toast.add({ severity: 'info', summary: 'Export', detail: 'Exporting to Excel...', life: 3000 });
};

const viewDetails = (remittance) => {
    // Logic to view remittance details
    toast.add({ severity: 'info', summary: 'View', detail: `Viewing details for ${remittance.agent_name}`, life: 3000 });
};

const editRecord = (remittance) => {
    // Logic to edit remittance record
    editRemittance(remittance);
};

onMounted(() => {
    fetchRemittances();
    fetchAgents();
    fetchAreas();
});
</script>

<template>
    <div class="space">
        <h1 class="text-4xl font-semibold mb-6" style="color: #299BE4;">
            Agent Remittance Tracking
        </h1>
    </div>
    
    <div class="card shadow-md">
        <div class="flex justify-between items-center mb-6">
            <div class="flex">
                <Button 
                    :class="{'text-blue-500 border-blue-500 border-b-2': activeTab === 'today'}"
                    label="Today's Remittances" 
                    text 
                    @click="activeTab = 'today'" 
                />
                <Button 
                    :class="{'text-blue-500 border-blue-500 border-b-2': activeTab === 'pending'}"
                    label="Pending Validations" 
                    text 
                    @click="activeTab = 'pending'" 
                />
                <Button 
                    :class="{'text-blue-500 border-blue-500 border-b-2': activeTab === 'history'}"
                    label="History" 
                    text 
                    @click="activeTab = 'history'" 
                />
            </div>
            <Button label="New Remittance Entry" icon="pi pi-plus" severity="info" @click="openNew" />
        </div>

        <div class="flex justify-between items-center mb-4">
            <div class="flex gap-4 items-center">
                <label class="font-medium">Agent:</label>
                <Dropdown 
                    v-model="selectedAgent" 
                    :options="agentOptions" 
                    optionLabel="name" 
                    placeholder="All Agents" 
                    class="w-40"
                />
                
                <label class="font-medium ml-4">Status:</label>
                <Dropdown 
                    v-model="selectedStatus" 
                    :options="statuses" 
                    optionLabel="name" 
                    placeholder="All Status" 
                    class="w-40"
                />
            </div>
            
            <!-- <div>
                <span class="p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText v-model="filters['global'].value" placeholder="Search..." />
                </span>
            </div> -->
        </div>

        <DataTable
            ref="dt"
            :value="getFilteredRemittances()"
            dataKey="id"
            :paginator="true"
            :rows="10"
            :filters="filters"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} remittances"
        >
            <!-- Removed the checkbox column -->
            <Column field="date" header="Date"></Column>
            <Column field="agent_name" header="Agent"></Column>
            <Column field="area" header="Area"></Column>
            <Column field="gallons_loaded" header="Gallons Loaded"></Column>
            <Column field="gallons_sold" header="Gallons Sold"></Column>
            <Column field="gallons_credited" header="Gallons Credited"></Column>
            <Column field="empty_returns" header="Empty Returns"></Column>
            <Column field="loan_payments" header="Loan Payments">
                <template #body="slotProps">
                    ₱{{ slotProps.data.loan_payments.toFixed(2) }}
                </template>
            </Column>
            <Column field="new_loans" header="New Loans">
                <template #body="slotProps">
                    ₱{{ slotProps.data.new_loans.toFixed(2) }}
                </template>
            </Column>
            <Column field="amount_collected" header="Amount Collected">
                <template #body="slotProps">
                    ₱{{ slotProps.data.amount_collected.toFixed(2) }}
                </template>
            </Column>
            <Column field="expected_amount" header="Expected Amount">
                <template #body="slotProps">
                    ₱{{ slotProps.data.expected_amount.toFixed(2) }}
                </template>
            </Column>
            <Column field="status" header="Status">
                <template #body="slotProps">
                    <span :class="{'bg-green-100 text-green-800 px-2 py-1 rounded': slotProps.data.status === 'INTACT', 
                                  'bg-red-100 text-red-800 px-2 py-1 rounded': slotProps.data.status === 'SHORT'}">
                        {{ slotProps.data.status }}
                    </span>
                </template>
            </Column>
            <Column header="Actions" :exportable="false" style="min-width: 10rem;">
                <template #body="slotProps">
                    <div class="flex">
                        <Button icon="pi pi-eye" v-tooltip.bottom="'View'" 
                            class="p-button-rounded p-button-info mr-2" 
                            @click="viewDetails(slotProps.data)" />
                        <Button icon="pi pi-pencil" v-tooltip.bottom="'Edit'" 
                            class="p-button-rounded p-button-warning" 
                            @click="editRecord(slotProps.data)" />
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>

    <div class="card shadow-md mt-6">
        <h2 class="text-2xl font-semibold mb-4" style="color: #299BE4;">
            Remittance Summary
        </h2>
        
        <div class="flex justify-between mb-6">
            <div class="flex items-center gap-4">
                <label class="font-medium">From Date:</label>
                <Calendar v-model="dateRange.fromDate" dateFormat="mm/dd/yy" />
            </div>
            <div class="flex items-center gap-4">
                <label class="font-medium">To Date:</label>
                <Calendar v-model="dateRange.toDate" dateFormat="mm/dd/yy" />
            </div>
            <div class="flex gap-2">
                <Button label="Generate Report" icon="pi pi-file" severity="info" @click="generateReport" />
                <Button label="Export to Excel" icon="pi pi-file-excel" severity="success" @click="exportToExcel" />
            </div>
        </div>
    </div>

    <!-- Dialogs -->
    <Dialog v-model:visible="remittanceDialog" :style="{ width: '650px' }" header="Remittance Details" :modal="true">
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label for="date" class="block font-semibold mb-2">Date</label>
                <Calendar id="date" v-model="remittance.date" dateFormat="mm/dd/yy" class="w-full" />
            </div>
            <div>
                <label for="agent" class="block font-semibold mb-2">Agent</label>
                <Dropdown id="agent" v-model="remittance.agent_id" :options="agents" optionLabel="name" 
                    optionValue="id" placeholder="Select an Agent" class="w-full" />
            </div>
            <div>
                <label for="area" class="block font-semibold mb-2">Area</label>
                <Dropdown id="area" v-model="remittance.area_id" :options="areas" optionLabel="area" 
                    optionValue="id" placeholder="Select an Area" class="w-full" />
            </div>
            <div>
                <label for="gallons_loaded" class="block font-semibold mb-2">Gallons Loaded</label>
                <InputNumber id="gallons_loaded" v-model="remittance.gallons_loaded" class="w-full" />
            </div>
            <div>
                <label for="gallons_sold" class="block font-semibold mb-2">Gallons Sold</label>
                <InputNumber id="gallons_sold" v-model="remittance.gallons_sold" class="w-full" />
            </div>
            <div>
                <label for="gallons_credited" class="block font-semibold mb-2">Gallons Credited</label>
                <InputNumber id="gallons_credited" v-model="remittance.gallons_credited" class="w-full" />
            </div>
            <div>
                <label for="empty_returns" class="block font-semibold mb-2">Empty Returns</label>
                <InputNumber id="empty_returns" v-model="remittance.empty_returns" class="w-full" />
            </div>
            <div>
                <label for="loan_payments" class="block font-semibold mb-2">Loan Payments</label>
                <InputNumber id="loan_payments" v-model="remittance.loan_payments" mode="currency" currency="PHP" 
                    locale="en-US" class="w-full" />
            </div>
            <div>
                <label for="new_loans" class="block font-semibold mb-2">New Loans</label>
                <InputNumber id="new_loans" v-model="remittance.new_loans" mode="currency" currency="PHP" 
                    locale="en-US" class="w-full" />
            </div>
            <div>
                <label for="amount_collected" class="block font-semibold mb-2">Amount Collected</label>
                <InputNumber id="amount_collected" v-model="remittance.amount_collected" mode="currency" currency="PHP" 
                    locale="en-US" class="w-full" />
            </div>
        </div>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
            <Button label="Save" icon="pi pi-check" @click="saveRemittance" />
        </template>
    </Dialog>

    <Dialog v-model:visible="deleteRemittanceDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex items-center gap-4">
            <i class="pi pi-exclamation-triangle text-3xl" />
            <span v-if="remittance">
                Are you sure you want to delete this remittance record for <b>{{ remittance.agent_name }}</b>?
            </span>
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" text @click="deleteRemittanceDialog = false" />
            <Button label="Yes" icon="pi pi-check" @click="deleteRemittance" />
        </template>
    </Dialog>

    <Dialog v-model:visible="deleteRemittancesDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex items-center gap-4">
            <i class="pi pi-exclamation-triangle text-3xl" />
            <span>Are you sure you want to delete the selected remittance records?</span>
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" text @click="deleteRemittancesDialog = false" />
            <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedRemittances" />
        </template>
    </Dialog>
</template>