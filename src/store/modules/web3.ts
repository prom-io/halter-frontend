import Vue from 'vue';
import { Web3Provider } from '@ethersproject/providers';
import { getInstance } from '@snapshot-labs/lock/plugins/vue';
import { formatUnits } from '@ethersproject/units';
import getProvider from '@/utils/provider';
import networks from '@/utils/networks.json';
import store from '@/store';

const defaultNetwork = process.env.VUE_APP_DEFAULT_NETWORK || '1';

let wsProvider;
let auth;

if (wsProvider) {
  wsProvider.on('block', blockNumber => {
    store.commit('GET_BLOCK_SUCCESS', blockNumber);
  });
}

const state = {
  account: null,
  balance: false,
  name: null,
  network: networks[defaultNetwork]
};

const mutations = {
  WEB3_SET(_state, payload) {
    Object.keys(payload).forEach(key => {
      Vue.set(_state, key, payload[key]);
    });
  },
  LOGOUT(_state) {
    Vue.set(_state, 'account', null);
    Vue.set(_state, 'name', null);
    console.debug('LOGOUT');
  },
  LOAD_PROVIDER_FAILURE(_state, payload) {
    Vue.set(_state, 'account', null);
    console.debug('LOAD_PROVIDER_FAILURE', payload);
  },
  HANDLE_CHAIN_CHANGED(_state, chainId) {
    if (!networks[chainId]) {
      networks[chainId] = {
        ...networks['1'],
        chainId,
        name: 'Unknown',
        network: 'unknown',
        unknown: true
      };
    }
    Vue.set(_state, 'network', networks[chainId]);
    console.debug('HANDLE_CHAIN_CHANGED', chainId);
  },
  HANDLE_ACCOUNTS_CHANGED(_state, payload) {
    Vue.set(_state, 'account', payload);
    console.debug('HANDLE_ACCOUNTS_CHANGED', payload);
  }
};

const actions = {
  login: async ({ dispatch, commit }, connector = 'injected') => {
    auth = getInstance();
    commit('SET', { authLoading: true });
    await auth.login(connector);
    if (auth.provider) {
      auth.web3 = new Web3Provider(auth.provider);
      await dispatch('loadProvider');
      dispatch('getBalances');
      dispatch('getAllowances');
    }
    commit('SET', { authLoading: false });
  },
  logout: async ({ commit }) => {
    Vue.prototype.$auth.logout();
    commit('LOGOUT');
  },
  loadProvider: async ({ commit, dispatch }) => {
    try {
      if (auth.provider.removeAllListeners && !auth.provider.isTorus)
        auth.provider.removeAllListeners();
      if (auth.provider.on) {
        auth.provider.on('chainChanged', async chainId => {
          commit('HANDLE_CHAIN_CHANGED', parseInt(formatUnits(chainId, 0)));
          dispatch('resetAccount');
          dispatch('getBalances');
          dispatch('getAllowances');
        });
        auth.provider.on('accountsChanged', async accounts => {
          if (accounts.length !== 0) {
            commit('HANDLE_ACCOUNTS_CHANGED', accounts[0]);
            dispatch('resetAccount');
            await dispatch('loadProvider');
            dispatch('getBalances');
            dispatch('getAllowances');
          }
        });
        auth.provider.on('disconnect', async () => {
          commit('HANDLE_CLOSE');
        });
      }
      const [network, accounts] = await Promise.all([
        auth.web3.getNetwork(),
        auth.web3.listAccounts()
      ]);
      commit('HANDLE_CHAIN_CHANGED', network.chainId);
      const account = accounts.length > 0 ? accounts[0] : null;
      const balance = await auth.web3.getBalance(account);
      console.log('Balance', balance);
      let name;
      try {
        name = await getProvider('1').lookupAddress(account);
      } catch (e) {
        console.error(e);
      }
      commit('WEB3_SET', {
        account,
        balance,
        name
      });
    } catch (e) {
      commit('LOAD_PROVIDER_FAILURE', e);
      return Promise.reject();
    }
  }
};

export default {
  state,
  mutations,
  actions
};
