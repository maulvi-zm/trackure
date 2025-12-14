import type React from "react";
import { TimelineStep } from "./TimelineStep";

export interface StepData {
	icon: React.ReactNode;
	title: string;
	status: "completed" | "current" | "waiting";
}

interface TimelineProps {
	steps: StepData[];
}

export const Timeline: React.FC<TimelineProps> = ({ steps }) => {
	return (
		<div className="flex flex-wrap justify-between items-start">
			{steps.map((step, index) => (
				<TimelineStep
					key={index}
					icon={step.icon}
					title={step.title}
					status={step.status}
					isFirst={index === 0}
					isLast={index === steps.length - 1}
				/>
			))}
		</div>
	);
};
