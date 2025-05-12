
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Graphs.module.css';


export function Stats() {
    return(
        <div className={styles.StatContainer}>
            <div className={styles.wrapper}>
                <div className={styles.center}>
                    <b>
                        <p>Overview Section</p>
                    </b>
                </div>
                <br/>
                <hr/>
                <br/>
            </div>
            <div>
                <VotingDonutChart/>
            </div>
        </div>
    )
}

export function Reporting(props) {
    return(
        <div className={styles.StatContainer}>
            <div className={styles.wrapper}>
                <div className={styles.center}>
                    <b>
                        <p>{props.title}</p>
                    </b>
                </div>
                <br/>
                <hr/>
                <br/>
            </div>
            <div className={styles.wrapper2}>
                <h2>{props.content}</h2>
                <div
                className={styles.bar}
                style={{background:'red'}}>
                </div>
                <p>{props.description}</p>
            </div>
        </div>
    )
}


export function VotingDonutChart() {
  const [currentMonth, setCurrentMonth] = useState("March 2023");
  
  // Data for the chart
  const data = [
    { name: "Option A", value: 2300, color: "#3366CC" },
    { name: "Option B", value: 19200, color: "#FFAAAA" },
    { name: "Option D", value: 53000, color: "#FFCC33" },
    { name: "Option C", value: 5500, color: "#FF9933" }
  ];
  
  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate stroke dasharray and stroke dashoffset for each segment
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const chartData = [];
  let currentOffset = 0;
  
  data.forEach(item => {
    const percent = item.value / total;
    const dashLength = percent * circumference;
    
    chartData.push({
      ...item,
      dashLength,
      dashOffset: -currentOffset
    });
    
    currentOffset += dashLength;
  });
  
  // Format number with K suffix
  const formatNumber = (num) => {
    return num >= 1000 ? (num / 1000).toFixed(1) + 'K' : num;
  };
  
  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm w-full max-w-md">
      {/* Header with month navigation */}
      <div className="flex items-center justify-center w-full mb-4">
        <button className="p-1">
          <ChevronLeft size={20} />
        </button>
        <span className="mx-4 font-medium text-gray-800">{currentMonth}</span>
        <button className="p-1">
          <ChevronRight size={20} />
        </button>
      </div>
      
      {/* Donut chart */}
      <div className="relative w-64 h-64">
        <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
          {chartData.map((item, index) => (
            <circle
              key={index}
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth="20"
              strokeDasharray={`${item.dashLength} ${circumference - item.dashLength}`}
              strokeDashoffset={item.dashOffset}
              className="transition-all duration-500"
            />
          ))}
          {/* Inner white circle to create donut effect */}
          <circle cx="60" cy="60" r="40" fill="white" />
        </svg>
      </div>
      
      {/* Legend */}
      <div className="grid grid-cols-2 gap-4 mt-6 w-full">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-600">
              {item.name} {formatNumber(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}