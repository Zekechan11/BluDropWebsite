<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const WATER_API = 'http://localhost:9090';
const toast = useToast();
const dt = ref();
const remittances = ref([]);
const remittanceDialog = ref(false);
const deleteRemittanceDialog = ref(false);
const deleteRemittancesDialog = ref(false);
const remittance = ref({});
const selectedRemittances = ref();
const agents = ref([]);
const areas = ref([]);
const activeTab = ref('today');
const dateRange = ref({
    fromDate: new Date(),
    toDate: new Date()
});
const loading = ref(false);

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

// Area options - NEW
const areaOptions = ref([
    { name: 'All Areas', code: 'all' }
]);
const selectedArea = ref(areaOptions.value[0]);

const filters = ref({
    'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const submitted = ref(false);

const openNew = () => {
    remittance.value = {
        date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    };
    submitted.value = false;
    remittanceDialog.value = true;
};

const hideDialog = () => {
    remittanceDialog.value = false;
    submitted.value = false;
};

const fetchRemittances = async () => {
    loading.value = true;
    try {
        // Always use the main endpoint for all remittances
        let endpoint = `${WATER_API}/v2/api/get_remittances`;
        
        console.log('Fetching from endpoint:', endpoint); // Debug log
        
        const response = await axios.get(endpoint);
        console.log('API Response:', response.data); // Debug log
        
        // Process the data directly without remapping values to avoid losing data
        remittances.value = response.data;
        
        console.log('Processed remittances:', remittances.value); // Debug log
    } catch (error) {
        console.error("Error fetching remittances:", error);
        toast.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: error.response?.data?.error || 'Failed to fetch remittances', 
            life: 3000 
        });
    } finally {
        loading.value = false;
    }
};

const fetchAgents = async () => {
    try {
        const response = await axios.get(`${WATER_API}/v2/api/get_staff/all/Agent`);
        agents.value = response.data.map(agent => ({
            id: agent.staff_id,  // Use staff_id instead of id
            name: `${agent.firstname} ${agent.lastname}`,
            area_id: agent.area_id
        }));
        
        agentOptions.value = [
            { name: 'All Agents', code: 'all' },
            ...agents.value.map(agent => ({ 
                name: agent.name, 
                code: agent.id 
            }))
        ];
    } catch (error) {
        console.error("Error fetching agents:", error);
        toast.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: error.response?.data?.error || 'Failed to fetch agents', 
            life: 3000 
        });
    }
};

const fetchAreas = async () => {
    try {
        const response = await axios.get(`${WATER_API}/area`);
        console.log('Areas response:', response.data); // Debug log
        areas.value = response.data;
        
        // Populate area options dropdown - NEW
        areaOptions.value = [
            { name: 'All Areas', code: 'all' },
            ...areas.value.map(area => ({
                name: area.area,
                code: area.id
            }))
        ];
    } catch (error) {
        console.error("Error fetching areas:", error);
        toast.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: error.response?.data?.error || 'Failed to fetch areas', 
            life: 3000 
        });
    }
};

const saveRemittance = async () => {
    submitted.value = true;

    if (remittance.value.agent_id && remittance.value.date) {
        try {
            // Calculate expected amount based on your business logic
            const gallonPrice = await getGallonPrice();
            const expectedAmount = (remittance.value.gallons_sold * gallonPrice) - 
                                  (remittance.value.new_loans || 0) + 
                                  (remittance.value.loan_payments || 0);
            
            // Determine status
            const status = (remittance.value.amount_collected >= expectedAmount) ? 'INTACT' : 'SHORT';
            
            const payload = {
                date: remittance.value.date,
                agent_id: remittance.value.agent_id,
                area_id: remittance.value.area_id,
                gallons_loaded: remittance.value.gallons_loaded || 0,
                gallons_sold: remittance.value.gallons_sold || 0,
                gallons_credited: remittance.value.gallons_credited || 0,
                empty_returns: remittance.value.empty_returns || 0,
                loan_payments: remittance.value.loan_payments || 0,
                new_loans: remittance.value.new_loans || 0,
                amount_collected: remittance.value.amount_collected || 0,
                expected_amount: expectedAmount,
                status: status
            };

            console.log('Saving remittance payload:', payload); // Debug log

            if (remittance.value.id) {
                await axios.put(`${WATER_API}/v2/api/update_remittance/${remittance.value.id}`, payload);
                toast.add({ 
                    severity: 'success', 
                    summary: 'Successful', 
                    detail: 'Remittance Updated', 
                    life: 3000 
                });
            } else {
                await axios.post(`${WATER_API}/v2/api/create_remittance`, payload);
                toast.add({ 
                    severity: 'success', 
                    summary: 'Successful', 
                    detail: 'Remittance Created', 
                    life: 3000 
                });
            }
            
            remittanceDialog.value = false;
            remittance.value = {};
            fetchRemittances();
        } catch (error) {
            console.error("Failed to save remittance:", error);
            toast.add({ 
                severity: 'error', 
                summary: 'Error', 
                detail: error.response?.data?.error || 'Failed to save remittance', 
                life: 3000 
            });
        }
    }
};

const getGallonPrice = async () => {
    try {
        const response = await axios.get(`${WATER_API}/inventory_available`);
        return response.data[0]?.price || 250; // Default to 250 if price not found
    } catch (error) {
        console.error("Error fetching gallon price:", error);
        return 250; // Default price if API fails
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
        await axios.delete(`${WATER_API}/v2/api/delete_remittance/${remittance.value.id}`);
        deleteRemittanceDialog.value = false;
        toast.add({ 
            severity: 'success', 
            summary: 'Successful', 
            detail: 'Remittance Deleted', 
            life: 3000 
        });
        fetchRemittances();
    } catch (error) {
        console.error("Failed to delete remittance:", error);
        toast.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: error.response?.data?.error || 'Failed to delete remittance', 
            life: 3000 
        });
    } finally {
        remittance.value = {};
    }
};

const confirmDeleteSelected = () => {
    deleteRemittancesDialog.value = true;
};

const deleteSelectedRemittances = async () => {
    try {
        const deletePromises = selectedRemittances.value.map(remittance => 
            axios.delete(`${WATER_API}/v2/api/delete_remittance/${remittance.id}`)
        );
        
        await Promise.all(deletePromises);
        deleteRemittancesDialog.value = false;
        toast.add({ 
            severity: 'success', 
            summary: 'Successful', 
            detail: 'Selected Remittances Deleted', 
            life: 3000 
        });
        fetchRemittances();
    } catch (error) {
        console.error("Failed to delete selected remittances:", error);
        toast.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to delete selected remittances', 
            life: 3000 
        });
    } finally {
        selectedRemittances.value = null;
    }
};

const getFilteredRemittances = () => {
    let filtered = [...remittances.value];
    
    // Apply status filter
    if (selectedStatus.value.code !== 'all') {
        filtered = filtered.filter(rem => 
            rem.status && rem.status.toLowerCase() === selectedStatus.value.code.toLowerCase()
        );
    }
    
    // Apply agent filter
    if (selectedAgent.value.code !== 'all') {
        filtered = filtered.filter(rem => 
            rem.agent_id == selectedAgent.value.code
        );
    }
    
    // Apply area filter - NEW
    if (selectedArea.value.code !== 'all') {
        filtered = filtered.filter(rem => 
            rem.area_id == selectedArea.value.code
        );
    }
    
    return filtered;
};

// const generateReport = async () => {
//     loading.value = true;
//     try {
//         const startDate = formatDateForAPI(dateRange.value.fromDate);
//         const endDate = formatDateForAPI(dateRange.value.toDate);
        
//         console.log('Requesting report from:', startDate, 'to', endDate);
        
//         const response = await axios.get(`${WATER_API}/v2/api/get_remittances_by_date`, {
//             params: {
//                 start_date: startDate,
//                 end_date: endDate
//             }
//         });
        
//         console.log('Report data received:', response.data);
//         remittances.value = response.data;
        
//         toast.add({ 
//             severity: 'success', 
//             summary: 'Report Generated', 
//             detail: `Fetched ${response.data.length} records for report`, 
//             life: 3000 
//         });
//     } catch (error) {
//         console.error("Full error:", error);
//         console.error("Error response:", error.response);
//         // ... rest of error handling
//     }
// };

const generateReport = async () => {
    loading.value = true;
    try {
        const startDate = new Date(dateRange.value.fromDate);
        const endDate = new Date(dateRange.value.toDate);
        
        // If we haven't fetched all remittances yet, do that first
        if (remittances.value.length === 0) {
            await fetchRemittances();
        }
        
        // Filter locally
        remittances.value = remittances.value.filter(rem => {
            const remDate = new Date(rem.date);
            return remDate >= startDate && remDate <= endDate;
        });
        
        toast.add({ 
            severity: 'success', 
            summary: 'Report Generated', 
            detail: `Showing ${remittances.value.length} records for selected date range`, 
            life: 3000 
        });
    } catch (error) {
        // ... error handling
    } finally {
        loading.value = false;
    }
};

const formatDateForAPI = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // YYYY-MM-DD format
};

const exportToExcel = async () => {
    try {
        // Show loading toast
        toast.add({ 
            severity: 'info', 
            summary: 'Export', 
            detail: 'Preparing Excel export...', 
            life: 3000 
        });

        // Dynamically import xlsx library
        const xlsx = await import('xlsx');
        
        // Prepare data for export
        const dataToExport = remittances.value.map(remittance => ({
            Date: new Date(remittance.date).toLocaleDateString(),
            Agent: remittance.agent_name,
            Area: remittance.area,
            'Gallons Loaded': remittance.gallons_loaded,
            'Gallons Sold': remittance.gallons_sold,
            'Gallons Credited': remittance.gallons_credited,
            'Empty Returns': remittance.empty_returns,
            'Loan Payments': remittance.loan_payments,
            'New Loans': remittance.new_loans,
            'Amount Collected': remittance.amount_collected,
            'Expected Amount': remittance.expected_amount,
            Status: remittance.status
        }));

        // Create worksheet and workbook
        const worksheet = xlsx.utils.json_to_sheet(dataToExport);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Remittances');

        // Generate file name with current date
        const today = new Date();
        const fileName = `Remittances_${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}.xlsx`;

        // Export to Excel
        xlsx.writeFile(workbook, fileName);

        // Show success toast
        toast.add({ 
            severity: 'success', 
            summary: 'Export Successful', 
            detail: 'Excel file downloaded', 
            life: 3000 
        });
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        toast.add({ 
            severity: 'error', 
            summary: 'Export Failed', 
            detail: 'Failed to generate Excel file', 
            life: 3000 
        });
    }
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
                    label="All Remittances" 
                    text 
                    class="text-blue-500 border-blue-500 border-b-2"
                    @click="fetchRemittances()" 
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
                
                <label class="font-medium ml-4">Area:</label>
                <Dropdown 
                    v-model="selectedArea" 
                    :options="areaOptions" 
                    optionLabel="name" 
                    placeholder="All Areas" 
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
            
            <div v-if="selectedRemittances && selectedRemittances.length > 0">
                <Button 
                    label="Delete Selected" 
                    icon="pi pi-trash" 
                    severity="danger" 
                    @click="confirmDeleteSelected" 
                />
            </div>
        </div>

        <DataTable
            ref="dt"
            v-model:selection="selectedRemittances"
            :value="getFilteredRemittances()"
            dataKey="id"
            :paginator="true"
            :rows="10"
            :filters="filters"
            :loading="loading"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} remittances"
        >
            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            <Column field="date" header="Date" sortable>
                <template #body="{data}">
                    {{ new Date(data.date).toLocaleDateString() }}
                </template>
            </Column>
            <Column field="agent_name" header="Agent" sortable></Column>
            <Column field="area" header="Area" sortable></Column>
            <Column field="gallons_loaded" header="Gallons Loaded" sortable></Column>
            <Column field="gallons_sold" header="Gallons Sold" sortable></Column>
            <Column field="gallons_credited" header="Gallons Credited" sortable></Column>
            <Column field="empty_returns" header="Empty Returns" sortable></Column>
            <Column field="loan_payments" header="Loan Payments" sortable>
                <template #body="{data}">
                    ₱{{ data.loan_payments?.toFixed(2) || '0.00' }}
                </template>
            </Column>
            <Column field="new_loans" header="New Loans" sortable>
                <template #body="{data}">
                    ₱{{ data.new_loans?.toFixed(2) || '0.00' }}
                </template>
            </Column>
            <Column field="amount_collected" header="Amount Collected" sortable>
                <template #body="{data}">
                    ₱{{ data.amount_collected?.toFixed(2) || '0.00' }}
                </template>
            </Column>
            <Column field="expected_amount" header="Expected Amount" sortable>
                <template #body="{data}">
                    ₱{{ data.expected_amount?.toFixed(2) || '0.00' }}
                </template>
            </Column>
            <Column field="status" header="Status" sortable>
                <template #body="{data}">
                    <span :class="{
                        'bg-green-100 text-green-800 px-2 py-1 rounded': data.status === 'INTACT', 
                        'bg-red-100 text-red-800 px-2 py-1 rounded': data.status === 'SHORT',
                        'bg-yellow-100 text-yellow-800 px-2 py-1 rounded': data.status === 'PENDING'
                    }">
                        {{ data.status }}
                    </span>
                </template>
            </Column>
            <Column header="Actions" :exportable="false" style="min-width: 12rem">
                <template #body="slotProps">
                    <div class="flex gap-2">
                        <Button icon="pi pi-pencil" 
                            class="p-button-rounded p-button-warning p-button-sm" 
                            @click="editRemittance(slotProps.data)" 
                            v-tooltip.top="'Edit'"
                        />
                        <Button icon="pi pi-trash" 
                            class="p-button-rounded p-button-danger p-button-sm" 
                            @click="confirmDeleteRemittance(slotProps.data)" 
                            v-tooltip.top="'Delete'"
                        />
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
                <Button 
                    label="Generate Report" 
                    icon="pi pi-file" 
                    severity="info" 
                    @click="generateReport" 
                    :loading="loading" 
                />
                <Button 
                    label="Export to Excel" 
                    icon="pi pi-file-excel" 
                    severity="success" 
                    @click="exportToExcel" 
                    :disabled="remittances.length === 0" 
                />
            </div>
        </div>
        
        <div v-if="remittances.length === 0 && !loading" class="text-center text-gray-500 py-4">
            No remittance data available. Please generate a report.
        </div>
        
        <div v-if="remittances.length > 0" class="mt-4">
            <div class="grid grid-cols-3 gap-4">
                <div class="bg-blue-50 p-4 rounded-lg shadow">
                    <h3 class="text-lg font-semibold text-blue-700 mb-2">Total Gallons Sold</h3>
                    <p class="text-2xl">{{ remittances.reduce((sum, rem) => sum + (rem.gallons_sold || 0), 0) }}</p>
                </div>
                <div class="bg-green-50 p-4 rounded-lg shadow">
                    <h3 class="text-lg font-semibold text-green-700 mb-2">Total Amount Collected</h3>
                    <p class="text-2xl">₱{{ remittances.reduce((sum, rem) => sum + (rem.amount_collected || 0), 0).toFixed(2) }}</p>
                </div>
                <div class="bg-purple-50 p-4 rounded-lg shadow">
                    <h3 class="text-lg font-semibold text-purple-700 mb-2">Total Expected Amount</h3>
                    <p class="text-2xl">₱{{ remittances.reduce((sum, rem) => sum + (rem.expected_amount || 0), 0).toFixed(2) }}</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Dialogs -->
    <Dialog v-model:visible="remittanceDialog" :style="{ width: '650px' }" header="Remittance Details" :modal="true">
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label for="date" class="block font-semibold mb-2">Date</label>
                <Calendar id="date" v-model="remittance.date" dateFormat="yy-mm-dd" class="w-full" />
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

<style scoped>
.space {
    margin-bottom: 1.5rem;
}
</style>