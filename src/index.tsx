import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
import './index.css';
import App from './App';
import 'react-toastify/dist/ReactToastify.css';
import { Toaster } from 'react-hot-toast';
import ReactGA from 'react-ga4';
const TRACKING_ID = "G-";
ReactGA.initialize(TRACKING_ID);

const isMobile = window.screen.width <= 768

const toastOptions = {
  style: {
    marginTop: isMobile ? '20vw' : '10vw',
  }
}

ReactDOM.render(
  <BrowserRouter>
    <Toaster toastOptions={toastOptions} />
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);