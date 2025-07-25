import { LogOut, Phone, Monitor, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";

const getDeviceIcon = (type) => {
    if (!type) return <Monitor className="w-5 h-5" />;
    const t = type.toLowerCase();
    if (t.includes("mobile") || t.includes("android")) return <Phone className="w-5 h-5" />;
    if (t.includes("tablet")) return <Tablet className="w-5 h-5" />;
    return <Monitor className="w-5 h-5" />;  
  };

const DeviceList = ({ user, handleLogout }) => {
  return (
    <div className="pt-6 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 dark:bg-gray-800 text-left text-gray-700 dark:text-gray-300 text-sm">
          <tr>
            <th className="px-4 py-3">Device</th>
            <th className="px-4 py-3">Device Name</th>
            <th className="px-4 py-3">Device Type</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 text-sm divide-y divide-gray-200 dark:divide-gray-700">
          {user?.allDevices?.map((device) => (
            <tr
              key={device.deviceId}
              className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                  {getDeviceIcon(device.deviceType)}
                </div>
              </td>
              <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                {device.deviceName || "Unknown"}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                {device.deviceType}
              </td>
              <td className="px-4 py-3">
                <Button
                  onClick={handleLogout}
                  className="bg-[var(--destructive)] text-white hover:opacity-90 hover:scale-105 px-4 py-2 text-sm rounded-lg transition"
                >
                  <LogOut className="mr-2 w-4 h-4" />
                  Sign Out
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DeviceList;
