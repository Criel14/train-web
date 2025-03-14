import {createStore} from 'vuex'

// session中的key
const MEMBER_KEY = "MEMBER";

export default createStore({
    state: {
        member: (() => {
            const storedMember = window.sessionStorage.getItem(MEMBER_KEY);
            // 解析 JSON，如果为空则返回 {}
            return storedMember ? JSON.parse(storedMember) : {};
        })()
    },
    getters: {},
    mutations: {
        // mutations类似setter
        setMember(state, member) {
            state.member = member;
            window.sessionStorage.setItem(MEMBER_KEY, JSON.stringify(member));
        }
    },
    actions: {},
    modules: {}
})
