"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UploadModal } from "@/components/modals/upload-modal";

export default function PaymentSuccess() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              Payment was Cancelled
            </CardTitle>
            <CardDescription>
              Something went wrong with your payment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>To recieive your analysis, you need to upload an PDF.</p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <div className="flex items-center">
                  <p className="text-sm text-blue-700 text-left">
                    <strong>Note:</strong>
                    <br />
                    Your payment was cancelled. please contact our support team
                    if u need any help
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex flex-col w-full space-y-2">
              <Button
                onClick={() => setIsUploadModalOpen(true)}
                className="w-full"
              >
                Upload for Full Analysis
              </Button>
              <Button className="w-full" asChild variant="outline">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={() => setIsUploadModalOpen(true)}
      />
    </>
  );
}
