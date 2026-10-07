import { API_BASE, LOCAL_STORAGE_KEYS } from '@/constants'
import type { Product, Order, Address, Review, AuthUser } from '@/types'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN)
}

function buildHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...extra }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { ...buildHeaders(), ...(options.headers as Record<string, string>) },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = data?.error || `Request failed with status ${res.status}`
    throw Object.assign(new Error(message), { status: res.status, data })
  }
  return data as T
}

const get  = <T>(path: string) => request<T>(`${API_BASE}${path}`)
const post = <T>(path: string, body: unknown) => request<T>(`${API_BASE}${path}`, { method: 'POST', body: JSON.stringify(body) })
const put  = <T>(path: string, body: unknown) => request<T>(`${API_BASE}${path}`, { method: 'PUT',  body: JSON.stringify(body) })
const del  = <T>(path: string) => request<T>(`${API_BASE}${path}`, { method: 'DELETE' })

export const apiClient = {
  products: {
    getAll: () => get<Product[]>('/products'),
  },

  auth: {
    register: (data: { name: string; email: string; password: string; phone?: string }) =>
      post<{ token: string; user: AuthUser }>('/register', data),

    login: (email: string, password: string) =>
      post<{ token: string; user: AuthUser }>('/login', { email, password }),

    loginWithGoogle: (credential?: string, accessToken?: string) =>
      post<{ token: string; user: AuthUser }>('/google', { credential, accessToken }),

    forgotPassword: (email: string) =>
      post<{ message: string }>('/forgot-password', { email }),

    resetPassword: (token: string, newPassword: string) =>
      post<{ message: string }>('/reset-password', { token, newPassword }),
  },

  orders: {
    create: (data: {
      userId?: number | null
      customerName: string
      email: string
      phone?: string
      address: string
      total: number
      paymentMethod: string
      items: Array<{ productId: number; qty: number; color: string }>
    }) => post<Order>('/orders', data),

    getAdminOrders: () => get<Order[]>('/orders'),
  },

  users: {
    getOrders: (userId: number) => get<Order[]>(`/users/${userId}/orders`),

    updateProfile: (userId: number, data: { name: string; phone?: string }) =>
      put<AuthUser>(`/users/${userId}/profile`, data),

    changePassword: (userId: number, currentPassword: string, newPassword: string) =>
      put<{ success: boolean; message: string }>(`/users/${userId}/password`, { currentPassword, newPassword }),

    getAddresses: (userId: number) => get<Address[]>(`/users/${userId}/addresses`),

    createAddress: (userId: number, data: Omit<Address, 'id'>) =>
      post<Address>(`/users/${userId}/addresses`, data),

    updateAddress: (userId: number, addressId: number, data: Partial<Address>) =>
      put<Address>(`/users/${userId}/addresses/${addressId}`, data),

    deleteAddress: (userId: number, addressId: number) =>
      del<{ success: boolean }>(`/users/${userId}/addresses/${addressId}`),
  },

  reviews: {
    getByProduct: (productId: number) => get<Review[]>(`/products/${productId}/reviews`),

    create: (data: {
      productId: number
      orderId: string
      authorName: string
      rating: number
      title?: string
      body?: string
    }) => post<Review>('/reviews', data),
  },

  customers: {
    getAll: () => get<unknown[]>('/customers'),
    delete: (email: string) => del<{ success: boolean }>(`/customers/${encodeURIComponent(email)}`),
  },

  adminOrders: {
    updateStatus: (orderId: string, status: string) =>
      put<Order>(`/orders/${encodeURIComponent(orderId)}/status`, { status }),

    cancel: (orderId: string) =>
      put<{ message: string }>(`/orders/${encodeURIComponent(orderId)}/cancel`, {}),
    createOffer: (orderId: string, data: { shipping: number; delivery: string; note?: string }) =>
      put<Order>(`/orders/${encodeURIComponent(orderId)}/offer`, data),
    respondToOffer: (orderId: string, accept: boolean) =>
      put<Order>(`/orders/${encodeURIComponent(orderId)}/offer-response`, { accept }),
  },
}
