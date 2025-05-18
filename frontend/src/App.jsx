// designs
import 'font-awesome/css/font-awesome.min.css';
import './index.css'
import { BrowserRouter } from 'react-router-dom';
import MainRoutes, { MainRoutes2 } from './routes/MainRoutes';


function App() {
  return (
    <BrowserRouter>
      {/* <MainRoutes/> */}
      <MainRoutes2 />
    </BrowserRouter>
  )
}

export default App