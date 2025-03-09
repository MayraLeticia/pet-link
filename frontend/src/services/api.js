// frontend/src/services/axios.js

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/', // Substitua pelo seu backend URL
});

export default api;
