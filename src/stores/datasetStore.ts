
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Column {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
}

export interface Dataset {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  createdBy: string;
  rowCount: number;
  columns: Column[];
  previewData: Record<string, any>[];
}

interface DatasetState {
  datasets: Dataset[];
  currentDataset: Dataset | null;
  isLoading: boolean;
  error: string | null;
  addDataset: (dataset: Omit<Dataset, 'id'>) => void;
  setCurrentDataset: (datasetId: string) => void;
  deleteDataset: (datasetId: string) => void;
}

export const useDatasetStore = create<DatasetState>()(
  persist(
    (set, get) => ({
      datasets: [],
      currentDataset: null,
      isLoading: false,
      error: null,
      
      addDataset: (dataset) => {
        const newDataset = {
          ...dataset,
          id: crypto.randomUUID(),
        };
        
        set((state) => ({
          datasets: [...state.datasets, newDataset],
          currentDataset: newDataset,
        }));
      },
      
      setCurrentDataset: (datasetId) => {
        const dataset = get().datasets.find(d => d.id === datasetId);
        if (dataset) {
          set({ currentDataset: dataset });
        }
      },
      
      deleteDataset: (datasetId) => {
        set((state) => ({
          datasets: state.datasets.filter(d => d.id !== datasetId),
          currentDataset: state.currentDataset?.id === datasetId ? null : state.currentDataset,
        }));
      },
    }),
    {
      name: 'dataset-storage',
      partialize: (state) => ({ datasets: state.datasets }),
    }
  )
);
