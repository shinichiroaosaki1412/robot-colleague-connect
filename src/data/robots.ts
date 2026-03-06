import unitreeG1 from "@/assets/robots/unitree_g1.png";
import bdSpot from "@/assets/robots/bd_spot.png";
import kewazoLiftbot from "@/assets/robots/kewazo_liftbot.png";
import hiltiJaibot from "@/assets/robots/hilti_jaibot.png";
import dustyFieldprinter from "@/assets/robots/dusty_fieldprinter.png";

export interface Robot {
  id: string;
  name: string;
  image: string;
  specialties: string[];
  hourlyRate: number;
  availableInDays: number;
  deploymentDuration: string;
  description: string;
}

export interface MatchedRobot extends Robot {
  matchScore: number;
  matchReason: string;
}

export const ROBOTS: Robot[] = [
  {
    id: "unitree_g1",
    name: "Unitree G1",
    image: unitreeG1,
    specialties: ["Material Transport", "Site Cleaning", "General Labor"],
    hourlyRate: 45,
    availableInDays: 3,
    deploymentDuration: "Up to 30 days",
    description: "Versatile humanoid robot ideal for repetitive physical tasks on active job sites.",
  },
  {
    id: "boston_dynamics_spot",
    name: "BD Spot",
    image: bdSpot,
    specialties: ["Site Inspection", "3D Scanning", "Progress Monitoring"],
    hourlyRate: 80,
    availableInDays: 1,
    deploymentDuration: "Up to 14 days",
    description: "Industry-leading inspection robot with autonomous navigation and sensor payloads.",
  },
  {
    id: "kewazo_liftbot",
    name: "Kewazo LIFTBOT",
    image: kewazoLiftbot,
    specialties: ["Scaffolding", "Material Lifting", "Vertical Transport"],
    hourlyRate: 35,
    availableInDays: 5,
    deploymentDuration: "Up to 60 days",
    description: "Specialized lifting robot designed for scaffolding and vertical material transport.",
  },
  {
    id: "hilti_jaibot",
    name: "Hilti Jaibot",
    image: hiltiJaibot,
    specialties: ["Ceiling Drilling", "MEP Installation", "Overhead Work"],
    hourlyRate: 60,
    availableInDays: 7,
    deploymentDuration: "Up to 21 days",
    description: "Semi-autonomous robot for ceiling installations, reducing overhead labor risk.",
  },
  {
    id: "dusty_robotics",
    name: "Dusty FieldPrinter",
    image: dustyFieldprinter,
    specialties: ["Layout Printing", "BIM-to-Field", "Floor Marking"],
    hourlyRate: 55,
    availableInDays: 2,
    deploymentDuration: "Up to 10 days",
    description: "Autonomous layout robot that prints BIM data directly on floors with high precision.",
  },
];
