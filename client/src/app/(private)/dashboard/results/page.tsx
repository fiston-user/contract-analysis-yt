"use client";

import ContractAnalysisResults from "@/components/analysis/contract-analysis-results";
import { useContractStore } from "@/store/zustand";

export default function ContractResultsPage() {
  const analysisResults = useContractStore((state) => state.analysisrResults);

  return (
    <ContractAnalysisResults
      contractId={analysisResults._id}
      isActive={true}
      analysisResults={analysisResults}
    />
  );
}
