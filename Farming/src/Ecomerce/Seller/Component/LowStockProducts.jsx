import { Package, AlertCircle, Eye, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const LowStockProducts = () => {
  const navigate = useNavigate();
  const { sellerProducts } = useSelector((state) => state.sellerproduct);

  const lowStockItems = (sellerProducts || []).filter(p => (p.stock || 0) <= 8);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-lg p-6 text-white">
        <div className="flex items-center">
          <AlertCircle className="w-10 h-10 mr-4" />
          <div>
            <h1 className="text-3xl font-bold mb-2">Low Stock Items</h1>
            <p className="text-red-100">Products with stock at or below 8 units - Restock immediately!</p>
            <p className="text-xs text-red-50 mt-1">💡 Tip: Keep stock above 8 units to avoid low stock alerts</p>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-gray-500 text-sm font-medium">Total Low Stock Items</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{lowStockItems.length}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm font-medium">Out of Stock</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {lowStockItems.filter(p => (p.stock || 0) === 0).length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm font-medium">Critical (1-3 units)</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {lowStockItems.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 3).length}
            </p>
          </div>
        </div>
      </div>

      {/* Low Stock Products Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">All Low Stock Products</h2>
          <span className="text-sm text-gray-500">{lowStockItems.length} items</span>
        </div>

        {lowStockItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lowStockItems.map((product) => {
                  const displayPrice = product.price || 0;
                  const totalStock = product.stock || 0;

                  return (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={product.images?.[0] || '/placeholder.png'}
                            alt={product.name}
                            className="h-12 w-12 rounded-md object-cover"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {displayPrice > 0 ? (
                          <span>₹{displayPrice.toFixed(2)}</span>
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-sm font-bold rounded-full ${
                          totalStock === 0 ? 'bg-red-100 text-red-800' :
                          totalStock <= 3 ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {totalStock} units
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          totalStock === 0 ? 'bg-red-600 text-white' :
                          totalStock <= 3 ? 'bg-orange-600 text-white' : 'bg-yellow-600 text-white'
                        }`}>
                          {totalStock === 0 ? 'OUT OF STOCK' : totalStock <= 3 ? 'CRITICAL' : 'LOW STOCK'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => navigate(`/product/item/${product._id}`)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="View Product"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => navigate(`/seller/edit-product/${product._id}`)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit & Restock"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2 font-medium">All products are well stocked!</p>
            <p className="text-sm text-gray-400">No items with stock at or below 8 units</p>
            <p className="text-xs text-gray-400 mt-2">💡 Keep maintaining stock above 8 units</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LowStockProducts;
