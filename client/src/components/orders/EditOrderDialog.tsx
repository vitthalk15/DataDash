import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IOrder, IProduct } from "@/types/models";
import { mongoDBService } from "@/services/mongodb";
import { useToast } from "@/hooks/use-toast";

interface EditOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: IOrder;
  onSubmit: (orderData: Partial<IOrder>) => Promise<void>;
}

export default function EditOrderDialog({ open, onOpenChange, order, onSubmit }: EditOrderDialogProps) {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Array<{
    product: string;
    quantity: number;
    price: number;
  }>>(order.products.map(p => ({
    product: typeof p.product === 'string' ? p.product : p.product._id,
    quantity: p.quantity,
    price: p.price
  })));
  const [status, setStatus] = useState<IOrder['status']>(order.status);
  const [paymentStatus, setPaymentStatus] = useState<IOrder['paymentStatus']>(order.paymentStatus);
  const [paymentMethod, setPaymentMethod] = useState<string>(order.paymentMethod);
  const [shippingAddress, setShippingAddress] = useState<IOrder['shippingAddress']>(order.shippingAddress);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await mongoDBService.getProducts({
        page: 1,
        limit: 100,
        sortBy: 'name',
        sortOrder: 'asc'
      });
      setProducts(response.products);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddProduct = () => {
    setSelectedProducts([...selectedProducts, { product: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, productId: string) => {
    const newProducts = [...selectedProducts];
    const selectedProduct = products.find(p => p._id === productId);
    newProducts[index] = {
      product: productId,
      quantity: newProducts[index].quantity,
      price: selectedProduct?.price || 0
    };
    setSelectedProducts(newProducts);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newProducts = [...selectedProducts];
    newProducts[index].quantity = quantity;
    setSelectedProducts(newProducts);
  };

  const handleAddressChange = (field: keyof IOrder['shippingAddress'], value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProducts.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one product to the order.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const orderData: Partial<IOrder> = {
        products: selectedProducts,
        status,
        paymentStatus,
        paymentMethod,
        shippingAddress,
        totalAmount: calculateTotal()
      };
      await onSubmit(orderData);
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Order</DialogTitle>
          <DialogDescription>
            Update the order details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {selectedProducts.map((item, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label>Product</Label>
                  <Select
                    value={item.product}
                    onValueChange={(value) => handleProductChange(index, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product._id} value={product._id}>
                          {product.name} - ${product.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveProduct(index)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" onClick={handleAddProduct}>
            Add Product
          </Button>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(value: IOrder['status']) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Payment Status</Label>
              <Select value={paymentStatus} onValueChange={(value: IOrder['paymentStatus']) => setPaymentStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="debit_card">Debit Card</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Shipping Address</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Street</Label>
                <Input
                  value={shippingAddress.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={shippingAddress.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                />
              </div>
              <div>
                <Label>State</Label>
                <Input
                  value={shippingAddress.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                />
              </div>
              <div>
                <Label>Country</Label>
                <Input
                  value={shippingAddress.country}
                  onChange={(e) => handleAddressChange('country', e.target.value)}
                />
              </div>
              <div>
                <Label>ZIP Code</Label>
                <Input
                  value={shippingAddress.zipCode}
                  onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">${calculateTotal()}</p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Order"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 