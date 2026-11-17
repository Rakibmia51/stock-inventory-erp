import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Request Interceptor: প্রতিটি রিকোয়েস্টের সাথে টোকেন যুক্ত করা
API.interceptors.request.use(
  (config) => {
    const userInfo = JSON.parse(localStorage.getItem('nexusUser'));
    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: টোকেন ইনভ্যালিড বা 401 হলে অটো লগআউট
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('nexusUser');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const createNewUser = (data) => API.post('/auth/create-user', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const getUsers = () => API.get('/auth/users');
export const updatePermissions = (data) => API.patch('/auth/permissions', data);

// Existing ERP Endpoints
export const getProducts = () => API.get('/products');
export const addProduct = (data) => API.post('/products', data);
export const updateStock = (id, data) => API.patch(`/products/${id}/stock`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);

export const getSuppliers = () => API.get('/suppliers');
export const addSupplier = (data) => API.post('/suppliers', data);

export const getClients = () => API.get('/clients');
export const addClient = (data) => API.post('/clients', data);

export const getPurchases = () => API.get('/purchases');
export const addPurchase = (data) => API.post('/purchases', data);

export const getInvoices = () => API.get('/invoices');
export const createInvoice = (data) => API.post('/invoices', data);