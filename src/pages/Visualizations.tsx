
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChartContainer } from '@/components/ui/chart';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, BarChart2, ChartPie, LineChart } from 'lucide-react';
import { useDatasetStore } from '@/stores/datasetStore';
import DatasetSelector from '@/components/DatasetSelector';
import VisualizationChart from '@/components/VisualizationChart';

const Visualizations = () => {
  const { datasetId } = useParams();
  const navigate = useNavigate();
  const { datasets, currentDataset, setCurrentDataset } = useDatasetStore();
  const [chartType, setChartType] = useState<string>('bar');
  const [xAxis, setXAxis] = useState<string>('');
  const [yAxis, setYAxis] = useState<string>('');
  const { toast } = useToast();

  // Select the first dataset if none is selected or set current dataset based on URL param
  useEffect(() => {
    if (datasetId) {
      setCurrentDataset(datasetId);
    } else if (datasets.length > 0 && !currentDataset) {
      setCurrentDataset(datasets[0].id);
      navigate(`/visualizations/${datasets[0].id}`);
    }
  }, [datasetId, datasets, currentDataset, setCurrentDataset, navigate]);

  const handleDatasetChange = (datasetId: string) => {
    setCurrentDataset(datasetId);
    navigate(`/visualizations/${datasetId}`);
    setXAxis('');
    setYAxis('');
  };

  // Reset axes when chart type changes
  const handleChartTypeChange = (value: string) => {
    setChartType(value);
    setXAxis('');
    setYAxis('');
  };

  // Get column options based on dataset and column type
  const getColumnOptions = (type: 'string' | 'number' | 'date' | 'boolean' | null = null) => {
    if (!currentDataset) return [];
    
    return currentDataset.columns
      .filter(col => type === null || col.type === type)
      .map(col => ({ value: col.name, label: col.name }));
  };

  // Get all numeric columns
  const numericColumns = getColumnOptions('number');
  
  // Get all categorical columns (strings or booleans)
  const categoricalColumns = getColumnOptions('string').concat(getColumnOptions('boolean'));
  
  // Get date columns
  const dateColumns = getColumnOptions('date');

  // Show warning if no datasets
  if (datasets.length === 0) {
    return (
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Visualizations</h1>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No datasets available for visualization. Please import data first.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/import')}>Import Data</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Visualizations</h1>
      
      {/* Dataset Selector */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Select Dataset</CardTitle>
          <CardDescription>Choose the dataset to visualize</CardDescription>
        </CardHeader>
        <CardContent>
          <DatasetSelector 
            datasets={datasets} 
            currentDatasetId={currentDataset?.id || ''} 
            onSelectDataset={handleDatasetChange} 
          />
        </CardContent>
      </Card>

      {currentDataset && (
        <>
          {/* Chart Configuration */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Chart Configuration</CardTitle>
              <CardDescription>Configure your visualization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium">Chart Type</label>
                  <Select value={chartType} onValueChange={handleChartTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select chart type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                      <SelectItem value="scatter">Scatter Plot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium">X Axis / Category</label>
                  <Select value={xAxis} onValueChange={setXAxis}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {(chartType === 'bar' || chartType === 'pie' ? 
                        categoricalColumns : 
                        chartType === 'line' ? 
                          dateColumns.length > 0 ? dateColumns : categoricalColumns : 
                          numericColumns)
                        .map(col => (
                          <SelectItem key={col.value} value={col.value}>
                            {col.label}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>

                {chartType !== 'pie' && (
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium">Y Axis / Value</label>
                    <Select value={yAxis} onValueChange={setYAxis}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {numericColumns.map(col => (
                          <SelectItem key={col.value} value={col.value}>
                            {col.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Visualization Area */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center justify-between">
                  <span>Visualization</span>
                  {((!xAxis || (!yAxis && chartType !== 'pie'))) && (
                    <span className="text-sm text-muted-foreground">
                      Select columns to visualize
                    </span>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] w-full">
                {xAxis && (chartType === 'pie' || yAxis) ? (
                  <VisualizationChart 
                    data={currentDataset.previewData}
                    chartType={chartType}
                    xAxisKey={xAxis}
                    yAxisKey={yAxis}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center border border-dashed rounded-lg">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      {chartType === 'bar' && <BarChart2 className="mb-2 h-10 w-10" />}
                      {chartType === 'line' && <LineChart className="mb-2 h-10 w-10" />}
                      {chartType === 'pie' && <ChartPie className="mb-2 h-10 w-10" />}
                      <p>Select columns to visualize</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Visualizations;
