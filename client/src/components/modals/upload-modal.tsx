import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { useContractStore } from "@/store/zustand";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, FileText, Loader2, Sparkles, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useRouter } from "next/navigation";

interface IUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
}

export function UploadModal({
  isOpen,
  onClose,
  onUploadComplete,
}: IUploadModalProps) {
  const { setAnalysisResults } = useContractStore();
  const router = useRouter();

  const [detectedType, setDetectedType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [step, setStep] = useState<
    "upload" | "detecting" | "confirm" | "processing" | "done"
  >("upload");

  const { mutate: detectContractType } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("contract", file);

      const response = await api.post<{ detectedType: string }>(
        `/contracts/detect-type`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data.detectedType;
    },

    onSuccess: (data: string) => {
      setDetectedType(data);
      setStep("confirm");
    },
    onError: (error) => {
      console.error(error);
      setError("Failed to detect contract type");
      setStep("upload");
    },
  });

  const { mutate: uploadFile, isPending: isProcessing } = useMutation({
    mutationFn: async ({
      file,
      contractType,
    }: {
      file: File;
      contractType: string;
    }) => {
      const formData = new FormData();
      formData.append("contract", file);
      formData.append("contractType", contractType);

      const response = await api.post(`/contracts/analyze`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(response.data);
      return response.data;
    },
    onSuccess: (data) => {
      setAnalysisResults(data);
      setStep("done");
      onUploadComplete();
    },
    onError: (error) => {
      console.error(error);
      setError("Failed to upload contract");
      setStep("upload");
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFiles(acceptedFiles);
      setError(null);
      setStep("upload");
    } else {
      setError("No file selected");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleFileUpload = () => {
    if (files.length > 0) {
      setStep("detecting");
      detectContractType(files[0]);
    }
  };

  const handleAnalyzeContract = () => {
    if (files.length > 0 && detectedType) {
      setStep("processing");
      uploadFile({ file: files[0], contractType: detectedType });
    }
  };

  const handleClose = () => {
    onClose();
    setFiles([]);
    setDetectedType(null);
    setError(null);
    setStep("upload");
  };

  const renderContent = () => {
    switch (step) {
      case "upload": {
        return (
          <AnimatePresence>
            <motion.div>
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 mt-8 mb-4 text-center transition-colors",
                  isDragActive
                    ? "border-primary bg-primary/10"
                    : "border-gray-300 hover:border-gray-400"
                )}
              >
                <input {...getInputProps()} />
                <motion.div>
                  <FileText className="mx-auto size-16 text-primary" />
                </motion.div>
                <p className="mt-4 text-sm text-gray-600">
                  Drag &apos;n&apos; drop some files here, or click to select
                  files
                </p>
                <p className="bg-yellow-500/30 border border-yellow-500 border-dashed text-yellow-700 p-2 rounded mt-2">
                  Note: Only PDF files are accepted
                </p>
              </div>
              {files.length > 0 && (
                <div className="mt-4 bg-green-500/30 border border-green-500 border-dashed text-green-700 p-2 rounded flex items-center justify-between">
                  <span>
                    {files[0].name}{" "}
                    <span className="text-sm text-gray-600">
                      ({files[0].size} bytes)
                    </span>
                  </span>
                  <Button
                    variant={"ghost"}
                    size={"sm"}
                    className="hover:bg-green-500"
                    onClick={() => setFiles([])}
                  >
                    <Trash className="size-5 hover:text-green-900" />
                  </Button>
                </div>
              )}
              {files.length > 0 && !isProcessing && (
                <Button className="mt-4 w-full mb-4" onClick={handleFileUpload}>
                  <Sparkles className="mr-2 size-4" />
                  Analyze Contract With AI
                </Button>
              )}
            </motion.div>
          </AnimatePresence>
        );
      }
      case "detecting": {
        return (
          <AnimatePresence>
            <motion.div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="size-16 animate-spin text-primary" />
              <p className="mt-4 text-lg font-semibold">
                Detecting contract type...
              </p>
            </motion.div>
          </AnimatePresence>
        );
      }
      case "confirm": {
        return (
          <AnimatePresence>
            <motion.div>
              <div className="flex flex-col space-y-4 mb-4">
                <p>
                  We have detected the following contract type:
                  <span className="font-semibold"> {detectedType}</span>
                </p>
                <p>Would you like to analyze this contract with our AI?</p>
              </div>
              <div className="flex space-x-4">
                <Button onClick={handleAnalyzeContract}>
                  Yes, I want to analyze it
                </Button>
                <Button
                  onClick={() => setStep("upload")}
                  variant={"outline"}
                  className="flex-1"
                >
                  No, Try another file
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        );
      }
      case "processing": {
        return (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-8"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Brain className="size-20 text-primary" />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-lg font-semibold text-gray-700"
              >
                AI is analyzing your contract...
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-2 text-sm text-gray-700"
              >
                This may take some time.
              </motion.p>
              <motion.div
                className="w-64 h-2 bg-gray-200 rounded-full mt-6 overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 10, ease: "linear" }}
              >
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 10, ease: "linear" }}
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        );
      }
      case "done": {
        return (
          <AnimatePresence>
            <motion.div>
              <Alert className="mt-4">
                <AlertTitle>Analysis completed</AlertTitle>
                <AlertDescription>
                  Your contract has been analyzed. you can now view the results
                </AlertDescription>
              </Alert>

              <motion.div className="mt-6 flex flex-col space-y-3 relative">
                <Button onClick={() => router.push(`/dashboard/results`)}>
                  View results
                </Button>
                <Button variant={"outline"} onClick={handleClose}>
                  Close
                </Button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        );
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>{renderContent()}</DialogContent>
    </Dialog>
  );
}
