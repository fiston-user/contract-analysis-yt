import { ContractAnalysis } from "@/interfaces/contract.interface";
import { ReactNode, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import OverallScoreChart from "./chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { motion } from "framer-motion";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Accordion, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { AccordionContent } from "@radix-ui/react-accordion";

interface IContractAnalysisResultsProps {
  analysisResults: ContractAnalysis;
  isActive: boolean;
  contractId: string;
}

export default function ContractAnalysisResults({
  analysisResults,
  isActive,
  contractId,
}: IContractAnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState("summary");

  if (!analysisResults) {
    return <div>No results</div>;
  }

  const getScore = () => {
    const score = analysisResults.overallScore; //analysisResults.overallScore ||
    if (score > 70)
      return { icon: ArrowUp, color: "text-green-500", text: "Good" };
    if (score < 50)
      return { icon: ArrowDown, color: "text-red-500", text: "Bad" };
    return { icon: Minus, color: "text-yellow-500", text: "Average" };
  };

  const scoreTrend = getScore();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
    }
  };

  const renderRisksAndOpportunities = (
    items: Array<{
      risk?: string;
      opportunity?: string;
      explanation?: string;
      severity?: string;
      impact?: string;
    }>,
    type: "risks" | "opportunities"
  ) => {
    const displayItems = isActive ? items : items.slice(0, 3);
    const fakeItems = {
      risk: type === "risks" ? "Hidden Risk" : undefined,
      opportunity: type === "opportunities" ? "Hidden Opportunity" : undefined,
      explanation: "Hidden Explanation",
      severity: "low",
      impact: "low",
    };

    return (
      <ul className="space-y-4">
        {displayItems.map((item, index) => (
          <motion.li
            className="border rounded-lg p-4"
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold text-lg">
                {type === "risks" ? item.risk : item.opportunity}
              </span>
              {(item.severity || item.impact) && (
                <Badge
                  className={
                    type === "risks"
                      ? getSeverityColor(item.severity!)
                      : getImpactColor(item.impact!)
                  }
                >
                  {(item.severity || item.impact)?.toUpperCase()}
                </Badge>
              )}
            </div>
            <p className="mt-2 text-gray-600">
              {type === "risks" ? item.explanation : item.explanation}
            </p>
          </motion.li>
        ))}
        {!isActive && items.length > 3 && (
          <motion.li
            className="border rounded-lg p-4 blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: displayItems.length * 0.1 }}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold text-lg">
                {type === "risks" ? fakeItems.risk : fakeItems.opportunity}
              </span>
              <Badge>
                {(fakeItems.severity || fakeItems.impact)?.toUpperCase()}
              </Badge>
            </div>
          </motion.li>
        )}
      </ul>
    );
  };

  const renderPremiumAccordition = (content: ReactNode) => {
    if (isActive) {
      return content;
    }

    return (
      <div className="relative">
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <Button variant={"outline"}>Upgrade to Premium</Button>
        </div>
        <div className="opacity-50">{content}</div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Analysis Results</h1>
        <div className="flex space-x-2">{/* ASK AI BUTTON */}</div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Overal Contract Score</CardTitle>
          <CardDescription>
            Based on risks and opportunities identified
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="w-1/2">
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-4xl font-bold">
                  {analysisResults.overallScore ?? 0}
                </div>
                <div className={`flex items-center ${scoreTrend.color}`}>
                  <scoreTrend.icon className="size-6 mr-1" />
                  <span className="font-semibold">{scoreTrend.text}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Risk</span>
                  <span>{100 - analysisResults.overallScore}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Opportunities</span>
                  <span>{analysisResults.overallScore}%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                This score represents the overall risk and opportunitys
                identified in the contract.
              </p>
            </div>

            <div className="w-1/2 h-48 flex justify-center items-center">
              <div className="w-full h-full max-w-xs">
                <OverallScoreChart
                  overallScore={analysisResults.overallScore}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Contract Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">
                {analysisResults.summary}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="risks">
          <Card>
            <CardHeader>
              <CardTitle>Risks</CardTitle>
            </CardHeader>
            <CardContent>
              {renderRisksAndOpportunities(analysisResults.risks, "risks")}
              {!isActive && (
                <p className="mt-4 text-center text-sm text-gray-500">
                  Upgrade to Premium to see all risks
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="opportunities">
          <Card>
            <CardHeader>
              <CardTitle>Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              {renderRisksAndOpportunities(
                analysisResults.opportunities,
                "opportunities"
              )}
              {!isActive && (
                <p className="mt-4 text-center text-sm text-gray-500">
                  Upgrade to Premium to see all opportunities
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="details">
          {isActive ? (
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contract Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysisResults.keyClauses?.map((keyClause, index) => (
                      <motion.li key={index} className="flex items-center">
                        {keyClause}
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Recommdations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysisResults.recommendations?.map(
                      (recommendation, index) => (
                        <motion.li key={index} className="flex items-center">
                          {recommendation}
                        </motion.li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Contract Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Upgrade to Premium to see contract detailed analysis,
                  including key clauses and recommendations.
                </p>
                <Button className="mt-4">Upgrade to Premium</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Accordion type="single" collapsible className="mb-6">
        {renderPremiumAccordition(
          <>
            <AccordionItem value="contract-details">
              <AccordionTrigger>Contract Details</AccordionTrigger>
              <AccordionContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">
                      Duration and Termination
                    </h3>
                    <p>{analysisResults.contractDuration}</p>
                    <strong>Termination Conditions</strong>
                    <p>{analysisResults.terminationConditions}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Legal Informatiob</h3>
                    <p>
                      <strong>Legal Compliance</strong>
                      {analysisResults.legalCompliance}
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </>
        )}
      </Accordion>

      <Card>
        <CardHeader>
          <CardTitle>Negotiation Points</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid md:grid-cols-2 gap-2">
            {analysisResults.negotiationPoints?.map((point, index) => (
              <li className="flex items-center">{point}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
