import axios from 'axios';
//const axios = require('axios');

const axiosInstance = axios.create({
  baseURL: 'http://localhost:1800/api', // or your backend URL
  withCredentials: true, // important!
});

export default axiosInstance;
