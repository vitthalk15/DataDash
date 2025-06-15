import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mongoDBService } from "@/services/mongodb";
import { IOrder, IProduct } from "@/types/models";
import { formatCurrency, formatNumber, formatDate } from "@/utils/format";
import { 
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { TrendArrow } from "@/components/ui/trend-arrow";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Analytics() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    salesData: [] as { date: string; amount: number }[],
    categoryData: [] as { name: string; value: number }[],
    topProducts: [] as IProduct[],
    recentOrders: [] as IOrder[]
  });

  useEffect(() => {
    loadAnalyticsData();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadAnalyticsData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAnalyticsData = async () => {
    try {
      // Get orders with pagination
      const ordersResponse = await mongoDBService.getOrders({ page: 1, limit: 100 });
      const orders = ordersResponse.orders || [];

      // Get products with pagination
      const productsResponse = await mongoDBService.getProducts({ page: 1, limit: 100 });
      const products = productsResponse.products || [];

      // Get users (will return empty array if not admin)
      const users = await mongoDBService.getUsers().catch(() => []);

      // Calculate total revenue
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

      // Prepare sales data for the last 30 days
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const salesData = last30Days.map(date => ({
        date: new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        amount: orders
          .filter(order => order.createdAt.toString().startsWith(date))
          .reduce((sum, order) => sum + order.totalAmount, 0)
      }));

      // Prepare category data
      const categoryData = products.reduce((acc, product) => {
        const existing = acc.find(item => item.name === product.category);
        if (existing) {
          existing.value += product.stock;
        } else {
          acc.push({ name: product.category, value: product.stock });
        }
        return acc;
      }, [] as { name: string; value: number }[]);

      // Get top 5 products by stock
      const topProducts = [...products]
        .sort((a, b) => b.stock - a.stock)
        .slice(0, 5);

      // Get recent orders
      const recentOrders = [...orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalUsers: users.length,
        salesData,
        categoryData,
        topProducts,
        recentOrders
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  };

  return (
    <div className="space-y-6">
        <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-gray-500">Real-time analytics and insights</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalRevenue > 0 ? <><TrendArrow value={20.1} /> from last month</> : 'No revenue yet'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalOrders)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalOrders > 0 ? <><TrendArrow value={10} /> from last month</> : 'No orders yet'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalProducts)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalProducts > 0 ? <><TrendArrow value={5} /> from last month</> : 'No products yet'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalUsers)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUsers > 0 ? <><TrendArrow value={15} /> from last month</> : 'No users yet'}
            </p>
            </CardContent>
          </Card>
      </div>

      {/* Check if there's data to display */}
      {stats.totalOrders === 0 && stats.totalProducts === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No analytics data available</h3>
          <p className="text-muted-foreground mb-4">
            Start by adding products and creating orders to see your analytics.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>
                  Daily sales for the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                {stats.salesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={stats.salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#8884d8"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">No sales data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>
                  Stock distribution by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={stats.categoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {stats.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatNumber(value as number)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">No category data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>
                  Products with highest stock
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {stats.topProducts.map((product) => (
                      <div key={product._id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(product.price)}</p>
                          <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">No products available</p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Latest customer orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentOrders.map((order) => (
                      <div key={order._id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Order #{order._id.slice(-6)}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                          <p className="text-sm text-muted-foreground">{order.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">No orders available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
