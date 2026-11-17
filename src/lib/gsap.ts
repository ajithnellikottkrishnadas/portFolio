import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register once for the whole app. Importing this module from any component is safe.
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
