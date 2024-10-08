import { create } from "zustand";

interface ContractStore {
  analysisrResults: any;
  setAnalysisResults: (results: any) => void;
}

const useContractStore = create<ContractStore>((set) => ({
  analysisrResults: undefined,
  setAnalysisResults: (results) => set({ analysisrResults: results }),
}));


export { useContractStore }