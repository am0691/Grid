import { AuthProvider } from '@/presentation/providers/AuthProvider';
import { AppRouter } from '@/presentation/routes';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster position="top-center" />
    </AuthProvider>
  );
}

export default App;
