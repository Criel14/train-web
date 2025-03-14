import {createStore} from 'vuex'

export default createStore({
    state: {
        member: {}
    },
    getters: {},
    mutations: {
        // mutations类似setter
        setMember(state, member) {
            state.member = member;
        }
    },
    actions: {},
    modules: {}
})
