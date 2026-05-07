import React from 'react';
import { createRoot } from 'react-dom/client';
import '../../js/Backend/public/style.css';
import AppRoot from './AppRoot.jsx';

const root = document.getElementById('root');
createRoot(root).render(<AppRoot />);
