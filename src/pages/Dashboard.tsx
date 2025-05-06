
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { BarChart, LineChart, PieChart } from 'recharts';
import { BarChart2, FileUp, Layers, ChartPie } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDatasetStore } from '@/stores/datasetStore';
import { useUserStore } from '@/stores/userStore';

// Sample data for charts
const sampleBarData = [
  { name: 'Group A', value: 400 },
  { name: 'Group B', value: 300 },
  { name: 'Group C', value: 200 },
  { name: 'Group D', value: 278 },
];

const sampleLineData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 200 },
  { name: 'Apr', value: 278 },
  { name: 'May', value: 189 },
  { name: 'Jun', value: 239 },
];

const samplePieData = [
  { name: 'Group A', value: 400 },
  { name: 'Group B', value: 300 },
  { name: 'Group C', value: 300 },
  { name: 'Group D', value: 200 },
];

const Dashboard = () => {
  const { datasets } = useDatasetStore();
  const { user } = useUserStore();

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name || 'User'}</p>
        </div>
        <Button asChild>
          <Link to="/import">
            <FileUp className="mr-2 h-4 w-4" />
            Import Data
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-medium">Datasets</CardTitle>
            <CardDescription>Total datasets in your workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="h-8 w-8 text-primary" />
                <span className="text-4xl font-bold">{datasets.length}</span>
              </div>
              <Button variant="outline" asChild>
                <Link to="/datasets">View all</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-medium">Visualizations</CardTitle>
            <CardDescription>Created charts and graphs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart2 className="h-8 w-8 text-primary" />
                <span className="text-4xl font-bold">{datasets.length > 0 ? datasets.length : 0}</span>
              </div>
              <Button variant="outline" asChild>
                <Link to="/visualizations">View all</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-medium">Recent Activity</CardTitle>
            <CardDescription>Latest actions taken</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[100px]">
              <div className="space-y-2 text-sm">
                {datasets.length > 0 ? (
                  datasets.slice(0, 3).map((dataset, i) => (
                    <div key={dataset.id} className="flex justify-between items-center">
                      <span>Imported: {dataset.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(dataset.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p>No recent activity</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Example Visualizations</CardTitle>
            <CardDescription>
              Preview of data visualization capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-md">
              {datasets.length > 0 ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Link to="/visualizations" className="flex flex-col items-center">
                    <ChartPie className="h-16 w-16 mb-4 text-primary" />
                    <Button>Create Visualizations</Button>
                  </Link>
                </div>
              ) : (
                <p className="text-muted-foreground">Import a dataset to create visualizations</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Datasets</CardTitle>
            <CardDescription>
              Your recently imported datasets
            </CardDescription>
          </CardHeader>
          <CardContent>
            {datasets.length > 0 ? (
              <ScrollArea className="h-64">
                <div className="space-y-4">
                  {datasets.map((dataset) => (
                    <div 
                      key={dataset.id}
                      className="p-3 rounded-md border border-border hover:bg-accent transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{dataset.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {dataset.rowCount} rows • {dataset.columns.length} columns
                          </p>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/datasets/${dataset.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center space-y-4">
                <p className="text-muted-foreground">No datasets available</p>
                <Button asChild>
                  <Link to="/import">
                    <FileUp className="mr-2 h-4 w-4" />
                    Import Data
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
