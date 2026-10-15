'use client';

import { useState } from 'react';
import Link from 'next/link';

export function GenixMobileMenu() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        className={`genix-nav-toggle${open ? ' open' : ''}`}
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        <span /><span /><span />
      </button>

      <nav
        className={`genix-nav-mobile${open ? ' open' : ''}`}
        aria-label="Mobile navigation"
      >
        <Link href="/image-to-video" onClick={close}>Create</Link>
        <Link href="#showcase" onClick={close}>Short Films</Link>
        <Link href="/templates" onClick={close}>Gallery</Link>
        <Link href="#contact" onClick={close}>Contact</Link>
        <Link href="/image-to-video" className="genix-nav-mobile-cta" onClick={close}>Get Started</Link>
      </nav>
    </>
  );
}
