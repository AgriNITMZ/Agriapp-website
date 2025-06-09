
import { Route, Routes} from 'react-router-dom';
import './App.css';
import Footer from './Component/Common/Footer';

import SellerRoutes from './Routes/SellerRoutes';
import AdminRoutes from './Routes/AdminRoutes';
import CustomerRoutes from './Routes/CustomerRoutes';

function App() {
  
  return (
    <div className='bg-[#cefad0]'>
   

      <Routes>
      <Route path="/*" element={<CustomerRoutes/>} />
      <Route path="seller/*" element={<SellerRoutes/>} />
      <Route path="admin/*" element={<AdminRoutes/>} />
      </Routes>
     



      {/* footer */}
      {/* <Footer/> */}
    </div>
  
  );
}

export default App;
