import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.55:3005',
});

export default api;
