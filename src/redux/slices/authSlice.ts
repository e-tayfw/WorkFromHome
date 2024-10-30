import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    email: string;
    roleType: string;
    staffId: string | number | null;
    role: string | null;
    dept: string | null;
}

const initialState: AuthState = {
  email: "",
  roleType: "",
  staffId: null,
  role: null,
  dept: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthData: (
      state,
      action: PayloadAction<{
        email: string;
        roleType: string;
        staffId: string | number;
        role: string;
        dept: string;
      }>
    ) => {
      state.email = action.payload.email;
      state.roleType = action.payload.roleType;
      state.staffId = action.payload.staffId;
      state.role = action.payload.role;
      state.dept = action.payload.dept;
    },
    logout: (state) => {
      state.email = "";
      state.roleType = "";
      state.staffId = null;
      role: null;
      dept: null;
    },
  },
});

export const { setAuthData, logout } = authSlice.actions;

export default authSlice.reducer;