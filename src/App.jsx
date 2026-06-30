/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: App.jsx
 */
import { MathJaxContext } from 'better-react-mathjax';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './app/routes/AppRoutes';
import AppToast from './shared/components/AppToast';

const mathJaxConfig = {
  loader: { load: ['input/mml', 'output/chtml'] },
  options: {
    enableMenu: false,
    renderActions: {
      addMenu: [],
    },
  },
};

function App() {
  return (
    <MathJaxContext version={3} config={mathJaxConfig}>
      <AppToast />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </MathJaxContext>
  );
}

export default App;
