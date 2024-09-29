import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    email: string;
    roleType: string;
    staffId: string | number | null;
}

const initialState: AuthState = {
  email: "",
  roleType: "",
  staffId: null,
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
      }>
    ) => {
      state.email = action.payload.email;
      state.roleType = action.payload.roleType;
      state.staffId = action.payload.staffId;
    },
    logout: (state) => {
      state.email = "";
      state.roleType = "";
      state.staffId = null;
    },
  },
});

export const { setAuthData, logout } = authSlice.actions;

export default authSlice.reducer;