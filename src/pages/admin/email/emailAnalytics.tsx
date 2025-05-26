import React, { useState, useEffect, useCallback } from 'react';
import {
    FaEnvelope,
    FaUsers,
    FaCheckCircle,
    FaExclamationTriangle,
    FaEye,
    FaMousePointer,
    FaCalendarAlt,
    FaDownload,
    FaArrowUp,
    FaArrowDown,
    FaChartLine,
    FaChartBar
} from 'react-icons/fa';
import AdminLayout from '../../../layout/adminLayout';
import { emailApi } from '../../../api/apiClient';

interface Analytics {
    totalEmails: number;
    totalRecipients: number;
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    avgOpenRate: number;
    avgClickRate: number;
}

interface TimeSeriesData {
    date: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
}

interface TemplatePerformance {
    template: string;
    campaigns: number;
    totalSent: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
}

const EmailAnalytics: React.FC = () => {
    const [analytics, setAnalytics] = useState<Analytics>({
        totalEmails: 0,
        totalRecipients: 0,
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        avgOpenRate: 0,
        avgClickRate: 0
    });

    const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
    const [templatePerformance, setTemplatePerformance] = useState<TemplatePerformance[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Filter states
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [selectedPeriod, setSelectedPeriod] = useState('30d');

    // Memoized functions to prevent unnecessary re-renders
    const generateMockTimeSeriesData = useCallback(() => {
        const data: TimeSeriesData[] = [];
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const sent = Math.floor(Math.random() * 100) + 20;
            const delivered = Math.floor(sent * (0.85 + Math.random() * 0.1));
            const opened = Math.floor(delivered * (0.15 + Math.random() * 0.15));
            const clicked = Math.floor(opened * (0.1 + Math.random() * 0.1));

            data.push({
                date: d.toISOString().split('T')[0],
                sent,
                delivered,
                opened,
                clicked
            });
        }

        setTimeSeriesData(data);
    }, [dateRange.start, dateRange.end]);

    const generateMockTemplatePerformance = useCallback(() => {
        const templates = ['Newsletter', 'Appointment', 'Promotional', 'Welcome', 'Reminder'];
        const performance: TemplatePerformance[] = templates.map(template => ({
            template,
            campaigns: Math.floor(Math.random() * 20) + 5,
            totalSent: Math.floor(Math.random() * 500) + 100,
            deliveryRate: 85 + Math.random() * 10,
            openRate: 15 + Math.random() * 20,
            clickRate: 2 + Math.random() * 5
        }));

        setTemplatePerformance(performance.sort((a, b) => b.openRate - a.openRate));
    }, []);

    const fetchAnalytics = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await emailApi.getEmailAnalytics({
                startDate: dateRange.start,
                endDate: dateRange.end
            });

            if (response.success) {
                setAnalytics(response.data);
            }
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to fetch analytics:', error);
            setError('Failed to load email analytics');
            // Set mock data for demo
            setAnalytics({
                totalEmails: 45,
                totalRecipients: 1240,
                totalSent: 1156,
                totalDelivered: 1089,
                totalFailed: 67,
                avgOpenRate: 23.4,
                avgClickRate: 3.8
            });
        } finally {
            setIsLoading(false);
        }
    }, [dateRange.start, dateRange.end]);

    // Fixed: Use proper useEffect with memoized functions to prevent infinite loops
    useEffect(() => {
        fetchAnalytics();
        generateMockTimeSeriesData();
        generateMockTemplatePerformance();
    }, [fetchAnalytics, generateMockTimeSeriesData, generateMockTemplatePerformance]);

    const handlePeriodChange = (period: string) => {
        setSelectedPeriod(period);
        const endDate = new Date();
        const startDate = new Date();

        switch (period) {
            case '7d':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(endDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(endDate.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(endDate.getFullYear() - 1);
                break;
            default:
                startDate.setDate(endDate.getDate() - 30);
        }

        setDateRange({
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0]
        });
    };

    const exportAnalytics = () => {
        const csvContent = [
            ['Metric', 'Value'],
            ['Total Emails', analytics.totalEmails.toString()],
            ['Total Recipients', analytics.totalRecipients.toString()],
            ['Total Sent', analytics.totalSent.toString()],
            ['Total Delivered', analytics.totalDelivered.toString()],
            ['Total Failed', analytics.totalFailed.toString()],
            ['Average Open Rate', `${analytics.avgOpenRate.toFixed(2)}%`],
            ['Average Click Rate', `${analytics.avgClickRate.toFixed(2)}%`],
            ['Delivery Rate', `${analytics.totalSent > 0 ? ((analytics.totalDelivered / analytics.totalSent) * 100).toFixed(2) : 0}%`]
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `email-analytics-${dateRange.start}-to-${dateRange.end}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
    };

    const StatCard: React.FC<{
        title: string;
        value: string | number;
        icon: React.ReactNode;
        change?: { value: number; isPositive: boolean };
        color: string;
    }> = ({ title, value, icon, change, color }) => (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
                <div className={`p-3 rounded-lg ${color}`}>
                    {icon}
                </div>
                <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <div className="flex items-center">
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                        {change && (
                            <div className={`ml-2 flex items-center text-sm ${change.isPositive ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {change.isPositive ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                                {Math.abs(change.value)}%
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const SimpleChart: React.FC<{ data: TimeSeriesData[]; dataKey: string; color: string; title: string }> = ({
        data, dataKey, color, title
    }) => {
        const maxValue = Math.max(...data.map(d => d[dataKey as keyof TimeSeriesData] as number));

        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
                <div className="flex items-end space-x-1 h-32">
                    {data.slice(-14).map((item, index) => {
                        const value = item[dataKey as keyof TimeSeriesData] as number;
                        const height = maxValue > 0 ? (value / maxValue) * 100 : 0;

                        return (
                            <div key={index} className="flex flex-col items-center flex-1">
                                <div
                                    className={`w-full ${color} rounded-t opacity-75 hover:opacity-100 transition-opacity`}
                                    style={{ height: `${height}%` }}
                                    title={`${new Date(item.date).toLocaleDateString()}: ${value}`}
                                />
                                <span className="text-xs text-gray-500 mt-1 transform rotate-45 origin-left">
                                    {new Date(item.date).getDate()}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <AdminLayout>
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Email Analytics</h1>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={exportAnalytics}
                            className="bg-[#FFB915] text-white px-4 py-2 rounded-md hover:bg-[#2C4A6B] flex items-center"
                            disabled={isLoading}
                        >
                            <FaDownload className="mr-2" />
                            Export Report
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                        {error}
                    </div>
                )}

                {isLoading && (
                    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
                        Loading analytics data...
                    </div>
                )}

                {/* Date Range and Period Selector */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-4 mb-4 md:mb-0">
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                {[
                                    { key: '7d', label: '7 Days' },
                                    { key: '30d', label: '30 Days' },
                                    { key: '90d', label: '90 Days' },
                                    { key: '1y', label: '1 Year' }
                                ].map(period => (
                                    <button
                                        key={period.key}
                                        onClick={() => handlePeriodChange(period.key)}
                                        className={`px-4 py-2 text-sm rounded-md transition-colors ${selectedPeriod === period.key
                                            ? 'bg-[#FFB915] text-white'
                                            : 'text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {period.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <FaCalendarAlt className="text-gray-400" />
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#FFB915] focus:border-[#FFB915]"
                                />
                                <span className="text-gray-500">to</span>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#FFB915] focus:border-[#FFB915]"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Campaigns"
                        value={analytics.totalEmails}
                        icon={<FaEnvelope className="text-blue-600" />}
                        change={{ value: 12, isPositive: true }}
                        color="bg-blue-100"
                    />
                    <StatCard
                        title="Total Recipients"
                        value={analytics.totalRecipients.toLocaleString()}
                        icon={<FaUsers className="text-green-600" />}
                        change={{ value: 8, isPositive: true }}
                        color="bg-green-100"
                    />
                    <StatCard
                        title="Delivery Rate"
                        value={`${analytics.totalSent > 0 ? ((analytics.totalDelivered / analytics.totalSent) * 100).toFixed(1) : 0}%`}
                        icon={<FaCheckCircle className="text-emerald-600" />}
                        change={{ value: 2.1, isPositive: true }}
                        color="bg-emerald-100"
                    />
                    <StatCard
                        title="Avg Open Rate"
                        value={`${analytics.avgOpenRate.toFixed(1)}%`}
                        icon={<FaEye className="text-purple-600" />}
                        change={{ value: 0.8, isPositive: false }}
                        color="bg-purple-100"
                    />
                </div>

                {/* Additional Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Email Performance</h3>
                            <FaChartBar className="text-gray-400" />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Sent</span>
                                <span className="text-sm font-medium text-gray-900">{analytics.totalSent.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Delivered</span>
                                <span className="text-sm font-medium text-green-600">{analytics.totalDelivered.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Failed</span>
                                <span className="text-sm font-medium text-red-600">{analytics.totalFailed.toLocaleString()}</span>
                            </div>
                            <div className="pt-2 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Success Rate</span>
                                    <span className="text-sm font-medium text-blue-600">
                                        {analytics.totalSent > 0 ? ((analytics.totalDelivered / analytics.totalSent) * 100).toFixed(1) : 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Engagement Rates</h3>
                            <FaMousePointer className="text-gray-400" />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">Open Rate</span>
                                    <span className="text-sm font-medium text-purple-600">{analytics.avgOpenRate.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-purple-600 h-2 rounded-full"
                                        style={{ width: `${Math.min(analytics.avgOpenRate, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">Click Rate</span>
                                    <span className="text-sm font-medium text-orange-600">{analytics.avgClickRate.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-orange-600 h-2 rounded-full"
                                        style={{ width: `${Math.min(analytics.avgClickRate * 4, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Click-to-Open Rate</span>
                                    <span className="text-sm font-medium text-indigo-600">
                                        {analytics.avgOpenRate > 0 ? ((analytics.avgClickRate / analytics.avgOpenRate) * 100).toFixed(1) : 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Trend Analysis</h3>
                            <FaArrowUp className="text-gray-400" />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Weekly Growth</span>
                                <div className="flex items-center text-green-600">
                                    <FaArrowUp className="mr-1 h-3 w-3" />
                                    <span className="text-sm font-medium">+12.5%</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Engagement Trend</span>
                                <div className="flex items-center text-red-600">
                                    <FaArrowDown className="mr-1 h-3 w-3" />
                                    <span className="text-sm font-medium">-2.1%</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Best Day</span>
                                <span className="text-sm font-medium text-gray-900">Tuesday</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Best Time</span>
                                <span className="text-sm font-medium text-gray-900">10:00 AM</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <SimpleChart
                        data={timeSeriesData}
                        dataKey="sent"
                        color="bg-blue-500"
                        title="Emails Sent Over Time"
                    />
                    <SimpleChart
                        data={timeSeriesData}
                        dataKey="delivered"
                        color="bg-green-500"
                        title="Emails Delivered Over Time"
                    />
                    <SimpleChart
                        data={timeSeriesData}
                        dataKey="opened"
                        color="bg-purple-500"
                        title="Emails Opened Over Time"
                    />
                    <SimpleChart
                        data={timeSeriesData}
                        dataKey="clicked"
                        color="bg-orange-500"
                        title="Email Clicks Over Time"
                    />
                </div>

                {/* Template Performance */}
                <div className="bg-white rounded-lg shadow-md mb-8">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Template Performance</h3>
                        <p className="text-sm text-gray-500 mt-1">Compare performance across different email templates</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Template
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Campaigns
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Sent
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Delivery Rate
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Open Rate
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Click Rate
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {templatePerformance.map((template, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`w-3 h-3 rounded-full mr-2 ${index === 0 ? 'bg-green-500' :
                                                    index === 1 ? 'bg-blue-500' :
                                                        index === 2 ? 'bg-yellow-500' :
                                                            index === 3 ? 'bg-purple-500' : 'bg-gray-500'
                                                    }`}></div>
                                                <span className="text-sm font-medium text-gray-900">{template.template}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {template.campaigns}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {template.totalSent.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                    <div
                                                        className="bg-green-600 h-2 rounded-full"
                                                        style={{ width: `${template.deliveryRate}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-900">{template.deliveryRate.toFixed(1)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                    <div
                                                        className="bg-purple-600 h-2 rounded-full"
                                                        style={{ width: `${Math.min(template.openRate * 3, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-900">{template.openRate.toFixed(1)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                    <div
                                                        className="bg-orange-600 h-2 rounded-full"
                                                        style={{ width: `${Math.min(template.clickRate * 10, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-900">{template.clickRate.toFixed(1)}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Best Practices & Recommendations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Insights</h3>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <FaCheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-gray-700">
                                        <strong>Great delivery rate!</strong> Your emails are reaching {((analytics.totalDelivered / analytics.totalSent) * 100).toFixed(0)}% of recipients.
                                    </p>
                                </div>
                            </div>

                            {analytics.avgOpenRate < 20 && (
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <FaExclamationTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-gray-700">
                                            <strong>Open rate opportunity:</strong> Try A/B testing subject lines to improve engagement.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <FaChartLine className="h-5 w-5 text-blue-500 mt-0.5" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-gray-700">
                                        <strong>Best performing template:</strong> {templatePerformance[0]?.template} with {templatePerformance[0]?.openRate.toFixed(1)}% open rate.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-blue-50 rounded-md">
                                <p className="text-sm text-blue-800">
                                    <strong>Optimize send time:</strong> Most of your audience opens emails between 9-11 AM on weekdays.
                                </p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-md">
                                <p className="text-sm text-green-800">
                                    <strong>Segment your audience:</strong> Newsletter templates show higher engagement rates.
                                </p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-md">
                                <p className="text-sm text-purple-800">
                                    <strong>Mobile optimization:</strong> Ensure your templates are mobile-friendly for better click rates.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default EmailAnalytics;