// Single source of truth for all portfolio content.
// Edit this file to update copy, links and experience without touching components.

export const profile = {
  name: 'Ajith Nellikott Krishnadas',
  shortName: 'Ajith Nellikott',
  title: 'Cloud Infrastructure Engineer | AWS | Linux | DevOps | Kubernetes',
  intro:
    'Building, managing, and optimizing cloud infrastructure while exploring the intersection of automation, DevOps, and modern software engineering.',
  detail:
    'Passionate about cloud technologies, Linux systems, networking, infrastructure automation, containerization, and scalable application architecture.',
  location: 'Based in Kerala, India',
  availability: 'Open to Opportunities',
  email: 'ajithnellikottu@gmail.com',
  phone: '+91-85939-10902',
  // Fill these in. Empty values render as clearly marked "add link" states, never as dead buttons.
  linkedin: 'https://www.linkedin.com/in/ajith-nellikott-0b79b7195/',
  github: 'https://github.com/ajithnellikottkrishnadas',
  resumePath: '/resume.pdf',
  siteUrl: 'https://example.com', // TODO: set to the real production URL (used for SEO / Open Graph)
} as const;

export const navItems = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'ecosystem', label: 'Architecture' },
  { id: 'education', label: 'Education' },
  { id: 'goals', label: 'Goals' },
  { id: 'contact', label: 'Contact' },
] as const;

export type SectionId = (typeof navItems)[number]['id'];

export const aboutParagraphs = [
  'I am an engineering graduate and Cloud Infrastructure Engineer with professional experience supporting and maintaining AWS cloud environments.',
  'I have worked on production and non-production infrastructure, handling server maintenance, patching, monitoring, storage administration, troubleshooting, and operational activities.',
  'I also have MERN stack development experience from an internship.',
  'My technical interests extend beyond cloud infrastructure into Linux administration, computer networking, DevOps practices, containerization, Kubernetes, and full-stack development.',
  'I enjoy understanding how systems work behind the scenes, solving infrastructure challenges, automating repetitive operations, and building scalable applications.',
  'My goal is to continuously develop my expertise in cloud engineering, infrastructure automation, and modern DevOps technologies.',
];

export const aboutCards = [
  {
    key: 'cloud',
    title: 'Cloud Infrastructure',
    text: 'Production and non-production AWS infrastructure: server maintenance, patching, monitoring, storage administration and troubleshooting.',
  },
  {
    key: 'linux',
    title: 'Linux & Networking',
    text: 'Linux administration, file systems, processes, permissions and TCP/IP fundamentals.',
  },
  {
    key: 'devops',
    title: 'DevOps & Automation',
    text: 'Scripting with PowerShell and CLI tooling, patch workflows, and infrastructure as code.',
  },
  {
    key: 'fullstack',
    title: 'Full-Stack Development',
    text: 'React, Node.js, Express and MongoDB applications with REST APIs and JWT auth.',
  },
] as const;

/**
 * Skill status meaning:
 *  - professional: used in my professional work (UST, Aptia Group project)
 *  - built:        used in internship work or personal projects
 *  - learning:     currently learning; not claimed as professional experience
 */
export type SkillStatus = 'professional' | 'built' | 'learning';

export interface SkillItem {
  name: string;
  status: SkillStatus;
}

export interface SkillCategory {
  id: 'aws' | 'linux' | 'devops' | 'windows' | 'programming';
  label: string;
  accent: string; // CSS color used for the card glow/border
  skills: SkillItem[];
}

export const skillCategories: SkillCategory[] = [
  {
    id: 'aws',
    label: 'AWS Cloud',
    accent: '#38bdf8',
    skills: [
      { name: 'EC2', status: 'professional' },
      { name: 'ECS', status: 'professional' },
      { name: 'S3', status: 'professional' },
      { name: 'EBS', status: 'professional' },
      { name: 'Amazon FSx', status: 'professional' },
      { name: 'CloudWatch', status: 'professional' },
      { name: 'Server Patching', status: 'professional' },
      { name: 'Containerization', status: 'learning' },
      { name: 'VPC', status: 'professional' },
      { name: 'Subnets', status: 'professional' },
      { name: 'Security Groups', status: 'professional' },
      { name: 'IAM', status: 'professional' },
      { name: 'AWS CLI', status: 'professional' },
      { name: 'Systems Manager', status: 'professional' },
    ],
  },
  {
    id: 'linux',
    label: 'Linux & Networking',
    accent: '#22d3ee',
    skills: [
      { name: 'Linux Administration', status: 'professional' },
      { name: 'Linux File System', status: 'professional' },
      { name: 'Linux Commands', status: 'professional' },
      { name: 'Shell Fundamentals', status: 'built' },
      { name: 'Process Management', status: 'built' },
      { name: 'User & Permission Management', status: 'professional' },
      { name: 'TCP/IP', status: 'built' },
      { name: 'DNS', status: 'built' },
      { name: 'HTTP/HTTPS', status: 'built' },
      { name: 'Ports and Protocols', status: 'built' },
      { name: 'Subnetting', status: 'built' },
      { name: 'Routing', status: 'built' },
      { name: 'Firewalls', status: 'built' },
      { name: 'Network ACLs', status: 'built' },
    ],
  },
  {
    id: 'devops',
    label: 'DevOps & Containers',
    accent: '#a78bfa',
    skills: [
      { name: 'Docker', status: 'learning' },
      { name: 'Kubernetes', status: 'learning' },
      { name: 'Terraform', status: 'learning' },
      { name: 'CI/CD Fundamentals', status: 'learning' },
      { name: 'Infrastructure as Code', status: 'professional' },
      { name: 'Infrastructure Monitoring', status: 'professional' },
      { name: 'PowerShell', status: 'professional' },
      { name: 'Automation', status: 'professional' },
    ],
  },
  {
    id: 'windows',
    label: 'Windows & Infrastructure',
    accent: '#60a5fa',
    skills: [
      { name: 'Windows Server Administration', status: 'professional' },
      { name: 'DFS', status: 'professional' },
      { name: 'DFS Namespaces', status: 'professional' },
      { name: 'Amazon FSx', status: 'professional' },
      { name: 'Server Maintenance', status: 'professional' },
      { name: 'Backup Validation', status: 'professional' },
      { name: 'Infrastructure Troubleshooting', status: 'professional' },
    ],
  },
  {
    id: 'programming',
    label: 'Programming & Development',
    accent: '#c084fc',
    skills: [
      { name: 'JavaScript', status: 'professional' },
      { name: 'React.js', status: 'professional' },
      { name: 'Node.js', status: 'professional' },
      { name: 'Express.js', status: 'professional' },
      { name: 'MongoDB', status: 'professional' },
      { name: 'HTML5', status: 'professional' },
      { name: 'CSS3', status: 'professional' },
      { name: 'Bootstrap', status: 'professional' },
      { name: 'jQuery', status: 'professional' },
      { name: 'REST APIs', status: 'professional' },
      { name: 'Git', status: 'professional' },
      { name: 'GitHub', status: 'professional' },
      { name: 'Postman', status: 'professional' },
      { name: 'Three.js', status: 'built' },
      { name: 'React Three Fiber', status: 'built' },
    ],
  },
];

export const statusLabels: Record<SkillStatus, string> = {
  professional: 'Professional experience',
  built: 'Built in projects / internship',
  learning: 'Currently learning',
};

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  period: string;
  project?: string;
  location?: string;
  tech: string[];
  responsibilities: string[];
}

export const experience: ExperienceItem[] = [
  {
    id: 'ust',
    company: 'UST',
    role: 'Cloud Engineer',
    period: 'February 2026 – Present',
    project: 'Aptia Group',
    tech: [
      'AWS',
      'EC2',
      'ECS',
      'EBS',
      'S3',
      'Amazon FSx',
      'CloudWatch',
      'DFS',
      'PowerShell',
      'AWS CLI',
      'VPC',
      'Subnets',
      'Security Groups',
      'Systems Manager',
      'Linux User & Permission Management',
      'Infrastructure as Code',
    ],
    responsibilities: [
      'Managed and maintained AWS resources including EC2, ECS, EBS, S3, Amazon FSx, and CloudWatch.',
      'Supported server patching activities through scheduled maintenance windows.',
      'Performed backup validation, infrastructure maintenance, and server decommissioning activities.',
      'Administered DFS, DFS Namespaces, and Amazon FSx file systems.',
      'Monitored cloud infrastructure and supported performance and reliability improvements.',
      'Troubleshot infrastructure incidents and supported root cause analysis.',
      'Used AWS CLI and PowerShell to execute operational activities and streamline repetitive tasks.',
      'Collaborated with application, database, networking, and security teams.',
      'Supported infrastructure inventory management and resource tracking.',
    ],
  },
  {
    id: 'goodfoot',
    company: 'GoodFoot',
    role: 'MERN Stack Developer Intern',
    period: 'August 2025 – November 2025',
    tech: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'Bootstrap', 'Git', 'Postman'],
    responsibilities: [
      'Developed responsive web applications using React.js, HTML, CSS, Bootstrap, and JavaScript.',
      'Built backend functionality using Node.js and Express.js.',
      'Developed and integrated RESTful APIs.',
      'Worked with MongoDB for database management.',
      'Integrated frontend and backend services.',
      'Used Git, GitHub, and Postman for development and testing.',
      'Performed application debugging and troubleshooting.',
    ],
  },
];

export interface ProjectItem {
  id: string;
  title: string;
  kind: 'Full-stack' | 'Infrastructure';
  summary: string;
  tech: string[];
  features: string[];
  github: string; // empty = "add link" state
  liveDemo: string; // empty = "add link" state
  screenshot: string | null; // null = placeholder shown
  accent: string;
}

export const projects: ProjectItem[] = [
  {
    id: 'task-platform',
    title: 'Task Assignment Management Platform',
    kind: 'Full-stack',
    summary:
      'A full-stack task management platform designed to manage task assignments and user responsibilities through a centralized interface.',
    tech: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'JWT', 'Axios'],
    features: [
      'JWT-based authentication.',
      'Role-based access control.',
      'RESTful API architecture.',
      'React frontend with Axios integration.',
      'MongoDB database using Mongoose.',
      'Dynamic task management.',
    ],
    github: '',
    liveDemo: '',
    screenshot: null,
    accent: '#38bdf8',
  },
  {
    id: 'employee-customer-dashboard',
    title: 'Employee & Customer Management Dashboard',
    kind: 'Full-stack',
    summary:
      'A responsive management dashboard providing CRUD functionality for managing employee and customer records.',
    tech: ['MERN Stack', 'JWT', 'MVC', 'React Router', 'MongoDB'],
    features: [
      'Create, Read, Update, Delete operations.',
      'JWT authentication.',
      'MVC architecture.',
      'React Router navigation.',
      'Axios API integration.',
      'Toast notifications.',
    ],
    github: '',
    liveDemo: '',
    screenshot: null,
    accent: '#a78bfa',
  },
  {
    id: 'cloud-ops',
    title: 'Cloud Infrastructure Operations',
    kind: 'Infrastructure',
    summary:
      'Professional infrastructure operations experience supporting AWS cloud environments. Described at a high level; no internal architecture or metrics are published here.',
    tech: ['AWS', 'EC2', 'S3', 'EBS', 'FSx', 'CloudWatch', 'AWS CLI', 'PowerShell'],
    features: [
      'Infrastructure monitoring.',
      'Server maintenance.',
      'Scheduled patch management.',
      'Storage administration.',
      'Infrastructure troubleshooting.',
      'Operational automation.',
    ],
    github: '',
    liveDemo: '',
    screenshot: null,
    accent: '#22d3ee',
  },
];

export const ecosystemIntro =
  'This portfolio is a React app built with Vite and served from an nginx container on AWS. Visitors reach it through Route 53 and an Application Load Balancer that handles HTTPS. The container runs on ECS Fargate, so there are no servers to manage. Each code change is built into a new container image, stored in ECR, and deployed automatically. The 3D scenes load only on capable desktops. Phones and reduced-motion visitors see a lighter version of the same content.';

export interface EcosystemStep {
  id: string;
  label: string;
  tech: string;
  /** Label on the arrow that enters this step (protocol or port), or null. */
  arrow: string | null;
}

/** Visitor traffic only, top to bottom. The ECS task sits inside the VPC private subnets. */
export const ecosystemRequestPath: EcosystemStep[] = [
  { id: 'visitor', label: 'Visitor', tech: 'Opens the site over HTTPS; the React app loads in the browser', arrow: null },
  { id: 'dns', label: 'Route 53', tech: 'Resolves the domain name to the load balancer', arrow: 'DNS 53' },
  { id: 'alb', label: 'Application Load Balancer', tech: 'Terminates HTTPS with an ACM certificate, forwards on port 8080', arrow: 'HTTPS 443' },
  { id: 'subnets', label: 'VPC private subnets', tech: 'Two Availability Zones; the container is not exposed directly', arrow: 'HTTP 8080' },
  { id: 'ecs', label: 'ECS Fargate task', tech: 'nginx serves the static Vite build: HTML, JS and images', arrow: null },
];

export const ecosystemReleaseTitle = 'How updates ship — not on the visitor path';

/** Release path, shown in its own row. */
export const ecosystemReleasePath: EcosystemStep[] = [
  { id: 'gha', label: 'GitHub Actions', tech: 'Builds the site and its Docker image on every push to main', arrow: null },
  { id: 'ecr', label: 'Amazon ECR', tech: 'Stores each versioned image', arrow: 'docker push' },
  { id: 'deploy', label: 'ECS Fargate', tech: 'Pulls the new image and replaces the running task', arrow: 'image pull' },
];

export const ecosystemMonitor = { id: 'monitor', label: 'CloudWatch', tech: 'Collects container logs and ALB health-check results' };

export const ecosystemTech = [
  'Route 53',
  'ALB',
  'ACM',
  'VPC',
  'ECS Fargate',
  'nginx',
  'Docker',
  'ECR',
  'GitHub Actions',
  'CloudWatch',
  'IAM (OIDC)',
  'Vite',
  'React',
  'TypeScript',
] as const;

export const education = {
  degree: 'B.Tech in Civil Engineering',
  institution: 'Government Engineering College, Kozhikode',
  university: 'APJ Abdul Kalam Technological University',
  period: '2018 – 2023',
  grade: 'CGPA: 6.71',
};

export const completedCourses = [
  {
    title: 'Full-Stack Web Development Bootcamp',
    provider: 'Dr. Angela Yu — Udemy',
    status: 'Completed',
    date: 'July 2025',
  },
];

// Only placeholders. Add a certification here only after it has been earned.
export const futureCertifications = [
  { title: 'Certification slot 01', target: 'Planned: AWS certification (to be chosen)' },
  { title: 'Certification slot 02', target: 'Planned: Kubernetes / CKA (to be chosen)' },
];

export const learningRoadmap = [
  { id: 'linux', label: 'Advanced Linux Administration', short: 'Linux', stage: 'Active' },
  { id: 'docker', label: 'Docker and Containerization', short: 'Docker', stage: 'Active' },
  { id: 'k8s', label: 'Kubernetes and Container Orchestration', short: 'Kubernetes', stage: 'Active' },
  { id: 'tf', label: 'Terraform and Infrastructure as Code', short: 'Terraform', stage: 'Active' },
  { id: 'sysdesign', label: 'System Design', short: 'System Design', stage: 'Active' },
  { id: 'cicd', label: 'CI/CD Automation', short: 'CI/CD', stage: 'Planned' },
  { id: 'aws-arch', label: 'AWS Architecture', short: 'AWS Arch', stage: 'Active' },
  { id: 'microservices', label: 'Microservices Deployment', short: 'Microservices', stage: 'Planned' },
] as const;
