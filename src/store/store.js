import { createStore } from 'vuex';
import { Storage } from '@ionic/storage';

const storage = new Storage();
storage.create();

export default createStore({
    state: {
        appPages: [],
        appPageData: {},
        isLoading: false,
        hasAppPageData: false,
    },
    mutations: {
        updateAppPages(state, newData) {
            state.appPages = newData;
        },
        updateAppPageData(state, pageData) {
            state.appPageData = pageData;
        },
        setLoading(state, loading) {
            state.isLoading = loading;
        },
        setAppPageData(state, hasData) {
            state.hasAppPageData = hasData;
        },
    },
    actions: {
        async loadAppPages({ commit }) {
            commit('setLoading', true);

            try {
                const appPages = await storage.get('appPages') || [];
                appPages.sort(function (a, b) {
                    return b.year - a.year || b.month - a.month;
                });
                commit('updateAppPages', appPages);
            } catch (error) {
                console.error('Error loading data app pages:', error);
            } finally {
                commit('setLoading', false);
            }
        },
        async insertToAppPages({ commit }, newData ) {
            commit('setLoading', true);

            try {
                const appPages = await storage.get('appPages') || [];
                appPages.push(newData.page);
                appPages.sort(function (a, b) {
                    return b.year - a.year || b.month - a.month;
                });
                storage.set('appPages', appPages);
                storage.set(newData.page.key, newData.pageData);
                commit('updateAppPages', appPages);
            } catch (error) {
                console.error('Error creating new page:', error);
            } finally {
                commit('setLoading', false);
            }
        },
        async getAppPageData({ commit }, id) {
            commit('setLoading', true);

            try {
                const appPages = await storage.get('appPages') || [];
                if (appPages.length > 0) {
                    const page = appPages.filter(function (el) { return el.key == id })[0];
                    let pageData = await storage.get(page.key) || [];
                    pageData = pageData.filter(function (el) { return el.enabled });
                    const returnData = { page: page, data: pageData };
                    commit('updateAppPageData', returnData);
                    commit('setAppPageData', true);
                }
            } catch (error) {
                console.error('Error loading data for page:', error);
            } finally {
                commit('setLoading', false);
            }
        }
    },
});