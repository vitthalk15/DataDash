import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Edit, Trash2, TrendingUp, AlertTriangle, DollarSign, Box, Plus } from "lucide-react";
import { mongoDBService } from "@/services/mongodb";
import { IOrder, IProduct } from "@/types/models";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatNumber } from "@/utils/format";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddOrderDialog from "@/components/orders/AddOrderDialog";
import EditOrderDialog from "@/components/orders/EditOrderDialog";

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  topProducts: { product: string; count: number }[];
}

interface OrderResponse {
  orders: IOrder[];
  total: number;
  totalPages: number;
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export default function Orders() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    topProducts: [],
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [status, setStatus] = useState<OrderStatus | 'all'>("all");

  useEffect(() => {
    loadOrders();
  }, [pagination.page, pagination.limit, searchQuery, status]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await mongoDBService.getOrders({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery || undefined,
        status: status !== 'all' ? status : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      if (!response) {
        throw new Error('No response from server');
      }

      const orderResponse = response as unknown as OrderResponse;
      setOrders(orderResponse.orders || []);
      setPagination(prev => ({
        ...prev,
        total: orderResponse.total || 0,
        totalPages: orderResponse.totalPages || 0
      }));
      calculateStats(orderResponse.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (orderData: IOrder[]) => {
    const productCount = orderData.reduce((acc, order) => {
      order.products.forEach(item => {
        const product = item.product as IProduct;
        const productName = product?.name || 'Unknown Product';
        acc[productName] = (acc[productName] || 0) + item.quantity;
      });
      return acc;
    }, {} as Record<string, number>);

    const topProducts = Object.entries(productCount)
      .map(([product, count]) => ({ product, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const totalRevenue = orderData.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const pendingOrders = orderData.filter(order => order.status === 'pending').length;
    const completedOrders = orderData.filter(order => order.status === 'delivered').length;

    setStats({
      totalOrders: orderData.length,
      totalRevenue,
      pendingOrders,
      completedOrders,
      topProducts,
    });
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder?._id) return;
    
    try {
      await mongoDBService.deleteOrder(selectedOrder._id);
      toast({
        title: "Success",
        description: "Order deleted successfully",
      });
      loadOrders();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: "Error",
        description: "Failed to delete order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusVariant = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'processing':
      case 'shipped':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleAddOrder = async (orderData: Partial<IOrder>) => {
    try {
      await mongoDBService.createOrder(orderData);
      toast({
        title: "Success",
        description: "Order created successfully",
      });
      loadOrders();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditOrder = async (orderData: Partial<IOrder>) => {
    if (!selectedOrder?._id) return;
    
    try {
      await mongoDBService.updateOrder(selectedOrder._id, orderData);
      toast({
        title: "Success",
        description: "Order updated successfully",
      });
      loadOrders();
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-responsive">
      <div className="container-responsive">
        <h1 className="text-heading">Orders</h1>
        <p className="text-responsive text-muted-foreground">
          Manage and track your orders
        </p>
      </div>

      {/* Statistics Section */}
      <div className="flex flex-wrap gap-responsive">
        <div className="dashboard-card">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="dashboard-label">Total Orders</h3>
            <Box className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="dashboard-stat">{formatNumber(stats.totalOrders)}</div>
          <p className="dashboard-description">
            All orders
          </p>
        </div>

        <div className="dashboard-card">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="dashboard-label">Total Revenue</h3>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="dashboard-stat">{formatCurrency(stats.totalRevenue)}</div>
          <p className="dashboard-description">
            Total revenue from orders
          </p>
        </div>

        <div className="dashboard-card">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="dashboard-label">Pending Orders</h3>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="dashboard-stat">{formatNumber(stats.pendingOrders)}</div>
          <p className="dashboard-description">
            Orders awaiting processing
          </p>
        </div>

        <div className="dashboard-card">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="dashboard-label">Completed Orders</h3>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="dashboard-stat">{formatNumber(stats.completedOrders)}</div>
          <p className="dashboard-description">
            Successfully delivered orders
          </p>
        </div>
      </div>

      {/* Main Content Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Order List</CardTitle>
              <CardDescription>Manage your orders</CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Order
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search orders..." 
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
                onValueChange={(value) => setStatus(value as OrderStatus | 'all')}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="loading-skeleton w-8 h-8 rounded-full animate-spin"></div>
              <span className="ml-2 text-muted-foreground">Loading orders...</span>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <Card key={order._id}>
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold">Order #{order._id?.slice(-6)}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {typeof order.user === 'string' ? order.user : order.user?.name || 'Unknown Customer'}
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <Badge variant={getStatusVariant(order.status as OrderStatus)}>
                              {order.status}
                            </Badge>
                            <span className="font-semibold">{formatCurrency(order.totalAmount || 0)}</span>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setSelectedOrder(order);
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
                    <h3 className="text-lg font-medium mb-2">No orders found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery ? 'Try adjusting your search criteria.' : 'Get started by creating your first order.'}
                    </p>
                    {!searchQuery && (
                      <Button onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Order
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {orders.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                  <div className="text-sm text-muted-foreground">
                    Showing {orders.length} of {pagination.total} orders
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

      <AddOrderDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddOrder}
      />

      {selectedOrder && (
        <>
          <EditOrderDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            order={selectedOrder}
            onSubmit={handleEditOrder}
          />

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the order
                  #{selectedOrder._id}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteOrder}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
