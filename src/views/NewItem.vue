<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button color="primary"></ion-menu-button>
                </ion-buttons>
                <ion-title>Nová položka</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-alert :is-open="newItemError"
                   header="Chyba!"
                   :message="`V systému už existuje položka pro ${selectMonths[selectedMonth]}&nbsp;${selectedYear}`"
                   :buttons="['Zavřít']"
                   @didDismiss="setNewItemError(false)"></ion-alert>

        <ion-content :fullscreen="true">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">Nová položka</ion-title>
                </ion-toolbar>
            </ion-header>

            <form @submit.prevent="createItem">
                <!-- Select Inputs -->
                <IonItem>
                    <IonLabel>Vyberte měsíc</IonLabel>
                    <IonSelect v-model="selectedMonth" label="">
                        <IonSelectOption v-for="(option, i) in selectMonths" :key="i" :value="i">
                            {{ option }}
                        </IonSelectOption>
                    </IonSelect>
                </IonItem>
                <IonItem>
                    <IonLabel>Vyberte rok</IonLabel>
                    <IonSelect v-model="selectedYear" label="">
                        <IonSelectOption v-for="(option, i) in selectYears" :key="i" :value="option">
                            {{ option }}
                        </IonSelectOption>
                    </IonSelect>
                </IonItem>

                <ion-header collapse="condense" id="expensesHeader">
                    <ion-toolbar>
                        <ion-title size="normal">Vyberte okruhy financí</ion-title>
                    </ion-toolbar>
                </ion-header>

                <IonList>
                    <IonItem>
                        <IonCheckbox v-model="necessaryExpenses" label-placement="start">Nutné výdaje</IonCheckbox>
                    </IonItem>
                    <IonItem>
                        <IonCheckbox v-model="food" label-placement="start">Jídlo</IonCheckbox>
                    </IonItem>
                    <IonItem>
                        <IonCheckbox v-model="car" label-placement="start">Auto</IonCheckbox>
                    </IonItem>
                    <IonItem>
                        <IonCheckbox v-model="investments" label-placement="start">Investice</IonCheckbox>
                    </IonItem>
                    <IonItem>
                        <IonCheckbox v-model="kids" label-placement="start">Děti</IonCheckbox>
                    </IonItem>
                    <IonItem>
                        <IonCheckbox v-model="pets" label-placement="start">Domácí mazlíčci</IonCheckbox>
                    </IonItem>
                    <IonItem>
                        <IonCheckbox v-model="unexpectedExpenses" label-placement="start">Nečekané výdaje</IonCheckbox>
                    </IonItem>
                </IonList>

                <!-- Submit Button -->
                <IonButton expand="full" type="submit" id="submitButton">Vytvořit</IonButton>
            </form>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
    import {
        IonPage,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonItem,
        IonLabel,
        IonSelect,
        IonSelectOption,
        IonList,
        IonCheckbox,
        IonButton,
        IonAlert,
        IonButtons,
        IonMenuButton
    } from '@ionic/vue';
    import { useRouter } from 'vue-router';
    import { ref, computed, onBeforeMount } from 'vue'
    import { useStore } from 'vuex';

    // data
    const store = useStore();

    onBeforeMount(async () => {
        await store.dispatch('getLatestAppPageData');

        if (appLatestPageData.value != null) {
            necessaryExpenses.value = appLatestPageData.value.data.budget[0].enabled;
            food.value = appLatestPageData.value.data.budget[1].enabled;
            car.value = appLatestPageData.value.data.budget[2].enabled;
            investments.value = appLatestPageData.value.data.budget[3].enabled;
            kids.value = appLatestPageData.value.data.budget[4].enabled;
            pets.value = appLatestPageData.value.data.budget[5].enabled;
            unexpectedExpenses.value = appLatestPageData.value.data.budget[6].enabled;
        }
    });
    const isLoading = computed(() => store.state.isLoading);
    const appPages = computed(() => store.state.appPages);
    const sortedAppPagesLength = computed(() => appPages.value.length);
    const appLatestPageData = computed(() => store.state.appPageData);

    // router
    const router = useRouter();

    const date = new Date;

    // form vue models
    const selectedMonth = ref(date.getMonth());
    const selectedYear = ref(date.getFullYear());
    const necessaryExpenses = ref(true);
    const food = ref(true);
    const car = ref(true);
    const investments = ref(true);
    const kids = ref(true);
    const pets = ref(true);
    const unexpectedExpenses = ref(true);

    // allert handler
    const newItemError = ref(false);

    //data for selects
    const selectMonths = ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'];
    const selectYears = ref([]);
    const getYearsList = () => {
        const startYear = 2000;
        const endYear = new Date().getFullYear();
        for (let i = endYear; i >= startYear; i--) {
            selectYears.value = [...selectYears.value, i];
        }
    };

    getYearsList();

    // error setter
    const setNewItemError = (state: boolean) => {
        newItemError.value = state;
    };

    // creating new item
    const createItem = async () => {
        if (isLoading.value) return false; //check if menu data is loaded
        const month = selectMonths[selectedMonth.value];
        const normalizedMonth = month.normalize('NFKD').replace(/[^\w]/g, '');
        const newItem = {
            key: '' + normalizedMonth + '-' + selectedYear.value,
            title: month + ' ' + selectedYear.value,
            url: '/item/' + normalizedMonth + '-' + selectedYear.value,
            month: selectedMonth.value,
            year: selectedYear.value
        };

        
        for (var i=0 ; i < sortedAppPagesLength.value ; i++) //check for duplicate item
        {
            if (appPages.value[i].key == newItem.key) {
                setNewItemError(true);
                return false;
            }
        }

        const newItemData = {
            income: [],
            budget: [
                {
                    title: 'Nutné výdaje',
                    enabled: necessaryExpenses.value,
                    settings: {
                        budget: appLatestPageData.value ? appLatestPageData.value.data.budget[0].settings.budget : 0,
                        budgetPercents: appLatestPageData.value ? appLatestPageData.value.data.budget[0].settings.budgetPercents : 0
                    },
                    data: []
                },
                {
                    title: 'Jídlo',
                    enabled: food.value,
                    settings: {
                        budget: appLatestPageData.value ? appLatestPageData.value.data.budget[1].settings.budget : 0,
                        budgetPercents: appLatestPageData.value ? appLatestPageData.value.data.budget[1].settings.budgetPercents : 0
                    },
                    data: []
                },
                {
                    title: 'Auto',
                    enabled: car.value,
                    settings: {
                        budget: appLatestPageData.value ? appLatestPageData.value.data.budget[2].settings.budget : 0,
                        budgetPercents: appLatestPageData.value ? appLatestPageData.value.data.budget[2].settings.budgetPercents : 0
                    },
                    data: []

                },
                {
                    title: 'Investice',
                    enabled: investments.value,
                    settings: {
                        budget: appLatestPageData.value ? appLatestPageData.value.data.budget[3].settings.budget : 0,
                        budgetPercents: appLatestPageData.value ? appLatestPageData.value.data.budget[3].settings.budgetPercents : 0
                    },
                    data: []

                },
                {
                    title: 'Děti',
                    enabled: kids.value,
                    settings: {
                        budget: appLatestPageData.value ? appLatestPageData.value.data.budget[4].settings.budget : 0,
                        budgetPercents: appLatestPageData.value ? appLatestPageData.value.data.budget[4].settings.budgetPercents : 0
                    },
                    data: []

                },
                {
                    title: 'Domácí mazlíčci',
                    enabled: pets.value,
                    settings: {
                        budget: appLatestPageData.value ? appLatestPageData.value.data.budget[5].settings.budget : 0,
                        budgetPercents: appLatestPageData.value ? appLatestPageData.value.data.budget[5].settings.budgetPercents : 0
                    },
                    data: []
                }
                ,
                {
                    title: 'Nečekané výdaje',
                    enabled: unexpectedExpenses.value,
                    settings: {
                        budget: appLatestPageData.value ? appLatestPageData.value.data.budget[6].settings.budget : 0,
                        budgetPercents: appLatestPageData.value ? appLatestPageData.value.data.budget[6].settings.budgetPercents : 0
                    },
                    data: []
                }
            ]
        };
        await store.dispatch('insertToAppPages', {page: newItem, pageData: newItemData });
        router.push(newItem.url);
        return true;
    };
</script>

<style scoped>
#container {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  color: #8c8c8c;
  margin: 0;
}

#container a {
  text-decoration: none;
}

#expensesHeader {
    margin-top: 25px;
    margin-bottom: 5px;
}

#submitButton {
    margin-top: 25px;
}
</style>
