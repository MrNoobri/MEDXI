export const tileEnterVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: "easeOut",
    },
  },
};

export const tileHover = {
  whileHover: { scale: 1.015, y: -2 },
  transition: { type: "spring", stiffness: 320, damping: 24 },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};
