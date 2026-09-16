'use client';

import { motion } from 'framer-motion';

export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(4px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex-1"
    >
      {children}
    </motion.div>
  );
}
