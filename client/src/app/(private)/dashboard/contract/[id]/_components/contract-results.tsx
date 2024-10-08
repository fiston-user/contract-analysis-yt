"use client";

import ContractAnalysisResults from "@/components/analysis/contract-analysis-results";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ContractAnalysis } from "@/interfaces/contract.interface";
import { api } from "@/lib/api";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";

interface IContractResultsProps {
  contractId: string;
}

export default function ContractResults({ contractId }: IContractResultsProps) {
  const { user } = useCurrentUser();
  const [analysisResults, setAnalysisResults] = useState<ContractAnalysis>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      fetchAnalysisResults(contractId);
    }
  }, [user]);

  const fetchAnalysisResults = async (id: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/contracts/contract/${id}`);
      setAnalysisResults(response.data);
      console.log(response.data);
      setError(false);
    } catch (error) {
      console.error(error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return notFound();
  }

  return (
    <ContractAnalysisResults
      contractId={contractId}
      analysisResults={analysisResults}
      isActive={true}
    />
  );
}
