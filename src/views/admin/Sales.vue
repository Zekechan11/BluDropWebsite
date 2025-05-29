<script setup>
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { WATER_API } from "../../config";

const toast = useToast();

const salesData = ref({ area_reports: [], totals: null });
const loading = ref(false);
const selectedSale = ref(null);
const isModalOpen = ref(false);
const startDate = ref('');
const endDate = ref('');

const formatDateForAPI = (date) => {
    // Convert date to YYYY-MM-DD format
    return date instanceof Date 
        ? date.toISOString().split('T')[0]
        : date;
};

const fetchSalesData = async () => {
    if (!startDate.value || !endDate.value) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Please select both start and end dates.',
            life: 3000
        });
        return;
    }

    loading.value = true;
    try {
        const formattedStartDate = formatDateForAPI(startDate.value);
        const formattedEndDate = formatDateForAPI(endDate.value);

        const response = await axios.get(`${WATER_API}/api/get_sales_by_area`, {
            params: {
                start_date: formattedStartDate,
                end_date: formattedEndDate
            }
        });
        
        salesData.value = response.data;
    } catch (error) {
        console.error('API Error:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.error || 'Failed to load sales data.',
            life: 3000
        });
        salesData.value = { area_reports: [], totals: null };
    } finally {
        loading.value = false;
    }
};

const handleRowClick = (sale) => {
    selectedSale.value = sale;
    isModalOpen.value = true;
};

const downloadCSV = () => {
    if (!salesData.value.area_reports?.length) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No sales data available to download.',
            life: 3000
        });
        return;
    }

    const data = salesData.value.area_reports.map(report => ({
        'Area': report.area_name,
        'Total Orders': report.total_orders,
        'Gallons Sold': report.total_gallons_sold,
        'Gallons Returned': report.total_gallons_returned,
        'Revenue': report.total_revenue.toFixed(2),
        'Payments': report.total_payments.toFixed(2),
        'Outstanding Balance': report.outstanding_balance.toFixed(2)
    }));

    // Add totals row
    data.push({
        'Area': 'TOTAL',
        'Total Orders': salesData.value.totals.total_orders,
        'Gallons Sold': salesData.value.totals.total_gallons_sold,
        'Gallons Returned': salesData.value.totals.total_gallons_returned,
        'Revenue': salesData.value.totals.total_revenue.toFixed(2),
        'Payments': salesData.value.totals.total_payments.toFixed(2),
        'Outstanding Balance': salesData.value.totals.outstanding_balance.toFixed(2)
    });

    const csvContent = '\ufeff' + convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `sales_report_${startDate.value}_to_${endDate.value}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const convertToCSV = (data) => {
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
        headers.map(header => 
            typeof row[header] === 'string' && row[header].includes(',') 
                ? `"${row[header]}"` 
                : row[header]
        ).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
};

onMounted(() => {
    // Set default date range to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    startDate.value = formatDateForAPI(firstDay);
    endDate.value = formatDateForAPI(lastDay);
});
</script>

<template>
    <div class="space">
        <h1 class="text-4xl font-semibold mb-6" style="color: #899499;">
            Sales Reports
        </h1>
    </div>

    <div class="card shadow-md p-6">
        <!-- Filters -->
        <div class="flex justify-between items-center mb-6 gap-4">
            <div class="flex gap-4">
                <div class="flex flex-col">
                    <label class="mb-2 font-medium">Start Date</label>
                    <Calendar v-model="startDate" dateFormat="yy-mm-dd" :showIcon="true" />
                </div>
                <div class="flex flex-col">
                    <label class="mb-2 font-medium">End Date</label>
                    <Calendar v-model="endDate" dateFormat="yy-mm-dd" :showIcon="true" />
                </div>
            </div>
            
            <div class="flex gap-4">
                <Button 
                    label="Generate Report" 
                    icon="pi pi-refresh" 
                    @click="fetchSalesData" 
                    :loading="loading"
                    severity="primary"
                />
                <Button 
                    label="Download CSV" 
                    icon="pi pi-download" 
                    @click="downloadCSV" 
                    :disabled="!salesData.area_reports?.length"
                    severity="secondary"
                />
            </div>
        </div>

        <!-- Summary Section -->
        <div v-if="salesData.totals" class="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 class="text-xl font-semibold mb-3">Summary</h3>
            <div class="grid grid-cols-3 gap-4">
                <div>
                    <p class="text-gray-600">Total Orders</p>
                    <p class="text-xl font-semibold">{{ salesData.totals.total_orders }}</p>
                </div>
                <div>
                    <p class="text-gray-600">Total Revenue</p>
                    <p class="text-xl font-semibold">₱{{ salesData.totals.total_revenue.toFixed(2) }}</p>
                </div>
                <div>
                    <p class="text-gray-600">Outstanding Balance</p>
                    <p class="text-xl font-semibold">₱{{ salesData.totals.outstanding_balance.toFixed(2) }}</p>
                </div>
            </div>
        </div>

        <!-- Sales Data Table -->
        <DataTable 
            :value="salesData.area_reports" 
            :paginator="true" 
            :rows="10"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} areas"
            responsiveLayout="scroll"
            class="p-datatable-sm"
            v-if="salesData.area_reports?.length"
            @row-click="handleRowClick"
            selectionMode="single"
        >
            <Column field="area_name" header="Area" sortable></Column>
            <Column field="total_orders" header="Orders" sortable>
                <template #body="slotProps">
                    {{ slotProps.data.total_orders }}
                </template>
            </Column>
            <Column field="total_gallons_sold" header="Gallons Sold" sortable>
                <template #body="slotProps">
                    {{ slotProps.data.total_gallons_sold }}
                </template>
            </Column>
            <Column field="total_gallons_returned" header="Gallons Returned" sortable>
                <template #body="slotProps">
                    {{ slotProps.data.total_gallons_returned }}
                </template>
            </Column>
            <Column field="total_revenue" header="Revenue" sortable>
                <template #body="slotProps">
                    ₱{{ slotProps.data.total_revenue.toFixed(2) }}
                </template>
            </Column>
            <Column field="total_payments" header="Payments" sortable>
                <template #body="slotProps">
                    ₱{{ slotProps.data.total_payments.toFixed(2) }}
                </template>
            </Column>
            <Column field="outstanding_balance" header="Outstanding" sortable>
                <template #body="slotProps">
                    ₱{{ slotProps.data.outstanding_balance.toFixed(2) }}
                </template>
            </Column>
        </DataTable>

        <!-- No Data Message -->
        <div v-else-if="!loading" class="text-center py-8">
            <i class="pi pi-info-circle text-4xl text-gray-400 mb-4"></i>
            <p class="text-gray-500">No sales data available for the selected criteria.</p>
        </div>

        <!-- Detail Modal -->
        <Dialog 
            v-model:visible="isModalOpen" 
            :modal="true"
            header="Sale Details"
            :style="{ width: '450px' }"
        >
            <div v-if="selectedSale" class="space-y-4">
                <div class="flex justify-between">
                    <span class="font-medium">Area:</span>
                    <span>{{ selectedSale.area_name }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-medium">Total Orders:</span>
                    <span>{{ selectedSale.total_orders }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-medium">Gallons Sold:</span>
                    <span>{{ selectedSale.total_gallons_sold }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-medium">Gallons Returned:</span>
                    <span>{{ selectedSale.total_gallons_returned }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-medium">Revenue:</span>
                    <span>₱{{ selectedSale.total_revenue.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-medium">Payments:</span>
                    <span>₱{{ selectedSale.total_payments.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-medium">Outstanding Balance:</span>
                    <span>₱{{ selectedSale.outstanding_balance.toFixed(2) }}</span>
                </div>
            </div>
            <template #footer>
                <Button label="Close" icon="pi pi-times" @click="isModalOpen = false" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.p-datatable ::v-deep(.p-datatable-tbody > tr) {
    cursor: pointer;
}

.p-datatable ::v-deep(.p-datatable-tbody > tr:hover) {
    background-color: #f8f9fa;
}
</style>