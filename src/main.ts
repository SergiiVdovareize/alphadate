import { createApp } from 'vue';
import './style.css';
import '@knadh/oat/oat.min.css';
import '@knadh/oat/oat.min.js';
import router from './router';
import App from './App.vue';

const app = createApp(App);
app.use(router);
app.mount('#app');
