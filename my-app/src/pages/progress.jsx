import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProgressChart from '@/components/reused/progressChart';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const timeFrames = {
  '7 Days': 7,
  '30 Days': 30,
  '2 Months': 60,
  '6 Months': 180,
  '1 Year': 365,
};

const Progress = () => {
  const [timeframe, setTimeframe] = useState('30 Days');
  const [chartData, setChartData] = useState([]);
  const [missedTasks, setMissedTasks] = useState([]);
  const navigate = useNavigate();
  const userId = 1; // Replace with context/auth if available

  useEffect(() => {
    const days = timeFrames[timeframe];

    const fetchChartData = async () => {
      try {
        const res = await axios.get(`/api/completion-stats/${userId}?days=${days}`);
        const rawData = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
          ? res.data.data
          : [];

        const formattedData = rawData
          .map((item) => {
            const parsedDate = new Date(item.date);
            if (isNaN(parsedDate.getTime())) return null;
            return {
              date: parsedDate.toISOString(),
              percentage: item.percentage,
            };
          })
          .filter(Boolean);

        setChartData(formattedData);
      } catch (error) {
        console.error("🚨 Error fetching progress stats:", error);
        setChartData([]);
      }
    };

    const fetchMissedTasks = async () => {
      try {
        const res = await axios.get(`/api/lacking-categories/${userId}?days=${days}`);
        console.log("🎯 Missed task API response:", res.data);
        setMissedTasks(res.data?.suggestions || []);
      } catch (error) {
        console.error("🚨 Error fetching missed tasks:", error);
        setMissedTasks([]);
      }
    };

    fetchChartData();
    fetchMissedTasks();
  }, [timeframe]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Progress Overview</h1>
        <Button onClick={() => navigate('/')}>Go to Dashboard</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.keys(timeFrames).map((tf) => (
          <Button
            key={tf}
            variant={timeframe === tf ? 'default' : 'outline'}
            onClick={() => setTimeframe(tf)}
          >
            {tf}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="h-72">
          {chartData.length > 0 ? (
            <ProgressChart data={chartData} />
          ) : (
            <p className="text-gray-500 text-sm">No progress data available.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">Areas You Missed Most</h2>

          {missedTasks.length === 0 ? (
            <p className="text-gray-500 text-sm">
              🎉 Great job! You didn’t miss any task categories during this period.
            </p>
          ) : (
            <ul className="list-disc list-inside space-y-1">
              {missedTasks.map((task, idx) => (
                <li key={idx} className="text-red-600">
                  {task.label || "Unlabeled"} — missed {task.missed} time{task.missed > 1 ? "s" : ""}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Progress;
