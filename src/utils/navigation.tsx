import { useRouter } from 'next/navigation';

interface ElectronRouter {
  navigate: (path: string) => void;
}

export const useElectronRouter = (): ElectronRouter => {
  const router = useRouter();

  const navigate = (path: string) => {
    console.log('Navigating to:', path);
    if (typeof window !== 'undefined' && window.electronAPI) {
      console.log('Using Electron navigation');
      window.electronAPI.loadPage(path);
    } else {
      console.log('Using Next.js navigation');
      router.push(path);
    }
  };

  return {
    navigate,
  };
};
