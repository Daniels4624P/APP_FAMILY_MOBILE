import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://api-familia-tareas-node.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Variable para evitar múltiples intentos de refresh simultáneos
let isRefreshing = false;
let failedQueue: Array<{ resolve: Function; reject: Function }> = [];

// Variable global para almacenar la función de actualización del contexto
let updateAuthContext: ((userData: any) => void) | null = null;

// Función para registrar el callback del contexto
export const setAuthContextUpdater = (updaterFunction: (userData: any) => void) => {
  updateAuthContext = updaterFunction;
  console.log('🔧 Auth context updater registered');
};

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Interceptor de respuesta para manejar errores de autenticación y refresh automático
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    console.log('🚨 Interceptor triggered:', {
      status: error.response?.status,
      url: originalRequest?.url,
      baseURL: originalRequest?.baseURL,
      fullURL: `${originalRequest?.baseURL || API_URL}${originalRequest?.url}`,
      retry: originalRequest?._retry,
    });

    // Solo hacer refresh si es 401 y no hemos intentado antes
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.skipAuthRefresh &&
      !originalRequest.url.includes('/auth/refresh') &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/register')
    ) {
      console.log('🔄 Token expired, attempting refresh...');

      if (isRefreshing) {
        console.log('⏳ Already refreshing, adding to queue');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            console.log('🔄 Retrying queued request after refresh completed');
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('🔄 Step 1: Making refresh request to /auth/refresh...');

        // PASO 1: Refresh del token
        const refreshResponse = await api.post('/auth/refresh');
        console.log('✅ Step 1 completed: Token refresh successful');

        // PASO 2: Obtener el perfil actualizado y actualizar contexto
        console.log('🔄 Step 2: Fetching updated user profile...');
        const profileResponse = await api.get('/auth/profile', { skipAuthRefresh: true });

        if (profileResponse.data) {
          console.log('✅ Step 2 completed: Profile fetched successfully:', profileResponse.data);

          // PASO 3: Actualizar el contexto
          console.log('🔄 Step 3: Updating auth context...');
          if (updateAuthContext && typeof updateAuthContext === 'function') {
            updateAuthContext(profileResponse.data);
            console.log('✅ Step 3 completed: Auth context updated');
          }
        }

        // PASO 4: Procesar la cola de peticiones pendientes
        console.log('🔄 Step 4: Processing queued requests...');
        processQueue(null);
        isRefreshing = false;
        console.log('✅ Step 4 completed: Queue processed');

        // PASO 5: Reintentar la petición original
        console.log('🔄 Step 5: Retrying original request:', originalRequest.url);
        const retryResponse = await api(originalRequest);
        console.log('✅ Step 5 completed: Original request successful');

        return retryResponse;
      } catch (refreshError: any) {
        console.error('❌ Token refresh process failed:', refreshError);

        processQueue(refreshError);
        isRefreshing = false;

        // Solo limpiar contexto si realmente falló el refresh (401/403)
        if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
          console.log('🧹 Clearing auth context due to auth failure');
          if (updateAuthContext && typeof updateAuthContext === 'function') {
            updateAuthContext(null);
          }
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth endpoints
export const registerUser = (userData: any) => api.post('/auth/register', userData);
export const loginUser = (credentials: any) => api.post('/auth/login', credentials);
export const logoutUser = () => api.delete('/auth/logout');
export const getUserProfile = (config: any = {}) => {
  const requestConfig = { ...config };
  if (config.skipAuthRefresh) {
    requestConfig.skipAuthRefresh = true;
    delete requestConfig.skipAuthRefresh;
  }
  return api.get('/auth/profile', requestConfig);
};

// Profile endpoints
export const updateProfile = (profileData: any) => api.patch('/auth/profile', profileData);

// Google OAuth endpoints
export const getGoogleAuthUrl = async () => {
  try {
    console.log('🔄 Requesting Google auth URL from server...');
    const response = await api.get('/auth/google/handler');
    
    console.log('📦 Raw Google auth response:', {
      status: response.status,
      data: response.data,
      dataType: typeof response.data,
      isString: typeof response.data === 'string'
    });

    // Si la respuesta es un string (URL directa), convertirla al formato esperado
    if (typeof response.data === 'string' && response.data.startsWith('http')) {
      console.log('🔄 Converting plain text URL to expected format...');
      const authUrl = response.data;
      
      // Crear un objeto con la estructura esperada
      const formattedResponse = {
        ...response,
        data: {
          authUrl: authUrl
        }
      };
      
      console.log('✅ Formatted Google auth response:', {
        hasAuthUrl: !!formattedResponse.data?.authUrl,
        authUrl: formattedResponse.data?.authUrl
      });
      
      return formattedResponse;
    }
    
    // Si ya es un objeto JSON, devolverlo tal como está
    console.log('📦 Google auth response (JSON format):', {
      status: response.status,
      data: response.data,
      hasAuthUrl: !!response.data?.authUrl,
      authUrl: response.data?.authUrl
    });
    
    return response;
  } catch (error: any) {
    console.error('❌ Error getting Google auth URL:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

export const handleGoogleCallback = (state: string, code: string) => 
  api.get(`/auth/google/callback?state=${state}&code=${code}`);

// Google Calendar authorization endpoints
export const getGoogleCalendarAuthUrl = () => api.get('/tasks/google/handler');
export const checkGoogleCalendarAccess = () => api.get('/auth/google-calendar-status');

// X (Twitter) OAuth endpoints
export const getXAuthUrl = async () => {
  try {
    console.log('🔄 Requesting Twitter auth URL from server...');
    const response = await api.get('/auth/x/handler');
    
    console.log('📦 Raw Twitter auth response:', {
      status: response.status,
      data: response.data,
      dataType: typeof response.data,
      isString: typeof response.data === 'string'
    });

    // Si la respuesta es un string (URL directa), convertirla al formato esperado
    if (typeof response.data === 'string' && response.data.startsWith('http')) {
      console.log('🔄 Converting plain text URL to expected format...');
      const authUrl = response.data;
      
      // Crear un objeto con la estructura esperada
      const formattedResponse = {
        ...response,
        data: {
          authUrl: authUrl
        }
      };
      
      console.log('✅ Formatted Twitter auth response:', {
        hasAuthUrl: !!formattedResponse.data?.authUrl,
        authUrl: formattedResponse.data?.authUrl
      });
      
      return formattedResponse;
    }
    
    // Si ya es un objeto JSON, devolverlo tal como está
    console.log('📦 Twitter auth response (JSON format):', {
      status: response.status,
      data: response.data,
      hasAuthUrl: !!response.data?.authUrl,
      authUrl: response.data?.authUrl
    });
    
    return response;
  } catch (error: any) {
    console.error('❌ Error getting Twitter auth URL:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

export const handleXCallback = (state: string, code: string) => 
  api.get(`/auth/x/callback?state=${state}&code=${code}`);

// User endpoints
export const getUser = (id: string) => api.get(`/users/${id}`);
export const getUserHistory = () => api.get('/users/history');
export const getUserPoints = (id: string) => api.get(`/users/${id}/points`);
export const getUsersPoints = () => api.get('/users/points');

// Project endpoints
export const createProject = (projectData: any) => api.post('/projects', projectData);
export const getPublicProjects = () => api.get('/projects/public');
export const getPrivateProjects = () => api.get('/projects/private');
export const getProject = (id: string) => api.get(`/projects/${id}`);
export const updateProject = (id: string, projectData: any) => api.patch(`/projects/${id}`, projectData);
export const deleteProject = (id: string) => api.delete(`/projects/${id}`);
export const completeProject = (id: string) => api.post(`/projects/${id}/complete`);

// Folder endpoints
export const createFolder = (folderData: any) => api.post('/folders', folderData);
export const getPublicFolders = () => api.get('/folders/public');
export const getPrivateFolders = () => api.get('/folders/private');
export const getFolder = (id: string) => api.get(`/folders/${id}`);
export const updateFolder = (id: string, folderData: any) => api.patch(`/folders/${id}`, folderData);
export const deleteFolder = (id: string) => api.delete(`/folders/${id}`);

// Task endpoints
export const createTask = (taskData: any) => api.post('/tasks', taskData);
export const getFolderTasks = (folderId: string) => api.get(`/folders/${folderId}/tasks`);
export const updateTask = (id: string, taskData: any) => api.patch(`/tasks/${id}`, taskData);
export const deleteTask = (id: string) => api.delete(`/tasks/${id}`);
export const completePublicTask = (id: string, token: string, taskData: any) => 
  api.patch(`/tasks/${id}/complete/task/public`, taskData, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const completePrivateTask = (id: string, token: string, taskData: any) => 
  api.patch(`/tasks/${id}/complete/task/private`, taskData, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const fetchTasksForMonth = (year: number, month: number) => {
  const params: any = {};

  if (month && month > 1900) {
    if (!year) {
      params.year = month;
      const currentMonth = new Date().getMonth() + 1;
      params.month = String(currentMonth).padStart(2, '0');
    } else {
      params.year = year;
      params.month = String(month).padStart(2, '0');
    }
  } else {
    if (year) {
      params.year = year;
    }
    if (month && month <= 12) {
      params.month = String(month).padStart(2, '0');
    }
  }

  return api.get('/tasks/tasks/monthly', { params });
};

// Password recovery
export const sendRecoveryEmail = (email: string) => api.post('/auth/recovery', { email });
export const changePassword = (token: string, newPassword: string) => 
  api.post('/auth/change-password', { token, newPassword });

// Account endpoints
export const createAccount = (accountData: any) => api.post('/accounts', accountData);
export const getAccounts = () => api.get('/accounts');
export const getAccount = (id: string) => api.get(`/accounts/${id}`);
export const updateAccount = (id: string, accountData: any) => api.patch(`/accounts/${id}`, accountData);
export const deleteAccount = (id: string) => api.delete(`/accounts/${id}`);

// Expense endpoints
export const createExpense = (expenseData: any) => api.post('/expenses', expenseData);
export const getExpenses = () => api.get('/expenses');
export const getExpense = (id: string) => api.get(`/expenses/${id}`);
export const updateExpense = (id: string, expenseData: any) => api.patch(`/expenses/${id}`, expenseData);
export const deleteExpense = (id: string) => api.delete(`/expenses/${id}`);

// Category endpoints
export const createCategory = (categoryData: any) => api.post('/categories', categoryData);
export const getCategories = () => api.get('/categories');

// Finance endpoints
export const exportFinances = async (year: number, month: number, type: string) => {
  try {
    const response = await api.get(`/finances/export?year=${year}&month=${month}&type=${type}`, {
      responseType: 'blob',
    });
    return response;
  } catch (error) {
    console.error('Error exporting finances:', error);
    throw error;
  }
};

// Income endpoints
export const createIncome = (incomeData: any) => api.post('/incomes', incomeData);
export const getIncomes = () => api.get('/incomes');
export const getIncome = (id: string) => api.get(`/incomes/${id}`);
export const updateIncome = (id: string, incomeData: any) => api.patch(`/incomes/${id}`, incomeData);
export const deleteIncome = (id: string) => api.delete(`/incomes/${id}`);

export const getAccountStatistics = () => api.get('/accounts/statistics/of/user');

export default api;