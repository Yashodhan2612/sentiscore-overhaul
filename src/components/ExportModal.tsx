import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { FileText, FileSpreadsheet, Table } from "lucide-react";

type ExportType = "pdf" | "excel" | "csv";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportType: ExportType;
  companyName: string;
  ticker: string;
}

const ExportModal = ({ open, onOpenChange, exportType, companyName, ticker }: ExportModalProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [pdfFormat, setPdfFormat] = useState("standard");
  
  // PDF options
  const [pdfOptions, setPdfOptions] = useState({
    executiveSummary: true,
    allScores: true,
    managementTone: true,
    productIntelligence: true,
    risksCatalysts: true,
    evidenceAppendix: false,
    chartsVisualizations: true,
  });

  // Excel sheet options
  const [excelSheets, setExcelSheets] = useState({
    overview: true,
    detailedScores: true,
    managementTone: true,
    productIntelligence: true,
    risksCatalysts: true,
    rawData: false,
  });

  // CSV column options
  const [csvColumns, setCsvColumns] = useState({
    scores: true,
    sentimentData: true,
    productData: true,
    risksCatalysts: true,
    transcriptExcerpts: false,
  });

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    // Simulate export progress
    const progressInterval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate export delay
    setTimeout(() => {
      clearInterval(progressInterval);
      setExportProgress(100);
      
      // In real implementation, trigger actual export here
      console.log(`Exporting ${exportType} for ${ticker} - ${companyName}`);
      
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
        onOpenChange(false);
      }, 500);
    }, 2000);
  };

  const getTitle = () => {
    switch (exportType) {
      case "pdf":
        return "Configure PDF Report";
      case "excel":
        return "Configure Excel Workbook";
      case "csv":
        return "Configure CSV Export";
    }
  };

  const getIcon = () => {
    switch (exportType) {
      case "pdf":
        return <FileText className="h-5 w-5 text-primary" />;
      case "excel":
        return <FileSpreadsheet className="h-5 w-5 text-positive" />;
      case "csv":
        return <Table className="h-5 w-5 text-info" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-surface border-border">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {getIcon()}
            <DialogTitle className="text-foreground">{getTitle()}</DialogTitle>
          </div>
          <DialogDescription className="text-text-secondary">
            {companyName} ({ticker})
          </DialogDescription>
        </DialogHeader>

        {!isExporting ? (
          <div className="space-y-6 py-4">
            {/* PDF Options */}
            {exportType === "pdf" && (
              <>
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-foreground">Include Sections</Label>
                  <div className="space-y-3">
                    {Object.entries(pdfOptions).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={value}
                          onCheckedChange={(checked) =>
                            setPdfOptions({ ...pdfOptions, [key]: checked as boolean })
                          }
                        />
                        <Label
                          htmlFor={key}
                          className="text-sm text-foreground cursor-pointer capitalize"
                        >
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">Format</Label>
                  <RadioGroup value={pdfFormat} onValueChange={setPdfFormat}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard" className="text-sm text-foreground cursor-pointer">
                        Standard
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="detailed" id="detailed" />
                      <Label htmlFor="detailed" className="text-sm text-foreground cursor-pointer">
                        Detailed
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="executive" id="executive" />
                      <Label htmlFor="executive" className="text-sm text-foreground cursor-pointer">
                        Executive Summary Only
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </>
            )}

            {/* Excel Options */}
            {exportType === "excel" && (
              <div className="space-y-4">
                <Label className="text-sm font-medium text-foreground">Include Sheets</Label>
                <div className="space-y-3">
                  {Object.entries(excelSheets).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) =>
                          setExcelSheets({ ...excelSheets, [key]: checked as boolean })
                        }
                      />
                      <Label
                        htmlFor={key}
                        className="text-sm text-foreground cursor-pointer capitalize"
                      >
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CSV Options */}
            {exportType === "csv" && (
              <div className="space-y-4">
                <Label className="text-sm font-medium text-foreground">Include Columns</Label>
                <div className="space-y-3">
                  {Object.entries(csvColumns).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) =>
                          setCsvColumns({ ...csvColumns, [key]: checked as boolean })
                        }
                      />
                      <Label
                        htmlFor={key}
                        className="text-sm text-foreground cursor-pointer capitalize"
                      >
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="hover:bg-surface-elevated">
                Cancel
              </Button>
              <Button onClick={handleExport}>
                Generate {exportType.toUpperCase()}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-8">
            <div className="text-center space-y-2">
              <p className="text-sm text-foreground">Generating export...</p>
              <p className="text-xs text-text-secondary">This may take a few moments</p>
            </div>
            <Progress value={exportProgress} className="h-2" />
            <p className="text-center text-xs text-text-tertiary">{exportProgress}%</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
