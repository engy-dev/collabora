
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dataset } from '@/stores/datasetStore';

interface DatasetSelectorProps {
  datasets: Dataset[];
  currentDatasetId: string;
  onSelectDataset: (datasetId: string) => void;
}

const DatasetSelector: React.FC<DatasetSelectorProps> = ({ 
  datasets, 
  currentDatasetId, 
  onSelectDataset 
}) => {
  return (
    <Select value={currentDatasetId} onValueChange={onSelectDataset}>
      <SelectTrigger>
        <SelectValue placeholder="Select dataset" />
      </SelectTrigger>
      <SelectContent>
        {datasets.map((dataset) => (
          <SelectItem key={dataset.id} value={dataset.id}>
            {dataset.name} ({dataset.columns.length} columns, {dataset.rowCount} rows)
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default DatasetSelector;
