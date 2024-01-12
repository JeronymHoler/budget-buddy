<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button color="primary"></ion-menu-button>
                </ion-buttons>
                <ion-title>Budget buddy</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="openSettings" size="normal" slot="end">
                        <ion-icon slot="start" :icon="settings"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <ion-header collapse="condense">
                <ion-toolbar class="ion-text-center">
                    <ion-text>
                        <h1>Úvod</h1>
                    </ion-text>
                    <p>Vítejte v aplikaci Budget buddy.</p>
                </ion-toolbar>
            </ion-header>

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
                    <ion-item>
                        <IonLabel>Měna</IonLabel>
                        <IonSelect v-model="settingsCurrency" label="">
                            <IonSelectOption v-for="(currency, i) in settingsCurrencies" :key="i" :value="currency.code">
                                {{ currency.name }}
                            </IonSelectOption>
                        </IonSelect>
                    </ion-item>

                    <ion-button expand="full" @click="saveSettings">Uložit</ion-button>
                </ion-content>
            </ion-modal>
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
        IonButton,
        IonButtons,
        IonMenuButton,
        IonModal,
        IonIcon,
        IonText
    } from '@ionic/vue';
    import {
        settings
    } from 'ionicons/icons';
    import { useRouter } from 'vue-router';
    import { ref, computed } from 'vue'
    import { useStore } from 'vuex';

    const store = useStore();

    /////////////////////
    // settings start
    /////////////////////
    const appSettings = computed(() => store.state.appSettings);
    const settingsCurrencies = computed(() => store.state.appCurrencies);
    const isSettingsOpen = ref(false);
    const settingsCurrency = ref('');

    const openSettings = async () => {
        settingsCurrency.value = appSettings.value.currencyCode;
        if (settingsCurrencies.value === null){
            await store.dispatch('loadAppCurrencies');
        }
        isSettingsOpen.value = true    
    };

    const closeSettings = () => { isSettingsOpen.value = false; };

    const saveSettings = async () => {
        const settings = {
            currencyCode: settingsCurrencies.value[settingsCurrency.value].code,
            currencySymbol: settingsCurrencies.value[settingsCurrency.value].symbol
        };
        console.log(settings);
        await store.dispatch('setAppSettings', settings);
    };
</script>

<style scoped></style>
