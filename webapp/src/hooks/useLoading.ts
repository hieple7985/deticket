import { useContext, createContext } from "react";

interface UseLoading {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}



export const GlobalLoading = createContext<{
  loading: boolean;
  setLoading: (loading: boolean) => void;
}>({
  loading: false,
  setLoading: () => null,
})


export const useGlobalLoading = (): UseLoading => {
  const { loading, setLoading } = useContext(GlobalLoading);
  return {
    loading,
    setLoading,
  }
}
