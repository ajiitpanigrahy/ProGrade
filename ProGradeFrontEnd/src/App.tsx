import { AuthProvider } from './context/AuthContext';
import { GlobalLoaderProvider } from './context/GlobalLoaderContext'; // Add this import
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/AppRoutes';

function App() {
    return (
        <AuthProvider>
            <GlobalLoaderProvider>  {/* Add this wrapper! */}
                <RouterProvider router={router} />
            </GlobalLoaderProvider>
        </AuthProvider>
    );
}

export default App;