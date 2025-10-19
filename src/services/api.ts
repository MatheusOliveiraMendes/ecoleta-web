import axios from 'axios';

const api = axios.create({
    baseURL: 'https://ecoleta-server-w10b.onrender.com'
});

export default api;