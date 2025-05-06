
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDatasetStore } from '@/stores/datasetStore';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileUp, MoreVertical, Search, Trash, Eye } from 'lucide-react';

const DatasetList = () => {
  const { datasets, deleteDataset } = useDatasetStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const filteredDatasets = datasets.filter(dataset =>
    dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dataset.description && dataset.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const confirmDelete = (id: string) => {
    setDeletingId(id);
  };
  
  const handleDelete = () => {
    if (deletingId) {
      deleteDataset(deletingId);
      toast.success('Dataset deleted successfully');
      setDeletingId(null);
    }
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Datasets</h1>
          <p className="text-muted-foreground">Manage your imported datasets</p>
        </div>
        <Button className="mt-4 md:mt-0" asChild>
          <Link to="/import">
            <FileUp className="mr-2 h-4 w-4" />
            Import New Dataset
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <CardTitle>Your Datasets</CardTitle>
              <CardDescription>
                {filteredDatasets.length} {filteredDatasets.length === 1 ? 'dataset' : 'datasets'} available
              </CardDescription>
            </div>
            <div className="w-full md:w-72 mt-4 md:mt-0">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search datasets..." 
                  className="pl-8" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDatasets.length > 0 ? (
            <div className="overflow-x-auto">
              <Table className="data-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Rows</TableHead>
                    <TableHead>Columns</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDatasets.map((dataset) => (
                    <TableRow key={dataset.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{dataset.name}</div>
                          {dataset.description && (
                            <div className="text-xs text-muted-foreground max-w-xs truncate">
                              {dataset.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{dataset.rowCount}</TableCell>
                      <TableCell>{dataset.columns.length}</TableCell>
                      <TableCell>
                        {new Date(dataset.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/datasets/${dataset.id}`} className="flex items-center">
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View Details</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => confirmDelete(dataset.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mb-4 text-muted-foreground">
                {searchTerm ? 'No datasets match your search' : 'No datasets available'}
              </div>
              {!searchTerm && (
                <Button asChild>
                  <Link to="/import">
                    <FileUp className="mr-2 h-4 w-4" />
                    Import Your First Dataset
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
        {filteredDatasets.length > 0 && (
          <CardFooter className="border-t px-6 py-4">
            <div className="text-xs text-muted-foreground">
              Showing {filteredDatasets.length} of {datasets.length} datasets
            </div>
          </CardFooter>
        )}
      </Card>
      
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the dataset
              and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DatasetList;
