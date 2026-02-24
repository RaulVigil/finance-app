import { useState, useEffect } from "react";
import Api from "../../Services/api";

const useDashboardGraficas = () => {
    const [data, setData] = useState({ gastosCategoria: [], flujoCaja: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGraficas = async () => {
            try {
                const res = await Api.get("datos-graficas");
                if (res.data && res.data.data) {
                    setData(res.data.data);
                }
            } catch (error) {
                console.error("Error al cargar datos de gráficas:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGraficas();
    }, []);

    return {
        gastosCategoria: data.gastosCategoria,
        flujoCaja: data.flujoCaja,
        loading,
    };
};

export default useDashboardGraficas;
