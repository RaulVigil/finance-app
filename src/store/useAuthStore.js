import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      saldoActual: 0,
      isAuthenticated: false,

      login: (data) =>
        set({
          user: {
            usuario_id: data.usuario_id,
            nombre: data.nombre,
            email: data.email,
            tipo_usuario: data.tipo_usuario,
          },
          token: data.token,
          saldoActual: data.saldo_actual,
          isAuthenticated: true,
        }),

      updateSaldo: (saldo) => set({ saldoActual: saldo }),

      logout: () =>
        set({
          user: null,
          token: null,
          saldoActual: 0,
          isAuthenticated: false,
        }),
    }),
    { name: "financeapp-auth" }
  )
);

export default useAuthStore;
