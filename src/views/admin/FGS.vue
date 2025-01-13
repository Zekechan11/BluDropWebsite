<script setup>
import { ref, onMounted } from "vue";
import { FilterMatchMode } from "@primevue/core/api";
import { useToast } from "primevue/usetoast";
import axios from "axios";

const toast = useToast();
const dt = ref();
const agents = ref([]);
const agentDialog = ref(false);
const agent = ref({});
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const submitted = ref(false);

// Fetch agents from the server
const fetchAgents = async () => {
    try {
        const response = await axios.get("http://localhost:9090/agent"); // Update endpoint if needed
        agents.value = response.data; // Store agents directly
    } catch (error) {
        console.error("Error fetching agents:", error);
    }
};

onMounted(async () => {
    await fetchAgents();
});

// Function to hide the agent dialog
const hideDialog = () => {
    agentDialog.value = false;
    submitted.value = false;
};

// Function to save or update an agent
const saveAgent = async () => {

};

const editAgent = (prod) => {
    agent.value = { ...prod };
    agentDialog.value = true; // Show the dialog for editing
};

</script>

<template>
    <div class="space">
        <h1 class="text-4xl font-semibold mb-6" style="color: #899499">Manage Agents FGS</h1>
    </div>

    <div>


        <!-- Card Component -->
        <Card style="width: 25rem; overflow: hidden" class="shadow-lg">
            <template #header>
                <h4 class="m-2 pt-2 text-center w-full">Guadalupe</h4>
            </template>

            <template #title>Ezekiel Angelo C. Pelayo</template>

            <template #subtitle>
                <p>FGS: </p>
            </template>

            <template #footer>
                <div class="flex gap-4 mt-1">
                    <Button label="Edit" severity="info" class="w-full" />
                    <Button label="Add" class="w-full" @click="agentDialog = true" />
                </div>
            </template>
        </Card>

        <Dialog v-model:visible="agentDialog" :style="{ width: '450px' }" header="Add Stock" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="ContainerOnLoan" class="block font-semibold mb-3">FGS</label>
                    <InputText id="ContainerOnLoan" v-model.trim="agent.ContainerOnLoan" required
                        :invalid="submitted && !agent.ContainerOnLoan" fluid />
                    <small v-if="submitted && !agent.ContainerOnLoan" class="text-red-500">Container on loan is
                        required.</small>
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" @click="saveAgent" />
            </template>
        </Dialog>

    </div>
</template>
