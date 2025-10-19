import axios from 'axios';

const api = axios.create({
    baseURL: 'https://ecoleta-server-ckhk.onrender.com'
});

export default api;