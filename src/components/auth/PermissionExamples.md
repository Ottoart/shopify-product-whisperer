// Example usage of the permission system in application components

/*
1. Protect Admin-Only Features:
```tsx
import { AdminGate } from '@/components/auth/PermissionGate';

const SomeComponent = () => (
  <AdminGate fallback={<div>Access denied</div>}>
    <AdminOnlyFeature />
  </AdminGate>
);
```

2. Check Specific Permissions:
```tsx
import { PermissionGate } from '@/components/auth/PermissionGate';

const BillingSection = () => (
  <PermissionGate 
    permission="billing_view" 
    resourceType="billing"
    fallback={<div>You don't have billing access</div>}
  >
    <BillingDashboard />
  </PermissionGate>
);
```

3. Conditional UI Based on Permissions:
```tsx
import { usePermission } from '@/hooks/usePermissions';

const ProductEditor = ({ productId }: { productId: string }) => {
  const { data: canEdit } = usePermission('write', 'inventory', productId);
  const { data: canDelete } = usePermission('delete', 'inventory', productId);
  
  return (
    <div>
      <ProductView productId={productId} />
      
      {canEdit && (
        <Button onClick={() => editProduct(productId)}>
          Edit Product
        </Button>
      )}
      
      {canDelete && (
        <Button variant="destructive" onClick={() => deleteProduct(productId)}>
          Delete Product
        </Button>
      )}
    </div>
  );
};
```

4. Multiple Permission Checks:
```tsx
import { usePermissions } from '@/hooks/usePermissions';

const Dashboard = () => {
  const { data: permissions } = usePermissions([
    { permission: 'analytics_view', resourceType: 'analytics' },
    { permission: 'inventory_manage', resourceType: 'inventory' },
    { permission: 'orders_manage', resourceType: 'orders' }
  ]);

  return (
    <div>
      {permissions?.['analytics_view:analytics'] && <AnalyticsWidget />}
      {permissions?.['inventory_manage:inventory'] && <InventoryPanel />}
      {permissions?.['orders_manage:orders'] && <OrdersPanel />}
    </div>
  );
};
```

5. Role-Based Component Rendering:
```tsx
import { useUserRole } from '@/hooks/usePermissions';

const Navbar = () => {
  const { data: userRole } = useUserRole();
  
  return (
    <nav>
      <NavLink to="/dashboard">Dashboard</NavLink>
      
      {userRole?.role !== 'user' && (
        <NavLink to="/admin">Admin Panel</NavLink>
      )}
      
      {userRole?.role === 'master_admin' && (
        <NavLink to="/system-settings">System Settings</NavLink>
      )}
    </nav>
  );
};
```

6. Higher-Order Component Usage:
```tsx
import { withPermission, withAdminAccess } from '@/components/auth/PermissionGate';

// Wrap component with permission check
const AdminSettings = withAdminAccess(() => (
  <div>Admin Settings Content</div>
));

// Wrap component with specific permission
const BillingManagement = withPermission(
  ({ children }) => <div>{children}</div>,
  'billing_manage',
  'billing'
);
```

7. Resource-Specific Permissions:
```tsx
const OrderDetails = ({ orderId }: { orderId: string }) => {
  const { data: canViewOrder } = usePermission('read', 'orders', orderId);
  const { data: canEditOrder } = usePermission('write', 'orders', orderId);
  
  if (!canViewOrder) {
    return <div>You don't have permission to view this order</div>;
  }
  
  return (
    <div>
      <OrderInfo orderId={orderId} />
      
      <PermissionGate 
        permission="write" 
        resourceType="orders" 
        resourceId={orderId}
      >
        <OrderEditForm orderId={orderId} />
      </PermissionGate>
    </div>
  );
};
```

PERMISSION MATRIX:

Role Hierarchy:
- master_admin: Full system access
- admin: Most features except user management  
- manager: Operational features only
- user: Basic read/write access

Permission Types:
- read: View data
- write: Create/update data
- delete: Remove data
- admin: System administration
- billing_view: View billing info
- billing_manage: Manage billing
- user_manage: Manage users
- company_manage: Manage companies
- system_logs: View system logs
- analytics_view: View analytics
- inventory_manage: Manage inventory
- orders_manage: Manage orders
- shipping_manage: Manage shipping
- repricing_manage: Manage repricing

Resource Types:
- system: System-wide permissions
- users: User management
- companies: Company management
- billing: Billing and subscriptions
- logs: System logs
- analytics: Analytics data
- inventory: Inventory management
- orders: Order management
- shipping: Shipping operations
- repricing: Price management
- all: All resources (for broad permissions)

*/