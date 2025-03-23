
import { Project, ProjectPackage, ProjectPriority, ProjectStatus } from "@/types/project";
import { v4 as uuidv4 } from "uuid";

export const projectPackages: ProjectPackage[] = [
  "Web Design",
  "Web Development",
  "Video Production",
  "Video Editing",
  "Video Post-Production",
  "Sound Post-Production",
  "Graphic Design",
  "Brand Identity",
  "Brand Strategy", 
  "Copywriting"
];

export const projectStatuses: ProjectStatus[] = ["Onboarding", "Active", "Completed"];
export const projectPriorities: ProjectPriority[] = ["Low", "Medium", "High"];

// Mock data for projects
export const projects: Project[] = [
  {
    id: uuidv4(),
    name: "Fusion Creative Website Redesign",
    clientName: "Fusion Creative",
    status: "Active",
    priority: "High",
    startDate: new Date(2023, 6, 15),
    dueDate: new Date(2023, 9, 30),
    packages: ["Web Design", "Web Development"],
    slug: "fusion-creative",
    password: "fusion2023",
    stages: [
      {
        id: uuidv4(),
        name: "Discovery & Research",
        tasks: [
          { id: uuidv4(), name: "Kickoff Meeting", completed: true },
          { id: uuidv4(), name: "Website Audit", completed: true },
          { id: uuidv4(), name: "Competitor Analysis", completed: false }
        ]
      },
      {
        id: uuidv4(),
        name: "Design",
        tasks: [
          { id: uuidv4(), name: "Wireframes", completed: false },
          { id: uuidv4(), name: "Visual Design", completed: false }
        ]
      }
    ],
    createdAt: new Date(2023, 6, 10)
  },
  {
    id: uuidv4(),
    name: "Evergreen Branding Project",
    clientName: "Evergreen Solutions",
    status: "Onboarding",
    priority: "Medium",
    startDate: new Date(2023, 7, 1),
    dueDate: new Date(2023, 10, 15),
    packages: ["Brand Identity", "Brand Strategy", "Graphic Design"],
    slug: "evergreen-branding",
    password: "evergreen2023",
    stages: [
      {
        id: uuidv4(),
        name: "Brand Discovery",
        tasks: [
          { id: uuidv4(), name: "Brand Questionnaire", completed: false },
          { id: uuidv4(), name: "Stakeholder Interviews", completed: false }
        ]
      }
    ],
    createdAt: new Date(2023, 6, 25)
  },
  {
    id: uuidv4(),
    name: "Horizon Media Video Campaign",
    clientName: "Horizon Media",
    status: "Completed",
    priority: "Low",
    startDate: new Date(2023, 5, 1),
    dueDate: new Date(2023, 6, 30),
    packages: ["Video Production", "Video Editing", "Video Post-Production"],
    slug: "horizon-video",
    stages: [
      {
        id: uuidv4(),
        name: "Pre-Production",
        tasks: [
          { id: uuidv4(), name: "Script Development", completed: true },
          { id: uuidv4(), name: "Storyboarding", completed: true },
          { id: uuidv4(), name: "Location Scouting", completed: true }
        ]
      },
      {
        id: uuidv4(),
        name: "Production",
        tasks: [
          { id: uuidv4(), name: "Filming", completed: true }
        ]
      },
      {
        id: uuidv4(),
        name: "Post-Production",
        tasks: [
          { id: uuidv4(), name: "Editing", completed: true },
          { id: uuidv4(), name: "Color Grading", completed: true },
          { id: uuidv4(), name: "Sound Design", completed: true }
        ]
      }
    ],
    createdAt: new Date(2023, 4, 25)
  }
];
