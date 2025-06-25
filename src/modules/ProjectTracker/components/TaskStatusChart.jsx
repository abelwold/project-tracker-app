import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function TaskStatusChart({ tasks }) {
  const statusCounts = {
    todo: 0,
    "in progress": 0,
    done: 0,
  };

  tasks.forEach((task) => {
    if (statusCounts[task.status] !== undefined) {
      statusCounts[task.status]++;
    }
  });

  const data = {
    labels: ["Todo", "In Progress", "Done"],
    datasets: [
      {
        data: [
          statusCounts["todo"],
          statusCounts["in progress"],
          statusCounts["done"],
        ],
        backgroundColor: ["#facc15", "#3b82f6", "#10b981"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#fff",
        },
      },
    },
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4">📊 Task Status Overview</h3>
      <div className="relative h-64 sm:h-52 w-full">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
}
