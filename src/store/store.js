import { createStore } from 'vuex';
import { Storage } from '@ionic/storage';

const storage = new Storage();
storage.create();

export default createStore({
    state: {
        appPages: [],
        appPageData: [],
        isLoading: false,
        hasAppPageData: false,
        maxSettingsPercents: 0
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
        updateMaxSettingsPercents(state, percents) {
            state.maxSettingsPercents = percents;
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
                    const pageData = await storage.get(page.key) || [];
                    pageData.budget = pageData.budget.filter(function (el) { return el.enabled });
                    const returnData = { page: page, data: pageData };
                    commit('updateAppPageData', returnData);
                    commit('setAppPageData', true);
                }
            } catch (error) {
                console.error('Error loading data for page:', error);
            } finally {
                commit('setLoading', false);
            }
        },
        async getMaxSettingsPercents({ commit }, key) {
            commit('setLoading', true);

            try {
                const pageData = await storage.get(key) || [];
                let maxSettingsPercents = 100;
                for (let i = 0; i < pageData.budget.length; i++) {
                    maxSettingsPercents -= pageData.budget[i].settings.budgetPercents;
                }
                commit('updateMaxSettingsPercents', maxSettingsPercents);
            } catch (error) {
                console.error('Error loading data for settings:', error);
            } finally {
                commit('setLoading', false);
            }
        },
        async saveAppPageDataSettings({ commit }, data) {
            commit('setLoading', true);

            try {
                const pageData = await storage.get(data.key) || [];
                pageData.budget[data.index].settings = data.settings;
                storage.set(data.key, pageData);

                let maxSettingsPercents = 100;
                for (let i = 0; i < pageData.budget.length; i++) {
                    maxSettingsPercents -= pageData.budget[i].settings.budgetPercents;
                }
                commit('updateMaxSettingsPercents', maxSettingsPercents);
            } catch (error) {
                console.error('Error saving page data settings:', error);
            } finally {
                commit('setLoading', false);
            }
        },
        async addAppPageDataIncome({ commit }, data) {
            commit('setLoading', true);

            try {
                const pageData = await storage.get(data.key) || [];
                pageData.income.push(data.income);
                pageData.income.sort(function (a, b) {
                    return (b.date < a.date) ? -1 : ((b.date > a.date) ? 1 : 0);
                });
                storage.set(data.key, pageData);
            } catch (error) {
                console.error('Error saving page data income:', error);
            } finally {
                commit('setLoading', false);
            }
        },
        async deleteAppPageDataIncome({ commit }, data) {
            commit('setLoading', true);

            try {
                const pageData = await storage.get(data.key) || [];
                pageData.income.splice(data.index, 1);
                storage.set(data.key, pageData);
            } catch (error) {
                console.error('Error deleting page data income:', error);
            } finally {
                commit('setLoading', false);
            }
        },
        async addAppPageDataSpending({ commit }, data) {
            commit('setLoading', true);

            try {
                const pageData = await storage.get(data.key) || [];
                pageData.budget[data.index].data.push(data.spending);
                pageData.budget[data.index].data.sort(function (a, b) {
                    return (b.date < a.date) ? -1 : ((b.date > a.date) ? 1 : 0);
                });
                storage.set(data.key, pageData);
            } catch (error) {
                console.error('Error saving page data spending:', error);
            } finally {
                commit('setLoading', false);
            }
        },
        async deleteAppPageDataSpending({ commit }, data) {
            commit('setLoading', true);

            try {
                const pageData = await storage.get(data.key) || [];
                pageData.budget[data.budgetIndex].data.splice(data.dataIndex, 1);
                storage.set(data.key, pageData);
            } catch (error) {
                console.error('Error deleting page data spending:', error);
            } finally {
                commit('setLoading', false);
            }
        }
    },
});