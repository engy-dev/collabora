
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Calculator } from 'lucide-react';
import { useDatasetStore, Dataset } from '@/stores/datasetStore';
import DatasetSelector from '@/components/DatasetSelector';

interface AnalysisResult {
  column: string;
  mean: number | string;
  median: number | string;
  min: number | string;
  max: number | string;
  stdDev: number | string;
}

const Analysis = () => {
  const navigate = useNavigate();
  const { datasets, currentDataset, setCurrentDataset } = useDatasetStore();
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const { toast } = useToast();

  // Handle dataset change
  const handleDatasetChange = (datasetId: string) => {
    setCurrentDataset(datasetId);
    // Reset analysis results when dataset changes
    setResults([]);
  };

  // Perform basic statistical analysis on the selected dataset
  const analyzeData = () => {
    if (!currentDataset) return;
    
    const numericColumns = currentDataset.columns
      .filter(column => column.type === 'number')
      .map(column => column.name);
    
    if (numericColumns.length === 0) {
      toast({
        title: "No numeric columns",
        description: "This dataset doesn't have any numeric columns to analyze",
        variant: "destructive",
      });
      return;
    }
    
    const newResults = numericColumns.map(column => {
      const values = currentDataset.previewData
        .map(row => parseFloat(row[column]))
        .filter(val => !isNaN(val));
      
      if (values.length === 0) {
        return {
          column,
          mean: 'N/A',
          median: 'N/A',
          min: 'N/A',
          max: 'N/A',
          stdDev: 'N/A'
        };
      }
      
      // Calculate mean
      const sum = values.reduce((acc, val) => acc + val, 0);
      const mean = sum / values.length;
      
      // Calculate median
      const sortedValues = [...values].sort((a, b) => a - b);
      const midIndex = Math.floor(sortedValues.length / 2);
      const median = sortedValues.length % 2 === 0
        ? (sortedValues[midIndex - 1] + sortedValues[midIndex]) / 2
        : sortedValues[midIndex];
      
      // Calculate min and max
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      // Calculate standard deviation
      const meanDiffsSquared = values.map(val => Math.pow(val - mean, 2));
      const variance = meanDiffsSquared.reduce((acc, val) => acc + val, 0) / values.length;
      const stdDev = Math.sqrt(variance);
      
      return {
        column,
        mean: mean.toFixed(2),
        median: median.toFixed(2),
        min: min.toFixed(2),
        max: max.toFixed(2),
        stdDev: stdDev.toFixed(2)
      };
    });
    
    setResults(newResults);
    
    toast({
      title: "Analysis Complete",
      description: `Analyzed ${numericColumns.length} numeric columns`,
    });
  };

  // Show warning if no datasets
  if (datasets.length === 0) {
    return (
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Data Analysis</h1>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No datasets available for analysis. Please import data first.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/import')}>Import Data</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Data Analysis</h1>
      
      {/* Dataset Selector */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Select Dataset</CardTitle>
          <CardDescription>Choose the dataset to analyze</CardDescription>
        </CardHeader>
        <CardContent>
          <DatasetSelector 
            datasets={datasets} 
            currentDatasetId={currentDataset?.id || ''} 
            onSelectDataset={handleDatasetChange} 
          />
          
          <div className="mt-4">
            <Button 
              onClick={analyzeData} 
              disabled={!currentDataset}
              className="flex items-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              Analyze Dataset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Statistical Analysis</CardTitle>
            <CardDescription>Basic statistics for numeric columns</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] w-full">
              <Table>
                <TableCaption>Statistical analysis of {currentDataset?.name}</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Column</TableHead>
                    <TableHead className="text-right">Mean</TableHead>
                    <TableHead className="text-right">Median</TableHead>
                    <TableHead className="text-right">Min</TableHead>
                    <TableHead className="text-right">Max</TableHead>
                    <TableHead className="text-right">Std Dev</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.column}>
                      <TableCell className="font-medium">{result.column}</TableCell>
                      <TableCell className="text-right">{result.mean}</TableCell>
                      <TableCell className="text-right">{result.median}</TableCell>
                      <TableCell className="text-right">{result.min}</TableCell>
                      <TableCell className="text-right">{result.max}</TableCell>
                      <TableCell className="text-right">{result.stdDev}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Analysis;
