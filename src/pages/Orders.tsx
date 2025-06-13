import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Package, Edit, Trash2, TrendingUp, AlertTriangle, DollarSign, Box, Plus } from "lucide-react";
import { mongoDBService } from "@/services/mongodb";
import { IOrder, IProduct } from "@/types/models";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/format";
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
    <div className="container mx-auto py-6 space-y-6">
      {/* Statistics Section */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <Box className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <h3 className="text-2xl font-bold">{stats.totalOrders}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <h3 className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="flex-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <AlertTriangle className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                <h3 className="text-2xl font-bold">{stats.pendingOrders}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="flex-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Completed Orders</p>
                <h3 className="text-2xl font-bold">{stats.completedOrders}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Orders</CardTitle>
              <CardDescription>Manage your orders</CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Order
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search orders..." 
                  className="pl-8"
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
                <SelectTrigger className="w-[180px]">
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {orders.map((order) => (
                  <Card key={order._id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">Order #{order._id}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusVariant(order.status as OrderStatus)}>
                            {order.status}
                          </Badge>
                          <span className="font-semibold">{formatCurrency(order.totalAmount || 0)}</span>
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
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-6">
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
