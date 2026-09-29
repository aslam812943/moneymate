import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App';
import { Provider } from './lib';
import { ConfirmProvider } from './components/ConfirmProvider';
import './styles.css';
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><Provider><ConfirmProvider><App/><Toaster position="bottom-right" richColors closeButton/></ConfirmProvider></Provider></BrowserRouter></React.StrictMode>);
