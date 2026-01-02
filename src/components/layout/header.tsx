import { getSession } from '@/lib/auth';
import { SidebarTrigger } from '../ui/sidebar';
import { UserNav } from './user-nav';

export default async function Header() {
  const user = await getSession();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <SidebarTrigger />
      <div className="flex w-full items-center justify-end gap-4">
        {user && <UserNav user={user} />}
      </div>
    </header>
  );
}
