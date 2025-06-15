import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Edit, Trash2, TrendingUp, AlertTriangle, DollarSign, Box } from "lucide-react";
import { mongoDBService } from "@/services/mongodb";
import { IProduct } from "@/types/models";
import AddProductDialog from "@/components/products/AddProductDialog";
import EditProductDialog from "@/components/products/EditProductDialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCurrency, formatNumber } from "@/utils/format";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductStats {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  topCategories: { category: string; count: number }[];
  categoryData: { name: string; value: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4'];

export default function Products() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [stats, setStats] = useState<ProductStats>({
    totalProducts: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    topCategories: [],
    categoryData: [],
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [status, setStatus] = useState("all");

  useEffect(() => {
    loadProducts();
  }, [pagination.page, pagination.limit, searchQuery]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await mongoDBService.getProducts({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      setProducts(response?.products || []);
      setPagination(prev => ({
        ...prev,
        total: response?.total || 0,
        totalPages: response?.totalPages || 0
      }));
      calculateStats(response?.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (productData: IProduct[]) => {
    const categoryCount = productData.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const categoryData = Object.entries(categoryCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const totalValue = productData.reduce((sum, product) => sum + (product.price * product.stock), 0);
    const lowStockItems = productData.filter(product => product.stock > 0 && product.stock <= 5).length;
    const outOfStockItems = productData.filter(product => product.stock === 0).length;

    setStats({
      totalProducts: productData.length,
      totalValue,
      lowStockItems,
      outOfStockItems,
      topCategories,
      categoryData,
    });
  };

  const handleAddProduct = async (productData: Omit<IProduct, '_id' | 'createdAt'>) => {
    try {
      await mongoDBService.createProduct(productData);
      toast({
        title: "Success",
        description: "Product added successfully",
      });
      await loadProducts();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = async (productData: Partial<IProduct>) => {
    if (!selectedProduct) return;
    
    try {
      await mongoDBService.updateProduct(selectedProduct._id, productData);
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      await loadProducts();
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      await mongoDBService.deleteProduct(selectedProduct._id);
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      await loadProducts();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-responsive">
      <div className="container-responsive">
        <h1 className="text-heading">Products</h1>
        <p className="text-responsive text-muted-foreground">
          Manage your product inventory and track stock levels
        </p>
      </div>

      {/* Statistics Section */}
      <div className="flex flex-wrap gap-responsive">
        <div className="dashboard-card">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="dashboard-label">Total Products</h3>
            <Box className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="dashboard-stat">{formatNumber(stats.totalProducts)}</div>
          <p className="dashboard-description">
            Products in inventory
          </p>
        </div>

        <div className="dashboard-card">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="dashboard-label">Total Value</h3>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="dashboard-stat">{formatCurrency(stats.totalValue)}</div>
          <p className="dashboard-description">
            Total inventory value
          </p>
        </div>

        <div className="dashboard-card">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="dashboard-label">Low Stock Items</h3>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="dashboard-stat">{formatNumber(stats.lowStockItems)}</div>
          <p className="dashboard-description">
            Items with stock ≤ 5
          </p>
        </div>

        <div className="dashboard-card">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="dashboard-label">Out of Stock</h3>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="dashboard-stat">{formatNumber(stats.outOfStockItems)}</div>
          <p className="dashboard-description">
            Items with zero stock
          </p>
        </div>
      </div>

      {/* Main Content Section - Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Products List Section */}
        <Card className="lg:col-span-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Product List</CardTitle>
                <CardDescription>Manage your products inventory</CardDescription>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
                <Package className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search products..." 
                    className="pl-8 w-full sm:w-64"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                  />
                </div>
                <Select 
                  value={status} 
                  onValueChange={(value) => setStatus(value)}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
                  
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="loading-skeleton w-8 h-8 rounded-full animate-spin"></div>
                <span className="ml-2 text-muted-foreground">Loading products...</span>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {products.length > 0 ? (
                    products.map((product) => (
                      <Card key={product._id || Math.random()}>
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold">{product.name || 'Unnamed Product'}</h3>
                              <p className="text-sm text-muted-foreground">{product.category || 'Uncategorized'}</p>
                              <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                              <Badge variant={product.stock && product.stock > 0 ? "default" : "destructive"}>
                                {product.stock && product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
                              </Badge>
                              <span className="font-semibold">{formatCurrency(product.price || 0)}</span>
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setSelectedProduct(product);
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setSelectedProduct(product);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No products found</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchQuery ? 'Try adjusting your search criteria.' : 'Get started by adding your first product.'}
                      </p>
                      {!searchQuery && (
                        <Button onClick={() => setIsAddDialogOpen(true)}>
                          <Package className="mr-2 h-4 w-4" />
                          Add Product
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {products.length > 0 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                    <div className="text-sm text-muted-foreground">
                      Showing {products.length} of {pagination.total} products
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Visual representation of product categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              {stats.categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={120}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {stats.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value} products`, 'Count']}
                    />
                    <Legend 
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No category data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AddProductDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddProduct}
      />

      {selectedProduct && (
        <>
          <EditProductDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            product={selectedProduct}
            onSubmit={handleEditProduct}
          />

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the product
                  "{selectedProduct.name}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteProduct}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
