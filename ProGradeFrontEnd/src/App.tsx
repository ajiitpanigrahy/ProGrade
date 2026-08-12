import { RouterProvider } from 'react-router-dom';
import { router } from './routes/AppRoutes';

function App() {
    // 🌟 The Router now handles the Context Providers internally!
    return <RouterProvider router={router} />;
}

export default App;