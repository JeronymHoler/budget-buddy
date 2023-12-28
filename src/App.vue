<template>
    <ion-app>
        <ion-split-pane content-id="main-content">
            <ion-menu content-id="main-content" type="overlay">
                <ion-content>
                    <ion-list id="inbox-list" class="ion-text-center">
                        <ion-list-header>Budget buddy</ion-list-header>

                        <ion-menu-toggle :auto-hide="false">
                            <ion-button @click="selectedIndex = -1" size="small" class="ion-text-center" router-direction="root" :router-link="newItemURL">
                                <ion-icon slot="start" :icon="add"></ion-icon>Nová položka
                            </ion-button>
                        </ion-menu-toggle>

                        <ion-menu-toggle :auto-hide="false" v-for="(p, i) in appPages" :key="i">
                            <ion-item @click="selectedIndex = i" router-direction="root" :router-link="p.url" lines="none" :detail="false" class="hydrated" :class="{ selected: selectedIndex === i }">
                                <ion-label>{{ p.title }}</ion-label>
                            </ion-item>
                        </ion-menu-toggle>
                    </ion-list>
                </ion-content>
            </ion-menu>
            <ion-router-outlet id="main-content"></ion-router-outlet>
        </ion-split-pane>
    </ion-app>
</template>

<script setup lang="ts">
    import {
        IonApp,
        IonContent,
        IonIcon,
        IonItem,
        IonLabel,
        IonList,
        IonListHeader,
        IonMenu,
        IonMenuToggle,
        IonNote,
        IonRouterOutlet,
        IonSplitPane,
        IonButton
    } from '@ionic/vue';

    import {
        add
    } from 'ionicons/icons';

    import { Ref, ref, onBeforeMount, computed } from 'vue';
    import { useStore } from 'vuex';

    const store = useStore();
    const isLoading = ref(false);

    onBeforeMount(async () => {
        isLoading.value = true;
        await store.dispatch('loadAppPages');
        isLoading.value = false;
    });

    const appPages = computed(() => store.state.appPages);

    const newItemURL = '/item/New'
    const selectedIndex = ref(0);

    //todo poresit pres VUEX
    const path = window.location.pathname.split('item/')[1];
    if (path !== undefined) {
        //selectedIndex.value = appPages.value.findIndex((page) => page.title.toLowerCase() === path.toLowerCase());
    }
</script>

<style scoped>
    ion-menu.md ion-item.selected {
        --background: rgba(var(--ion-color-primary-rgb), 0.14);
    }

        ion-menu.md ion-item.selected ion-icon {
            color: var(--ion-color-primary);
        }

    ion-menu.ios ion-item.selected ion-icon {
        color: var(--ion-color-primary);
    }

    ion-item.selected {
        --color: var(--ion-color-primary);
    }

    ion-button {
        margin-top: 20px;
        margin-bottom: 20px;
    }
</style>
