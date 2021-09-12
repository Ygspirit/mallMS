import Vue from 'vue'
import App from './App.vue'
import router from './router'
// import './plugins/element.js'
import TreeTable from 'vue-table-with-tree-grid'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'


// 导入NProgress包对应的JS和CSS
import NProgress from 'nprogress'

import axios from 'axios'

axios.defaults.baseURL = 'https://api.naccl.top/vue/shop/api/private/v1/'


//请求拦截
axios.interceptors.request.use(config => {

    // 在request拦截器中，展示进度条NProgress.start();
    NProgress.start();

    //为请求头对象，添加token验证的Authorization字段
    config.headers.Authorization = window.sessionStorage.getItem('token')
    //必须return config
    return config
})

axios.interceptors.response.use(config => {

    // 在response拦截器中，隐藏进度条NProgress.done();
    NProgress.done();
    
    return config
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)
// 将富文本注册为全局可用的组件
Vue.use(VueQuillEditor)

//自定义格式化时间的全局过滤器
Vue.filter('dateFormat', function (originVal) {
    const dt = new Date(originVal)

    const y = dt.getFullYear()
    const m = (dt.getMonth() + 1 + '').padStart(2, '0')
    const d = (dt.getDate() + '').padStart(2, '0')

    const hh = (dt.getHours() + '').padStart(2, '0')
    const mm = (dt.getMinutes() + '').padStart(2, '0')
    const ss = (dt.getSeconds() + '').padStart(2, '0')

    return `${y}-${d}-${m} ${hh}:${mm}:${ss}`
})

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')
