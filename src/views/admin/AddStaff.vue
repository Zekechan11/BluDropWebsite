<script setup>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { WATER_API } from '../../config';

const toast = useToast();
const dt = ref();
const staffs = ref([]);
const staffDialog = ref(false);
const deleteStafftDialog = ref(false);
const deleteStaffsDialog = ref(false);
const staff = ref({});
const selectedStaffs = ref();
const area = ref({});
const areas = ref([]);


const filters = ref({
    'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const submitted = ref(false);

const openNew = () => {
    staff.value = {};
    submitted.value = false;
    staffDialog.value = true;
};

const hideDialog = () => {
    staffDialog.value = false;
    submitted.value = false;
};

const fetchStaffs = async () => {
    try {
        const response = await axios.get(`${WATER_API}/v2/api/get_staff/all/Staff`);
        const data = response.data;

        staffs.value = data.map((staff) => {
            return {
                ...staff,
            };
        })
    } catch (error) {
        console.error("Error fetching staffs:", error);
    }
};

const fetchAreas = async () => {
    try {
        const response = await axios.get(`${WATER_API}/area`);
        const data = response.data;

        areas.value = data.map((area) => {
            return {
                ...area,
            };
        });
    } catch (error) {
        console.error("Error fetching areas:", error);
    }
};

const saveStaff = async () => {
    if (
        !staff.value.firstname ||
        !staff.value.lastname ||
        !area.value.area_name
    ) {
        toast.add({
            severity: 'warn',
            summary: 'Incomplete Form',
            detail: 'Please fill in all required fields.',
            life: 3000,
        });
        return;
    }
    
    submitted.value = true;

    if (!staff.value.staff || !staff.value.address)  {
        try {
            const payload = {
                firstname: staff.value.firstname,
                lastname: staff.value.lastname,
                area_id: area.value.area_name,
            }

            if (staff.value.staff_id) {
                const response = await axios.put(`${WATER_API}/v2/api/update_staff/${staff.value.staff_id}`, payload)
                staffs.value[findIndexById(response.data.data.value_id)] = staff.value;
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Staff Updated', life: 3000 });
            } else {
                const response = await axios.post(`${WATER_API}/v2/api/create_staff/Staff`, payload);
                staffs.value.push({
                    ...staff.value,
                    area: areas.value.find(a => a.id === area.value.area_name)?.area,
                    id: response.data.id
                });
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Staff Created', life: 3000 });
            }
            staffDialog.value = false;
            staff.value = {};
        } catch (error) {
            console.error("Failed to save staff:", error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save staff', life: 3000 });
        }
    }
};

const editStaff = (selectedStaff) => {
    staff.value = { ...selectedStaff };
    staffDialog.value = true;
};

const confirmDeleteStaff = (prod) => {
    staff.value = prod;
    deleteStafftDialog.value = true;
};

const deleteStaff = async () => {
    try {
        await axios.delete(`${WATER_API}/v2/api/delete_staff/${staff.value.staff_id}`);
        staffs.value = staffs.value.filter(val => val.staff_id !== staff.value.staff_id);
        deleteStafftDialog.value = false;
        staff.value = {};
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Staff Deleted', life: 3000 });
    } catch (error) {
        console.error("Failed to delete staff:", error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete staff', life: 3000 });
    }
};

const confirmDeleteSelected = () => {
    deleteStaffsDialog.value = true;
};

const deleteSelectedStaffs = async () => {
    try {
        for (const selected of selectedStaffs.value) {
            await axios.delete(`${WATER_API}/v2/api/delete_staff/${selected.staff_id}`);
        }
        staffs.value = staffs.value.filter(val => !selectedStaffs.value.includes(val));
        deleteStaffsDialog.value = false;
        selectedStaffs.value = null;
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Selected Staff Deleted', life: 3000 });
    } catch (error) {
        console.error("Failed to delete selected staff:", error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete selected staff', life: 3000 });
    }
};

const findIndexById = (id) => {
    return staffs.value.findIndex(staff => staff.id === id);
};

onMounted(() => {
    fetchStaffs();
    fetchAreas();
});
</script>



<template>
    <div class="space">
        <h1 class="text-4xl font-semibold mb-6" style="color: #899499;">
            Add Staff
        </h1>
    </div>
    <div>
        <div class="card shadow-md">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="New" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
                    <Button label="Delete" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected"
                        :disabled="!selectedStaffs || !selectedStaffs.length" />
                </template>
            </Toolbar>

            <DataTable ref="dt" v-model:selection="selectedStaffs" :value="staffs" dataKey="id" :paginator="true"
                :rows="10" :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} staffs">
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0 font-semibold">Manage Staff</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Search..." />
                        </IconField>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="firstname" header="First Name" sortable style="min-width: 12rem"></Column>
                <Column field="lastname" header="Last Name" sortable style="min-width: 12rem"></Column>
                <Column field="area" header="Address" sortable style="min-width: 16rem"></Column>

                <Column :exportable="false" header="Actions" style="min-width: 12rem;">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" v-tooltip.bottom="'Edit'" outlined rounded class="mr-2"
                            @click="editStaff(slotProps.data)" />
                        <Button icon="pi pi-trash" v-tooltip.bottom="'Delete'" outlined rounded severity="danger"
                            @click="confirmDeleteStaff(slotProps.data)" />
                    </template>
                </Column>
                <template #empty>
                    <div class="text-center text-gray-500 py-4">
                        <i class="pi pi-info-circle mr-2" />
                        No staff found.
                    </div>
                </template>
            </DataTable>
        </div>

        <Dialog v-model:visible="staffDialog" :style="{ width: '450px' }" header="Add Staff" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="firstname" class="block font-semibold mb-3">First Name</label>
                    <InputText id="firstname" v-model.trim="staff.firstname" required="true" autofocus
                        :invalid="submitted && !staff.firstname" fluid />
                    <small v-if="submitted && !staff.firstname" class="text-red-500">Name is required.</small>
                </div>
                <div>
                    <label for="lastname" class="block font-semibold mb-3">Last Name</label>
                    <InputText id="lastname" v-model.trim="staff.lastname" required="true" autofocus
                        :invalid="submitted && !staff.lastname" fluid />
                    <small v-if="submitted && !staff.lastname" class="text-red-500">Name is required.</small>
                </div>
                <div>
                    <!-- <label for="area" class="block font-semibold mb-3">Address</label>
                    <Dropdown id="area" v-model.trim="area.area_name" :options="areas" optionLabel="area"
                        optionValue="id" placeholder="Select an Area" />
                    <small v-if="submitted && !area.area_name" class="text-red-500">Area is required.</small> -->
                    <label for="area" class="block mb-2 font-semibold text-gray-700">Address</label>
                    <Dropdown id="area" v-model.trim="area.area_name" :options="areas" optionLabel="area"
                        optionValue="id" placeholder="Select an Area" class="w-full" />
                    <small v-if="submitted && !agent.area_name" class="text-red-600 text-xs mt-1 block">
                        Area is required.
                    </small>
                </div>

            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" @click="saveStaff" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteStafftDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="staff">Are you sure you want to delete <b>{{ staff.staff_name }}</b>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteStafftDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteStaff" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteStaffsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="staff">Are you sure you want to delete the selected staffs?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteStaffsDialog = false" />
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedStaffs" />
            </template>
        </Dialog>
    </div>
</template>

