import AdminNavbar from '../components/admin/AdminNavbar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <AdminNavbar />
      <main className="animate-fadeIn">
        {children}
      </main>
    </div>
  );
}