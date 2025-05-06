
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useDatasetStore, Column } from '@/stores/datasetStore';
import { useUserStore } from '@/stores/userStore';
import { FileUp, File, X, Check } from 'lucide-react';

// Simple CSV parser
const parseCSV = (text: string): { headers: string[], rows: string[][] } => {
  const lines = text.split('\n');
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0].split(',').map(h => h.trim());
  
  const rows = lines.slice(1)
    .filter(line => line.trim() !== '')
    .map(line => line.split(',').map(cell => cell.trim()));
    
  return { headers, rows };
};

// Function to detect column types
const detectColumnType = (values: string[]): Column['type'] => {
  const nonEmptyValues = values.filter(v => v !== '');
  if (nonEmptyValues.length === 0) return 'string';
  
  // Check if all values are numbers
  const areNumbers = nonEmptyValues.every(v => !isNaN(Number(v)));
  if (areNumbers) return 'number';
  
  // Check if all values are dates
  const dateRegex = /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$/;
  const areDates = nonEmptyValues.every(v => dateRegex.test(v));
  if (areDates) return 'date';
  
  // Check if all values are booleans
  const boolValues = ['true', 'false', '0', '1', 'yes', 'no'];
  const areBooleans = nonEmptyValues.every(v => boolValues.includes(v.toLowerCase()));
  if (areBooleans) return 'boolean';
  
  return 'string';
};

const DataImport = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { addDataset } = useDatasetStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [datasetName, setDatasetName] = useState('');
  const [datasetDescription, setDatasetDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<{ headers: string[], rows: string[][] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const selectedFile = files[0];
    
    // Validate file type
    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Only CSV files are supported');
      event.target.value = '';
      return;
    }
    
    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      event.target.value = '';
      return;
    }
    
    setFile(selectedFile);
    setDatasetName(selectedFile.name.replace('.csv', ''));
    
    // Read file for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const result = parseCSV(content);
        
        // Limit preview to 10 rows
        result.rows = result.rows.slice(0, 10);
        setPreviewData(result);
      } catch (error) {
        toast.error('Error parsing CSV file');
      }
    };
    reader.readAsText(selectedFile);
  };
  
  const handleSubmit = async () => {
    if (!file || !previewData) {
      toast.error('Please select a file');
      return;
    }
    
    if (!datasetName.trim()) {
      toast.error('Please enter a dataset name');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // In a real app, we would upload the file to the server here
      // For demo purposes, we'll just parse the file locally
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const { headers, rows } = parseCSV(content);
          
          // Detect column types
          const columns: Column[] = headers.map((name, index) => {
            const columnValues = rows.map(row => row[index]);
            const type = detectColumnType(columnValues);
            return { name, type };
          });
          
          // Convert rows to objects for easier processing
          const rowObjects = rows.map(row => {
            const obj: Record<string, any> = {};
            headers.forEach((header, index) => {
              const value = row[index];
              const columnType = columns.find(col => col.name === header)?.type;
              
              if (columnType === 'number') {
                obj[header] = value ? Number(value) : null;
              } else if (columnType === 'boolean') {
                obj[header] = ['true', '1', 'yes'].includes(value.toLowerCase());
              } else {
                obj[header] = value;
              }
            });
            return obj;
          });
          
          // Add the dataset to the store
          addDataset({
            name: datasetName,
            description: datasetDescription,
            createdAt: new Date(),
            createdBy: user?.id || 'anonymous',
            rowCount: rows.length,
            columns,
            previewData: rowObjects.slice(0, 10),
          });
          
          toast.success('Dataset imported successfully');
          navigate('/datasets');
        } catch (error) {
          toast.error('Error processing file');
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      toast.error('Error importing dataset');
      setIsLoading(false);
    }
  };
  
  const clearSelection = () => {
    setFile(null);
    setPreviewData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Import Dataset</h1>
        <p className="text-muted-foreground">Upload and import your data files</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Dataset Details</CardTitle>
              <CardDescription>
                Provide information about your dataset
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Dataset Name
                </label>
                <Input 
                  placeholder="Enter a name for your dataset"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Description (optional)
                </label>
                <Textarea 
                  placeholder="Enter a description"
                  value={datasetDescription}
                  onChange={(e) => setDatasetDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  File Upload
                </label>
                <div className="mt-2">
                  {!file ? (
                    <div className="border-2 border-dashed border-border rounded-md p-6 flex flex-col items-center">
                      <FileUp className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">CSV (up to 5MB)</p>
                      <Input 
                        ref={fileInputRef}
                        type="file" 
                        className="hidden" 
                        onChange={handleFileChange}
                        accept=".csv"
                      />
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Select File
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between border rounded-md p-3">
                      <div className="flex items-center">
                        <File className="h-5 w-5 mr-2 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={clearSelection}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleSubmit}
                disabled={!file || isLoading}
              >
                {isLoading ? 'Processing...' : 'Import Dataset'}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Data Preview</CardTitle>
              <CardDescription>
                Preview of the first 10 rows from your file
              </CardDescription>
            </CardHeader>
            <CardContent>
              {previewData ? (
                <div className="overflow-auto">
                  <Table className="data-table min-w-[600px]">
                    <TableHeader>
                      <TableRow>
                        {previewData.headers.map((header, index) => (
                          <TableHead key={`header-${index}`}>{header}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.rows.map((row, rowIndex) => (
                        <TableRow key={`row-${rowIndex}`}>
                          {row.map((cell, cellIndex) => (
                            <TableCell key={`cell-${rowIndex}-${cellIndex}`}>
                              {cell}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed rounded-md">
                  <p className="text-muted-foreground">
                    Upload a CSV file to preview its contents
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DataImport;
