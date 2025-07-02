import axios from 'axios'
import { getUserFromLocalStorage } from './localStorage'

const customFetch = axios.create({
    baseURL: 'http://192.168.0.101:4000/api/v1',
})
// https://preciagribackend.onrender.com

// Request Interceptor: Attach Authorization Token
customFetch.interceptors.request.use(
    async (config) => {
        const user = await getUserFromLocalStorage() // Retrieve user data
        if (user) {
            config.headers['Authorization'] = `Bearer ${user.token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response Interceptor: Handle Errors
customFetch.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error('API Error:', error.response.data)
        } else {
            console.error('Network Error:', error.message)
        }
        return Promise.reject(error)
    }
)

export default customFetch
