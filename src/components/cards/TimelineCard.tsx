// import { ReactNode } from "react";

// interface TimelineCardProps {
//     icon: ReactNode;
//     title: string;
//     description: ReactNode;
//     status: "completed" | "current" | "pending";
//     isLast?: boolean;
//   }

// export function TimelineCard({ icon, title, description, status, isLast = false }) {
//     const getIconContainerClass = () => {
//       if (status === "completed") return "bg-white border-2 border-blue-500";
//       if (status === "current") return "bg-blue-500 text-white";
//       return "bg-white border-2 border-gray-200";
//     };

//     return (
//       <div className="flex items-start">
//         {/* Icon & Timeline Line */}
//         <div className="flex flex-col items-center mr-4">
//           <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getIconContainerClass()}`}>
//             {icon}
//           </div>
//           {!isLast && <div className="h-full w-0.5 bg-gray-200 my-2"></div>}
//         </div>

//         {/* Content */}
//         <div className="pb-8">
//           <h3 className="text-lg font-semibold text-blue-500 mb-1">{title}</h3>
//           <div className="text-gray-600">{description}</div>
//         </div>
//       </div>
//     );
//   }
