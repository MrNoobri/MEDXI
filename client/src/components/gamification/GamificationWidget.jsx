import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";

const GamificationWidget = () => {
  const { data: stats } = useQuery({
    queryKey: ["userStats"],
    queryFn: async () => {
      const response = await api.get("/gamification/stats");
      return response.data.data;
    },
  });

  if (!stats) return null;

  const getProgressPercentage = (current, target) => {
    return Math.min(100, (current / target) * 100);
  };

  const getLevelProgress = () => {
    const pointsForCurrentLevel = (stats.level - 1) * 500;
    const pointsForNextLevel = stats.level * 500;
    const currentProgress = stats.totalPoints - pointsForCurrentLevel;
    const levelRange = pointsForNextLevel - pointsForCurrentLevel;
    return (currentProgress / levelRange) * 100;
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Your Progress</h3>
          <p className="text-sm text-gray-600">Keep up the great work!</p>
        </div>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full text-white font-bold text-2xl shadow-lg">
            {stats.level}
          </div>
          <p className="text-xs text-gray-600 mt-1">Level</p>
        </div>
      </div>

      {/* Level Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Level Progress
          </span>
          <span className="text-sm text-gray-600">{stats.totalPoints} pts</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${getLevelProgress()}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {500 - (stats.totalPoints % 500)} points to level {stats.level + 1}
        </p>
      </div>

      {/* Streak */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1 bg-white rounded-lg p-4 shadow-sm border border-orange-100">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-2xl font-bold text-orange-500">
                {stats.currentStreak}
              </p>
              <p className="text-xs text-gray-600">Day Streak</p>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-white rounded-lg p-4 shadow-sm border border-blue-100">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📊</span>
            <div>
              <p className="text-2xl font-bold text-blue-500">
                {stats.totalMetricsLogged}
              </p>
              <p className="text-xs text-gray-600">Metrics Logged</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Goals */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-700">Weekly Goals</h4>

        {/* Steps Goal */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center space-x-2">
              <span>👣</span>
              <span className="text-sm font-medium text-gray-700">Steps</span>
            </div>
            <span className="text-sm text-gray-600">
              {stats.weeklyGoals.steps.current.toLocaleString()} /{" "}
              {stats.weeklyGoals.steps.target.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${getProgressPercentage(stats.weeklyGoals.steps.current, stats.weeklyGoals.steps.target)}%`,
              }}
            />
          </div>
        </div>

        {/* Sleep Goal */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center space-x-2">
              <span>😴</span>
              <span className="text-sm font-medium text-gray-700">
                Sleep Hours
              </span>
            </div>
            <span className="text-sm text-gray-600">
              {stats.weeklyGoals.sleep.current.toFixed(1)} /{" "}
              {stats.weeklyGoals.sleep.target} hrs
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${getProgressPercentage(stats.weeklyGoals.sleep.current, stats.weeklyGoals.sleep.target)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      {stats.achievements && stats.achievements.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Recent Achievements
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {stats.achievements.slice(-4).map((achievement, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-3 shadow-sm border border-yellow-100 text-center"
              >
                <div className="text-3xl mb-1">{achievement.icon}</div>
                <p className="text-xs font-semibold text-gray-800">
                  {achievement.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationWidget;
