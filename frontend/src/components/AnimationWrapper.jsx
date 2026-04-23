import { motion } from "framer-motion";
import PropTypes from "prop-types";

// Page variant animation
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

// Card variant animation
const cardVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay,
      ease: "easeInOut",
    },
  }),
};

// Container animation with staggered children
const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const AnimatedPage = ({ children, ...props }) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageVariants}
    {...props}
  >
    {children}
  </motion.div>
);

export const AnimatedBox = ({ children, delay = 0, ...props }) => (
  <motion.div
    initial="initial"
    animate="animate"
    custom={delay}
    variants={cardVariants}
    {...props}
  >
    {children}
  </motion.div>
);

export const AnimatedContainer = ({ children, ...props }) => (
  <motion.div
    initial="initial"
    animate="animate"
    variants={containerVariants}
    {...props}
  >
    {children}
  </motion.div>
);

AnimatedPage.propTypes = {
  children: PropTypes.node.isRequired,
};

AnimatedBox.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
};

AnimatedContainer.propTypes = {
  children: PropTypes.node.isRequired,
};
