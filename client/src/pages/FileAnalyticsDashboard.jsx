import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import {
  FileText,
  Image,
  FileVideo,
  File,
  Folder,
  ArrowLeftSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getFileAnalytics } from "@/api/fileDirectoryApi";

const FileAnalyticsDashboard = () => {
  const navigate = useNavigate();
  // Your API response data
  const [analyticsData, setAnalyticsData] = useState([]);
  useEffect(() => {
    fetchAnalyticsData();
  }, []);
  const fetchAnalyticsData = async () => {
    try {
      const res = await getFileAnalytics();
      setAnalyticsData(res.data);
    } catch (error) {}
  };
  // Transform data for the chart
  const chartData = Object.entries(analyticsData)
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => ({
      name: type,
      value: count,
      percentage: (
        (count / Object.values(analyticsData).reduce((a, b) => a + b, 0)) *
        100
      ).toFixed(1),
    }));

  // Colors for each file type
  const colors = {
    Image: "#3B82F6",
    PDF: "#EF4444",
    Text: "#10B981",
    Video: "#8B5CF6",
    Other: "#6B7280",
  };

  const getIcon = (type) => {
    const iconProps = { size: 20, className: "mr-2" };
    switch (type) {
      case "Image":
        return <Image {...iconProps} />;
      case "PDF":
        return <FileText {...iconProps} />;
      case "Text":
        return <File {...iconProps} />;
      case "Video":
        return <FileVideo {...iconProps} />;
      default:
        return <Folder {...iconProps} />;
    }
  };

  const totalFiles = Object.values(analyticsData).reduce((a, b) => a + b, 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="  p-3 rounded-lg shadow-lg  ">
          <p className="font-medium text-gray-900">{data.name} Files</p>
          <p className="text-sm text-gray-600">
            {data.value} files ({data.payload.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto p-2  min-h-screen space-y-2">
      <Button
        onClick={() => navigate(-1)}
        className="  z-50 shadow-md hover:shadow-lg border border-gray-300 dark:border-gray-600  bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-lg transition-all duration-200 flex items-center gap-3 font-medium"
      >
        <ArrowLeftSquare className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
        Back
      </Button>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6 ">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold dark:text-gray-400 text-gray-900 mb-2">
            File Analytics
          </h1>
          <p className="text-gray-500">
            Overview of your file distribution by type
          </p>
        </div>
        {/* Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Donut Chart */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 h-96">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-300 mb-4">
                File Distribution
              </h2>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center text showing total */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-200">
                    {totalFiles}
                  </p>
                  <p className="text-sm text-gray-500 ">Total Files</p>
                </div>
              </div>
            </div>
          </div>

          {/* Legend and Details */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">
                Breakdown
              </h3>
              <div className="space-y-3">
                {chartData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: colors[item.name] }}
                      ></div>
                      <div className="flex items-center">
                        {getIcon(item.name)}
                        <span className="font-medium text-gray-900 dark:text-gray-200">
                          {item.name}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-gray-200">
                        {item.value}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.percentage}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 border border-blue-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-purple-200 mb-2">
                Summary
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-500">
                  <span className="font-medium">Most common:</span>{" "}
                  {chartData[0]?.name || "N/A"}
                </p>
                <p className="text-gray-500">
                  <span className="font-medium">Total files:</span> {totalFiles}
                </p>
                <p className="text-gray-500">
                  <span className="font-medium">File types:</span>{" "}
                  {chartData.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileAnalyticsDashboard;
