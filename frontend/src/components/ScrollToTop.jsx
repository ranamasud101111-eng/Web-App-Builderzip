import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const prevPath = useRef(pathname);

  useEffect(() => {
    const prev = prevPath.current;
    prevPath.current = pathname;
    const isSubNav = prev.startsWith('/admin') && pathname.startsWith('/admin');
    const isSameSection = (
      (prev.startsWith('/chapter/') && pathname.startsWith('/chapter/')) ||
      (prev.startsWith('/subject/') && pathname.startsWith('/subject/'))
    );
    if (!isSubNav && !isSameSection) {
      const el = document.getElementById('main-scroll');
      if (el) el.scrollTop = 0;
      else window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
