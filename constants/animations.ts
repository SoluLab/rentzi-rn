export const animations = {
  // Timing configurations
  timing: {
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
    slowest: 750,
  },
  
  // Easing curves
  easing: {
    linear: "linear",
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
    luxury: "cubic-bezier(0.4, 0, 0.2, 1)", // Material Design
    smooth: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
  
  // Scale animations for luxury feel
  scale: {
    subtle: 1.02,
    gentle: 1.05,
    moderate: 1.1,
    prominent: 1.15,
    dramatic: 1.2,
  },
  
  // Rotation values
  rotation: {
    slight: 2,
    gentle: 5,
    moderate: 15,
    strong: 30,
    full: 360,
  },
  
  // Opacity transitions
  fade: {
    in: { from: 0, to: 1 },
    out: { from: 1, to: 0 },
    subtle: { from: 0.8, to: 1 },
  },
  
  // Slide animations
  slide: {
    distance: {
      small: 10,
      medium: 20,
      large: 50,
      xlarge: 100,
    },
  },
};