import { useRoutes } from 'react-router-dom';
import { routes } from './routes';

function App() {
  // This hook takes the route array and transforms it into the JSX tree
  const content = useRoutes(routes);

  return (
    <div className="app-container">
      {content}
    </div>
  );
}

export default App;