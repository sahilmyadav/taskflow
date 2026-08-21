export const spring = { type: "spring", stiffness: 300, damping: 30 } as const;
export const softSpring = { type: "spring", stiffness: 200, damping: 25 } as const;

export const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

export const cardHover = {
  rest: { y: 0, scale: 1 },
  hover: { y: -2, scale: 1.01, transition: { duration: 0.2 } },
};
