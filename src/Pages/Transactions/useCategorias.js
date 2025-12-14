import { useEffect, useState } from "react";
import Api from "../../Services/api";

export default function useCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchCategorias = async () => {
      try {
        const res = await Api.get("categorias");
        if (mounted) {
          setCategorias(res.data.data || []);
        }
      } catch (err) {
        setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCategorias();
    return () => (mounted = false);
  }, []);

  return {
    categorias,
    loading,
    error,
  };
}
