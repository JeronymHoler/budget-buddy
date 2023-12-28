<template>
    <ion-page v-if="hasAppPageData">
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button color="primary"></ion-menu-button>
                </ion-buttons>
                <ion-title>{{appPageData.page.title}}</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">{{appPageData.page.title}}</ion-title>
                </ion-toolbar>
            </ion-header>

            <ion-card v-for="(item, i) in appPageData.data" :key="i">
                <ion-card-header>
                    <ion-card-title>{{item.title}}</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                    <ion-list>
                        <ion-item>
                            <ion-label>Item</ion-label>
                        </ion-item>

                        <ion-item>
                            <ion-label>Item</ion-label>
                        </ion-item>

                        <ion-item>
                            <ion-label>Item</ion-label>
                        </ion-item>

                        <ion-item lines="none">
                            <ion-label>Item</ion-label>
                        </ion-item>
                    </ion-list>
                </ion-card-content>
            </ion-card>
        </ion-content>
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
        IonAlert,
        IonButtons,
        IonMenuButton,
        IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle
    } from '@ionic/vue';
    import {
        add
    } from 'ionicons/icons';
    import { useRoute, useRouter } from 'vue-router';
    import { ref, computed, onBeforeMount } from 'vue'
    import { useStore } from 'vuex';

    // route
    const route = useRoute();

    const store = useStore();
    const isLoading = ref(false);

    onBeforeMount(async () => {
        isLoading.value = true;
        await store.dispatch('getAppPageData', route.params.id);
        isLoading.value = false;
    });

    const appPageData = computed(() => store.state.appPageData);
    const hasAppPageData = computed(() => store.state.hasAppPageData);

    const newItemURL = '/item/New'
</script>

<style scoped>
    ion-item {
        --padding-start: 0;
    }
</style>