<template>
    <ion-page v-if="hasAppPageData">
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button color="primary"></ion-menu-button>
                </ion-buttons>
                <ion-title>{{appPageData.page.title}}</ion-title>
                <ion-buttons slot="end" class="buttons-collapse">
                    <ion-button @click="openIncome" size="normal" slot="end">
                        <ion-icon slot="start" :icon="cashOutline"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">{{appPageData.page.title}}</ion-title>
                    <ion-button @click="openIncome" size="normal" slot="end">
                        Příjmy<ion-icon slot="end" :icon="cashOutline"></ion-icon>
                    </ion-button>
                </ion-toolbar>
            </ion-header>

            <template v-for="(item, i) in appPageData.data.budget">
                <ion-card v-if="item.enabled" :key="i">
                    <ion-card-header>
                        <ion-toolbar>
                            <ion-card-title>{{item.title}}</ion-card-title>
                            <ion-buttons slot="end">
                                <ion-button @click="openSettings(i)" size="large">
                                    <ion-icon :icon="settings" color="black"></ion-icon>
                                </ion-button>
                            </ion-buttons>
                        </ion-toolbar>
                    </ion-card-header>
                    <ion-card-content>
                        <ion-grid class="ion-text-center">
                            <ion-row>
                                <ion-col>
                                    <ion-text>Výdaje</ion-text>
                                    <ion-card-title>{{getTotalBudgetSpendings(i)}}&nbsp;{{appSettings.currencySymbol}}</ion-card-title>
                                </ion-col>
                                <ion-col>
                                    <ion-text>Zbývá</ion-text>
                                    <ion-card-title :class="getErrorClass(getTotalBudgetBalance(i))">{{getTotalBudgetBalance(i)}}&nbsp;{{appSettings.currencySymbol}}</ion-card-title>
                                </ion-col>
                            </ion-row>
                        </ion-grid>

                        <ion-list>
                            <template v-for="(item, k) in appPageData.data.budget[i].data">
                                <ion-item v-if="k < 3">
                                    <ion-grid>
                                        <ion-row class="align-items-center">
                                            <ion-col size="2">{{getDayFromISODate(item.date)}}.</ion-col>
                                            <ion-col size="7">{{item.name}}</ion-col>
                                            <ion-col size="3">-{{item.price}} {{}}</ion-col>
                                        </ion-row>
                                    </ion-grid>
                                </ion-item>
                            </template>
                        </ion-list>
                        <ion-grid class="ion-text-center">
                            <ion-row>
                                <ion-col size="12">
                                    <ion-button @click="openDetail(i)">Detail</ion-button>
                                </ion-col>
                            </ion-row>
                        </ion-grid>
                    </ion-card-content>
                </ion-card>
            </template>

            <ion-modal :is-open="isSettingsOpen">
                <ion-header>
                    <ion-toolbar>
                        <ion-title>Nastavení</ion-title>
                        <ion-buttons slot="end">
                            <ion-button @click="closeSettings()">Zavřít</ion-button>
                        </ion-buttons>
                    </ion-toolbar>
                </ion-header>
                <ion-content class="ion-padding">
                    <ion-radio-group v-model="setingsRadioButtons">
                        <ion-row>
                            <ion-col>
                                <ion-item>
                                    <ion-label>Částka</ion-label>
                                    <ion-radio value="budget" mode="md" item-left></ion-radio>
                                </ion-item>
                            </ion-col>

                            <ion-col>
                                <ion-item>
                                    <ion-label>Procenta</ion-label>
                                    <ion-radio value="percents" mode="md" item-left :disabled="settingsBudgetPercentsDisabled"></ion-radio>
                                </ion-item>
                            </ion-col>
                        </ion-row>
                    </ion-radio-group>

                    <ion-item v-show="setingsRadioButtons === 'budget'">
                        <ion-input label-placement="stacked" type="number" label="Přesný budget" v-model="settingsBudget" min="0"></ion-input>
                    </ion-item>
                    <ion-item class="ion-padding" v-show="setingsRadioButtons === 'percents'">
                        <ion-range aria-label="Custom range" :pin="true" :ticks="true" :min="0" :max="staticSettingsBudgetPercents" v-model="settingsBudgetPercents"></ion-range>
                    </ion-item>

                    <ion-button expand="full" @click="saveSettings">Uložit</ion-button>
                </ion-content>
            </ion-modal>

            <ion-modal :is-open="isIncomeOpen">
                <ion-header>
                    <ion-toolbar>
                        <ion-title>Příjmy {{appPageData.page.title}}</ion-title>
                        <ion-buttons slot="end">
                            <ion-button @click="closeIncome()">Zavřít</ion-button>
                        </ion-buttons>
                    </ion-toolbar>
                </ion-header>
                <ion-content class="ion-padding">
                    <ion-grid>
                        <ion-row>
                            <ion-col>
                                <h3>Příjmy celkem:</h3>
                            </ion-col>
                            <ion-col>
                                <h3>{{getTotalIncome()}}&nbsp;{{appSettings.currencySymbol}}</h3>
                            </ion-col>
                        </ion-row>
                        <ion-row class="ion-text-center">
                            <ion-col>
                                <ion-button @click="showCreateIncomeAlert">
                                    <ion-icon slot="start" :icon="add"></ion-icon>Přidat příjem
                                </ion-button>
                            </ion-col>
                        </ion-row>
                    </ion-grid>

                    <ion-list>
                        <ion-item v-for="(item, i) in appPageData.data.income">
                            <ion-grid>
                                <ion-row class="align-items-center">
                                    <ion-col size="2">{{getDayFromISODate(item.date)}}.</ion-col>
                                    <ion-col size="5">{{item.name}}</ion-col>
                                    <ion-col size="3">+{{item.price}}</ion-col>
                                    <ion-col size="2">
                                        <ion-buttons>
                                            <ion-button @click="showIncomeDeleteAlert(i)">
                                                <ion-icon slot="end" :icon="trash"></ion-icon>
                                            </ion-button>
                                        </ion-buttons>
                                    </ion-col>
                                </ion-row>
                            </ion-grid>
                        </ion-item>
                    </ion-list>
                    <ion-title v-if="appPageData.data.income.length < 1">Zatím nemáte zadané<br>žádné příjmy</ion-title>

                </ion-content>
            </ion-modal>

            <ion-modal :is-open="isDetailOpen">
                <ion-header>
                    <ion-toolbar>
                        <ion-title>Výdaje: {{appPageData.data.budget[activeDetail].title}}</ion-title>
                        <ion-buttons slot="end">
                            <ion-button @click="closeDetail()">Zavřít</ion-button>
                        </ion-buttons>
                    </ion-toolbar>
                </ion-header>
                <ion-content class="ion-padding">
                    <ion-grid>
                        <ion-row class="ion-text-center">
                            <ion-col size="6">
                                <ion-label>Výdaje celkem</ion-label>
                            </ion-col>
                            <ion-col size="6">
                                <ion-label>Nastavený budget</ion-label>
                            </ion-col>
                            <ion-col size="6"><strong>{{getTotalBudgetSpendings(activeDetail)}}&nbsp;{{appSettings.currencySymbol}}</strong></ion-col>
                            <ion-col size="6"><strong>{{getBudgetSettings(activeDetail)}}&nbsp;{{appSettings.currencySymbol}}</strong></ion-col>
                            <ion-col size="12">
                                <ion-label>Zbývá</ion-label>
                            </ion-col>
                            <ion-col size="12" class="spending-budget">
                                <span :class="getErrorClass(getTotalBudgetBalance(activeDetail))"><strong>{{getTotalBudgetBalance(activeDetail)}}&nbsp;{{appSettings.currencySymbol}}</strong></span>
                            </ion-col>
                        </ion-row>
                        <ion-row class="ion-text-center">
                            <ion-col>
                                <ion-button @click="showCreateSpendingAlert">
                                    <ion-icon slot="start" :icon="add"></ion-icon>Přidat výdaj
                                </ion-button>
                            </ion-col>
                        </ion-row>
                    </ion-grid>

                    <ion-list>
                        <ion-item v-for="(item, i) in appPageData.data.budget[activeDetail].data">
                            <ion-grid>
                                <ion-row class="align-items-center">
                                    <ion-col size="2">{{getDayFromISODate(item.date)}}.</ion-col>
                                    <ion-col size="5">{{item.name}}</ion-col>
                                    <ion-col size="3">-{{item.price}}</ion-col>
                                    <ion-col size="2">
                                        <ion-buttons>
                                            <ion-button @click="showSpendingDeleteAlert(i)">
                                                <ion-icon slot="end" :icon="trash"></ion-icon>
                                            </ion-button>
                                        </ion-buttons>
                                    </ion-col>
                                </ion-row>
                            </ion-grid>
                        </ion-item>
                    </ion-list>
                    <ion-title v-if="appPageData.data.budget[activeDetail].data.length < 1">Zatím nemáte zadané<br>žádné výdaje</ion-title>

                </ion-content>
            </ion-modal>
        </ion-content>

        <ion-footer>
            <ion-toolbar>
                <ion-grid>
                    <ion-row class="align-items-center ion-text-center">
                        <ion-col size="6">Výdaje celkem</ion-col>
                        <ion-col size="6">Zbývá celkem</ion-col>
                    </ion-row>
                    <ion-row class="align-items-center ion-text-center">
                        <ion-col size="6"><strong>{{getTotalSpendings()}}&nbsp;{{appSettings.currencySymbol}}</strong></ion-col>
                        <ion-col size="6" :class="getErrorClass(getTotalIncome() - getTotalSpendings())"><strong>{{getTotalIncome() - getTotalSpendings()}}&nbsp;{{appSettings.currencySymbol}}</strong></ion-col>
                    </ion-row>
                </ion-grid>
            </ion-toolbar>
        </ion-footer>
    </ion-page>

    <ion-page v-else>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button color="primary"></ion-menu-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <ion-header collapse="condense">
                <ion-toolbar class="ion-text-center">
                    <ion-text>
                        <h4>Zatím nemáte žádná data.</h4>
                    </ion-text>
                    <ion-button size="normal" class="ion-text-center" router-direction="root" :router-link="newItemURL">
                        <ion-icon slot="start" :icon="add"></ion-icon>Vytvořit novou položku
                    </ion-button>
                </ion-toolbar>
            </ion-header>
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
        IonInput,
        IonList,
        IonCheckbox,
        IonButton,
        IonButtons,
        IonMenuButton,
        IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle,
        IonModal,
        IonRange,
        IonRadio,
        IonRadioGroup,
        IonIcon,
        IonText,
        IonCol,
        IonRow,
        IonGrid,
        alertController,
        IonFooter
    } from '@ionic/vue';
    import {
        add,
        settings,
        cashOutline,
        trash
    } from 'ionicons/icons';
    import { useRoute, useRouter } from 'vue-router';
    import { ref, computed, onBeforeMount } from 'vue'
    import { useStore } from 'vuex';

    // route
    const route = useRoute();

    // page data
    const store = useStore();
    const isLoading = ref(false);

    onBeforeMount(async () => {
        isLoading.value = true;
        await store.dispatch('getAppPageData', route.params.id);
        await store.dispatch('getMaxSettingsPercents', route.params.id);
        if (store.state.hasAppPageData) {
            initializeDate();
        }
        isLoading.value = false;
    });

    const appPageData = computed(() => store.state.appPageData);
    const hasAppPageData = computed(() => store.state.hasAppPageData);
    const appSettings = computed(() => store.state.appSettings);


    // date
    let date: Date;
    const initializeDate = () => {
        date = new Date(appPageData.value.page.year, appPageData.value.page.month, 2);
    };
    const getDateInputMinValue = () => {
        return new Date(date.getFullYear(), date.getMonth() + 0, 2).toISOString().split('T')[0];
    };
    const getDateInputMaxValue = () => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString().split('T')[0];
    };
    const getDateInputDefaultValue = () => {
        return date.toISOString().split('T')[0];
    };



    const newItemURL = '/item/New'

    /////////////////////
    // settings start
    /////////////////////
    const isSettingsOpen = ref(false);
    let activeIndex = -1;
    const settingsBudget = ref(0);
    const settingsBudgetPercents = ref(0);
    const setingsRadioButtons = ref('budget');
    const maxSettingsPercents = computed(() => store.state.maxSettingsPercents);
    const settingsBudgetPercentsDisabled = ref(false);
    // this handles max value in percent range
    const staticSettingsBudgetPercents = ref(0);
    const openSettings = (settingsIndex: number) => {
        activeIndex = settingsIndex;

        settingsBudget.value = appPageData.value.data.budget[activeIndex].settings.budget;
        settingsBudgetPercents.value = appPageData.value.data.budget[activeIndex].settings.budgetPercents;
        staticSettingsBudgetPercents.value = settingsBudgetPercents.value + maxSettingsPercents.value;

        // check right radio button
        if (settingsBudgetPercents.value > 0){
            setingsRadioButtons.value = 'percents';
            settingsBudgetPercentsDisabled.value = false;
        } else{
            setingsRadioButtons.value = 'budget';
            if (maxSettingsPercents.value <= 0) settingsBudgetPercentsDisabled.value = true;
        }
        isSettingsOpen.value = true;
    };
    const closeSettings = () => {
        isSettingsOpen.value = false;
    };

    const getSettingsBudget = (checkboxValue: string) => {
        if (checkboxValue === 'budget'){
            return settingsBudget.value;
        }
        return 0
    };

    const getSettingsBudgetPercents = (checkboxValue: string) => {
        if (checkboxValue === 'percents'){
            return settingsBudgetPercents.value;
        }
        return 0
    };

    const saveSettings = async () => {
        const data = {
            key: appPageData.value.page.key,
            index: activeIndex,
            settings: {
                budget: parseInt(getSettingsBudget(setingsRadioButtons.value)),
                budgetPercents: getSettingsBudgetPercents(setingsRadioButtons.value)
            }
        }
        await store.dispatch('saveAppPageDataSettings', data);
        await store.dispatch('getAppPageData', route.params.id);
        closeSettings();
    };

    
    /////////////////////
    // income start
    /////////////////////
    const isIncomeOpen = ref(false);
    const openIncome = () => {
        isIncomeOpen.value = true;
    };
    const closeIncome = () => {
        isIncomeOpen.value = false;
    };
    const saveIncome = async (income: object) => {
        const data = {
            key: appPageData.value.page.key,
            income: {
                name: income.name,
                price: parseInt(income.price),
                date: income.date
            }
        }
        await store.dispatch('addAppPageDataIncome', data);
        await store.dispatch('getAppPageData', route.params.id);
    };
    const getDayFromISODate = (isoDate: string) => {
        let date = new Date(isoDate);
        return date.getDate(); 
    };
    const showIncomeDeleteAlert = async (index: number) => {
        const alert = await alertController.create({
            header: `Přejete si smazat položku?`,
            buttons: [
                {
                    text: 'Zrušit',
                    role: 'cancel',
                    handler: async () => {
                        console.log('Action canceled');
                    },
                },
                {
                    text: 'OK',
                    role: 'confirm',
                    handler: async () => {
                        console.log('Action confirmed');
                        await store.dispatch('deleteAppPageDataIncome', {key: route.params.id, index: index});
                        await store.dispatch('getAppPageData', route.params.id);
                    },
                },
            ]
        });
        await alert.present();
    };
    const showCreateIncomeAlert = async () => {
        const alert = await alertController.create({
            header: 'Přidat příjem',
            message: 'Vyplňte informace o novém příjmu.',
            inputs: [
                {
                    name: 'name',
                    type: 'text',
                    placeholder: 'Výplata',
                    label: 'Titulek'
                },
                {
                    name: 'price',
                    type: 'number',
                    placeholder: '50000 ' + appSettings.value.currencySymbol,
                    label: 'Příjem'
                },
                {
                    name: 'date',
                    type: 'date',
                    label: 'Datum',
                    value: getDateInputDefaultValue(),
                    min: getDateInputMinValue(),
                    max: getDateInputMaxValue(),
                },
            ],
            buttons: [
                { 
                    text: 'Zrušit',
                    role: 'cancel'
                },
                {
                    text: 'Ok',
                    handler: (alertData) => {
                        if (alertData.name != '' && alertData.price > 0 && !isNaN(alertData.price)){
                            saveIncome(alertData);
                        }
                    }
                }
            ]
        });
        await alert.present();
    };
    const getTotalIncome = () => {
        let totalIncome = 0;
        appPageData.value.data.income.forEach((element: object) => {
            totalIncome += element.price;
        });
        return totalIncome;
    };


    /////////////////////
    // spendings detail start
    /////////////////////
    const isDetailOpen = ref(false);
    const activeDetail = ref(-1)
    const openDetail = (index: number) => {
        activeDetail.value = index
        isDetailOpen.value = true;
    };
    const closeDetail = () => {
        isDetailOpen.value = false;
    };
    const showCreateSpendingAlert = async () => {
        const alert = await alertController.create({
            header: 'Přidat výdaj',
            message: 'Vyplňte informace o novém výdaji.',
            inputs: [
                {
                    name: 'name',
                    type: 'text',
                    placeholder: 'Nájem',
                    label: 'Titulek'
                },
                {
                    name: 'price',
                    type: 'number',
                    placeholder: '15000 ' + appSettings.value.currencySymbol,
                    label: 'Výdaj'
                },
                {
                    name: 'date',
                    type: 'date',
                    label: 'Datum',
                    value: getDateInputDefaultValue(),
                    min: getDateInputMinValue(),
                    max: getDateInputMaxValue(),
                },
            ],
            buttons: [
                { 
                    text: 'Zrušit',
                    role: 'cancel'
                },
                {
                    text: 'Ok',
                    handler: (alertData) => {
                        if (alertData.name != '' && alertData.price > 0 && !isNaN(alertData.price)){
                            saveSpending(alertData);
                        }
                    }
                }
            ]
        });
        await alert.present();
    };
    const showSpendingDeleteAlert = async (index: number) => {
        const alert = await alertController.create({
            header: `Přejete si smazat položku?`,
            buttons: [
                {
                    text: 'Zrušit',
                    role: 'cancel',
                    handler: async () => {
                        console.log('Action canceled');
                    },
                },
                {
                    text: 'OK',
                    role: 'confirm',
                    handler: async () => {
                        console.log('Action confirmed');
                        await store.dispatch('deleteAppPageDataSpending', {key: route.params.id, dataIndex: index, budgetIndex: activeDetail.value});
                        await store.dispatch('getAppPageData', route.params.id);
                    },
                },
            ]
        });
        await alert.present();
    };
    const saveSpending = async (spending: object) => {
        const data = {
            key: appPageData.value.page.key,
            index: activeDetail.value,
            spending: {
                name: spending.name,
                price: parseInt(spending.price),
                date: spending.date
            }
        }
        await store.dispatch('addAppPageDataSpending', data);
        await store.dispatch('getAppPageData', route.params.id);
    };
    const getTotalBudgetSpendings = (index: number) => {
        let totalSpendings = 0;
        appPageData.value.data.budget[index].data.forEach((element: object) => {
            totalSpendings += element.price;
        });
        return totalSpendings;
    };
    const getTotalSpendings = () => {
        let totalSpendings = 0;
        appPageData.value.data.budget.forEach((element: object) => {
            element.data.forEach((element: object) => {
                totalSpendings += element.price
            });
        });
        return totalSpendings;
    };
    const getTotalSettingsBudget = () => {
        let totalBudget = 0;
        appPageData.value.data.budget.forEach((element: object) => {
            totalBudget += element.settings.budget;
        });
        return totalBudget;
    };
    const getTotalBudgetBalance = (index: number) => {
        let settings = appPageData.value.data.budget[index].settings;
        if (settings.budget > 0){
            let totalSpendings = getTotalBudgetSpendings(index);
            return settings.budget - totalSpendings;
        };
        if (settings.budgetPercents > 0){
            let totalSpendings = getTotalSettingsBudget();
            let totalIncome = getTotalIncome();
            let totalBudgetSpendings = getTotalBudgetSpendings(index);
            if ((totalIncome - totalSpendings) <= 0 ) return 0;
            return ((totalIncome - totalSpendings) * (settings.budgetPercents / 100)) - totalBudgetSpendings;
        }
        return 0;
    };
    const getBudgetSettings = (index: number) => {
        let settings = appPageData.value.data.budget[index].settings;
        if (settings.budget > 0){
            return settings.budget;
        };
        if (settings.budgetPercents > 0){
            let totalSpendings = getTotalSettingsBudget();
            let totalIncome = getTotalIncome();
            let totalBudgetSpendings = getTotalBudgetSpendings(index);
            if ((totalIncome - totalSpendings) <= 0 ) return 0;
            return ((totalIncome - totalSpendings) * (settings.budgetPercents / 100));
        }
        return 0;
    };

    const getErrorClass = (number: number) => {
        if (number < 0) {
            return 'error';
        };
        return '';
    }
</script>

<style scoped>
    ion-item {
        --padding-start: 0;
    }
    ion-range {
        padding-top: 40px;
    }
    ion-range::part(tick) {
        background: var(--ion-color-primary);
    }

    ion-range::part(tick-active) {
        background: var(--ion-color-primary);
    }

    ion-range::part(pin) {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--ion-color-secondary);
        color: #fff;
        border-radius: 50%;
        transform: scale(1.01);
        top: -20px;
        min-width: 28px;
        height: 28px;
        transition: transform 120ms ease, background 120ms ease;
    }

    ion-range::part(pin)::before {
        content: none;
    }

    ion-range::part(knob) {
        background: var(--ion-color-primary-tint);
    }

    ion-range::part(bar) {
        background: var(--ion-color-primary);
    }

    ion-range::part(bar-active) {
        background: var(--ion-color-primary);
    }
    ion-radio {
        --border-radius: 4px;
        --inner-border-radius: 4px;
        --color: #ddd;
        --color-checked: var(--ion-color-primary);
    }

    ion-radio.ios::part(container) {
        width: 20px;
        height: 20px;
        border: 2px solid #ddd;
        border-radius: 4px;
    }

    .radio-checked.ios::part(container) {
        border-color: var(--ion-color-primary);
    }

    ion-row.align-items-center {
        align-items: center;
    }

    ion-col.spending-budget {
        font-size: 1.75rem;
    }

    .error {
        color: red;
    }
</style>