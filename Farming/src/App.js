import { Route, Routes } from 'react-router-dom';
import './App.css';
import SellerRoutes from './Routes/SellerRoutes';
import AdminRoutes from './Routes/AdminRoutes';
import CustomerRoutes from './Routes/CustomerRoutes';

function App() {
  return (
    <div className='bg-gradient-to-br from-mizoram-50 to-earth-50 min-h-screen'>
      <Routes>
        <Route path="/*" element={<CustomerRoutes />} />
        <Route path="seller/*" element={<SellerRoutes />} />
        <Route path="admin/*" element={<AdminRoutes />} />
      </Routes>
    </div>
  );
}

export default App;
