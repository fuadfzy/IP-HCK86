import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Async Thunks untuk CRUD Operations
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (sessionId = null) => {
    const token = localStorage.getItem('token');
    const url = sessionId ? `${API_URL}/orders?session_id=${sessionId}` : `${API_URL}/orders`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    const data = await response.json();
    return data;
  }
);

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create order');
    }

    const data = await response.json();
    return data;
  }
);

export const updateOrder = createAsyncThunk(
  "orders/updateOrder",
  async ({ orderId, orderData }) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update order');
    }

    const data = await response.json();
    return { orderId, ...data };
  }
);

export const deleteOrder = createAsyncThunk(
  "orders/deleteOrder",
  async (orderId) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete order');
    }

    return orderId;
  }
);

// Order Slice
export const orderSlice = createSlice({
  name: "orders",
  initialState: {
    list: [],
    loading: false,
    error: null,
    lastAction: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLastAction: (state) => {
      state.lastAction = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch Orders
    builder.addCase(fetchOrders.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOrders.fulfilled, (state, action) => {
      state.loading = false;
      state.list = action.payload;
      state.lastAction = 'fetch_success';
    });
    builder.addCase(fetchOrders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
      state.lastAction = 'fetch_error';
    });

    // Create Order
    builder.addCase(createOrder.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createOrder.fulfilled, (state, action) => {
      state.loading = false;
      // Add new order to list (if we have the full order data)
      if (action.payload.order) {
        state.list.push(action.payload.order);
      }
      state.lastAction = 'create_success';
    });
    builder.addCase(createOrder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
      state.lastAction = 'create_error';
    });

    // Update Order
    builder.addCase(updateOrder.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateOrder.fulfilled, (state, action) => {
      state.loading = false;
      // Update specific order in list
      const orderId = action.payload.orderId;
      const orderIndex = state.list.findIndex(order => order.id === orderId);
      if (orderIndex !== -1) {
        // Update order properties
        state.list[orderIndex] = { ...state.list[orderIndex], ...action.payload };
      }
      state.lastAction = 'update_success';
    });
    builder.addCase(updateOrder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
      state.lastAction = 'update_error';
    });

    // Delete Order
    builder.addCase(deleteOrder.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteOrder.fulfilled, (state, action) => {
      state.loading = false;
      // Remove order from list
      state.list = state.list.filter(order => order.id !== action.payload);
      state.lastAction = 'delete_success';
    });
    builder.addCase(deleteOrder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
      state.lastAction = 'delete_error';
    });
  },
});

// Action creators
export const { clearError, clearLastAction } = orderSlice.actions;

export default orderSlice.reducer;
