import axios from 'axios';
//const axios = require('axios');

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // or your backend URL
  withCredentials: true, // important!
});

export default axiosInstance;
