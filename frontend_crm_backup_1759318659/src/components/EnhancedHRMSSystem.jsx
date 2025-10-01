import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Calendar, CalendarDays, Clock, User, UserCheck, FileText, TrendingUp, Award, AlertCircle, CheckCircle, XCircle, Filter, Download, Send, Eye, Edit, Trash2, Plus, Users, Target, BarChart3, PieChart, Activity } from 'lucide-react';
// DatePicker component not available, using regular input
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const EnhancedHRMSSystem = () => {
  // State Management
  const [activeTab, setActiveTab] = useState('overview');
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Form States
  const [leaveForm, setLeaveForm] = useState({
    employee_id: '',
    leave_type: 'casual',
    start_date: '',
    end_date: '',
    reason: '',
    half_day: false,
    emergency: false
  });

  const [reportFilters, setReportFilters] = useState({
    employee_id: '',
    date_range: 'this_month',
    report_type: 'attendance',
    custom_start: '',
    custom_end: ''
  });

  // Mock Data (Replace with API calls)
  useEffect(() => {
    initializeHRMSData();
  }, []);

  const initializeHRMSData = async () => {
    setLoading(true);
    try {
      // Initialize with demo data
      setEmployees([
        { id: '1', name: 'Rajesh Kumar', department: 'Sales', designation: 'Sales Executive', status: 'active', joining_date: '2023-01-15' },
        { id: '2', name: 'Priya Sharma', department: 'Marketing', designation: 'Marketing Manager', status: 'active', joining_date: '2022-11-20' },
        { id: '3', name: 'Amit Patel', department: 'Operations', designation: 'Field Executive', status: 'active', joining_date: '2023-03-10' },
        { id: '4', name: 'Sneha Verma', department: 'Admin', designation: 'HR Assistant', status: 'active', joining_date: '2023-02-01' }
      ]);

      setAttendanceData([
        { id: '1', employee_id: '1', employee_name: 'Rajesh Kumar', date: '2024-01-15', check_in: '09:15', check_out: '18:30', status: 'present', hours: '9.25' },
        { id: '2', employee_id: '2', employee_name: 'Priya Sharma', date: '2024-01-15', check_in: '09:00', check_out: '18:15', status: 'present', hours: '9.25' },
        { id: '3', employee_id: '3', employee_name: 'Amit Patel', date: '2024-01-15', check_in: '08:45', check_out: '17:45', status: 'present', hours: '9.00' },
        { id: '4', employee_id: '1', employee_name: 'Rajesh Kumar', date: '2024-01-14', status: 'leave', leave_type: 'sick' },
        { id: '5', employee_id: '4', employee_name: 'Sneha Verma', date: '2024-01-15', check_in: '09:30', check_out: '18:00', status: 'present', hours: '8.50' }
      ]);

      setLeaveRequests([
        { id: '1', employee_id: '1', employee_name: 'Rajesh Kumar', leave_type: 'sick', start_date: '2024-01-14', end_date: '2024-01-14', days: 1, status: 'approved', reason: 'Fever and cold', applied_date: '2024-01-13' },
        { id: '2', employee_id: '2', employee_name: 'Priya Sharma', leave_type: 'casual', start_date: '2024-01-20', end_date: '2024-01-22', days: 3, status: 'pending', reason: 'Family function', applied_date: '2024-01-15' },
        { id: '3', employee_id: '3', employee_name: 'Amit Patel', leave_type: 'earned', start_date: '2024-02-01', end_date: '2024-02-05', days: 5, status: 'pending', reason: 'Vacation', applied_date: '2024-01-15' }
      ]);

      setPerformanceData([
        { id: '1', employee_id: '1', employee_name: 'Rajesh Kumar', metric: 'leads_converted', value: 15, target: 20, period: 'January 2024' },
        { id: '2', employee_id: '1', employee_name: 'Rajesh Kumar', metric: 'client_satisfaction', value: 4.5, target: 4.0, period: 'January 2024' },
        { id: '3', employee_id: '2', employee_name: 'Priya Sharma', metric: 'campaigns_completed', value: 8, target: 6, period: 'January 2024' },
        { id: '4', employee_id: '3', employee_name: 'Amit Patel', metric: 'projects_completed', value: 12, target: 10, period: 'January 2024' }
      ]);

    } catch (error) {
      console.error('HRMS initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRequest = async () => {
    setLoading(true);
    try {
      const newLeave = {
        id: Date.now().toString(),
        ...leaveForm,
        employee_name: employees.find(emp => emp.id === leaveForm.employee_id)?.name || 'Unknown',
        status: 'pending',
        applied_date: new Date().toISOString().split('T')[0],
        days: calculateLeaveDays(leaveForm.start_date, leaveForm.end_date)
      };

      setLeaveRequests(prev => [...prev, newLeave]);
      setShowLeaveModal(false);
      setLeaveForm({
        employee_id: '',
        leave_type: 'casual',
        start_date: '',
        end_date: '',
        reason: '',
        half_day: false,
        emergency: false
      });

      // In production, make API call
      // await axios.post(`${API}/api/hrms/leave-requests`, newLeave);

    } catch (error) {
      console.error('Leave request error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateLeaveDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const updateLeaveStatus = (leaveId, newStatus) => {
    setLeaveRequests(prev => prev.map(leave => 
      leave.id === leaveId ? { ...leave, status: newStatus } : leave
    ));
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      // In production, make API call with filters
      console.log('Generating report with filters:', reportFilters);
      
      // Mock report generation
      const reportData = {
        type: reportFilters.report_type,
        period: reportFilters.date_range,
        data: reportFilters.report_type === 'attendance' ? attendanceData : leaveRequests
      };
      
      // Here you would normally download or display the report
      alert('Report generated successfully! (Demo)');
      setShowReportModal(false);
      
    } catch (error) {
      console.error('Report generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Employees</p>
                <p className="text-3xl font-bold text-blue-700">{employees.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Present Today</p>
                <p className="text-3xl font-bold text-green-700">
                  {attendanceData.filter(att => att.status === 'present').length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Pending Leaves</p>
                <p className="text-3xl font-bold text-yellow-700">
                  {leaveRequests.filter(leave => leave.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Avg Performance</p>
                <p className="text-3xl font-bold text-purple-700">87%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common HRMS operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button onClick={() => setShowLeaveModal(true)} className="flex items-center justify-center">
              <CalendarDays className="h-4 w-4 mr-2" />
              Apply Leave
            </Button>
            <Button onClick={() => setActiveTab('attendance')} variant="outline" className="flex items-center justify-center">
              <Clock className="h-4 w-4 mr-2" />
              View Attendance
            </Button>
            <Button onClick={() => setShowReportModal(true)} variant="outline" className="flex items-center justify-center">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button onClick={() => setActiveTab('performance')} variant="outline" className="flex items-center justify-center">
              <Award className="h-4 w-4 mr-2" />
              Performance
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLeaveManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Leave Management</h3>
          <p className="text-gray-600">Manage employee leave requests and approvals</p>
        </div>
        <Button onClick={() => setShowLeaveModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Apply Leave
        </Button>
      </div>

      {/* Leave Requests Table */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Employee</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Dates</th>
                  <th className="text-left p-3">Days</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map((leave) => (
                  <tr key={leave.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{leave.employee_name}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="capitalize">
                        {leave.leave_type}
                      </Badge>
                    </td>
                    <td className="p-3">{leave.start_date} to {leave.end_date}</td>
                    <td className="p-3">{leave.days}</td>
                    <td className="p-3">
                      <Badge className={
                        leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                        leave.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {leave.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        {leave.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => updateLeaveStatus(leave.id, 'approved')}>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => updateLeaveStatus(leave.id, 'rejected')}>
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAttendanceReporting = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Attendance Reporting</h3>
          <p className="text-gray-600">Detailed attendance tracking and analytics</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowReportModal(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Attendance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Average Hours</span>
                <span className="font-semibold">8.8</span>
              </div>
              <div className="flex justify-between">
                <span>Attendance Rate</span>
                <span className="font-semibold text-green-600">94%</span>
              </div>
              <div className="flex justify-between">
                <span>Late Arrivals</span>
                <span className="font-semibold text-yellow-600">5</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Department Wise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Sales</span>
                <span className="font-semibold text-blue-600">95%</span>
              </div>
              <div className="flex justify-between">
                <span>Marketing</span>
                <span className="font-semibold text-green-600">92%</span>
              </div>
              <div className="flex justify-between">
                <span>Operations</span>
                <span className="font-semibold text-purple-600">96%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>This Week</span>
                <span className="font-semibold text-green-600">↑ 2%</span>
              </div>
              <div className="flex justify-between">
                <span>Last Week</span>
                <span className="font-semibold">92%</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Avg</span>
                <span className="font-semibold">94%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Details Table */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Daily Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Employee</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Check In</th>
                  <th className="text-left p-3">Check Out</th>
                  <th className="text-left p-3">Hours</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{record.employee_name}</td>
                    <td className="p-3">{record.date}</td>
                    <td className="p-3">{record.check_in || '-'}</td>
                    <td className="p-3">{record.check_out || '-'}</td>
                    <td className="p-3">{record.hours || '-'}</td>
                    <td className="p-3">
                      <Badge className={
                        record.status === 'present' ? 'bg-green-100 text-green-800' :
                        record.status === 'leave' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {record.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPerformanceTracking = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Performance Tracking</h3>
          <p className="text-gray-600">Monitor and analyze employee performance metrics</p>
        </div>
        <Button onClick={() => setShowPerformanceModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Metric
        </Button>
      </div>

      {/* Performance Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => {
          const employeePerformance = performanceData.filter(p => p.employee_id === employee.id);
          const avgPerformance = employeePerformance.length > 0 
            ? employeePerformance.reduce((acc, p) => acc + (p.value / p.target * 100), 0) / employeePerformance.length 
            : 0;

          return (
            <Card key={employee.id} className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{employee.name}</span>
                  <Badge className={
                    avgPerformance >= 90 ? 'bg-green-100 text-green-800' :
                    avgPerformance >= 70 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {avgPerformance.toFixed(0)}%
                  </Badge>
                </CardTitle>
                <CardDescription>{employee.designation}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {employeePerformance.map((perf) => (
                    <div key={perf.id} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{perf.metric.replace('_', ' ')}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{perf.value}/{perf.target}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              (perf.value / perf.target) >= 1 ? 'bg-green-500' :
                              (perf.value / perf.target) >= 0.8 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${Math.min((perf.value / perf.target) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('overview')}
          className="flex items-center"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Overview
        </Button>
        <Button
          variant={activeTab === 'leave' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('leave')}
          className="flex items-center"
        >
          <CalendarDays className="h-4 w-4 mr-2" />
          Leave Management
        </Button>
        <Button
          variant={activeTab === 'attendance' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('attendance')}
          className="flex items-center"
        >
          <Clock className="h-4 w-4 mr-2" />
          Attendance
        </Button>
        <Button
          variant={activeTab === 'performance' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('performance')}
          className="flex items-center"
        >
          <Award className="h-4 w-4 mr-2" />
          Performance
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'leave' && renderLeaveManagement()}
      {activeTab === 'attendance' && renderAttendanceReporting()}
      {activeTab === 'performance' && renderPerformanceTracking()}

      {/* Leave Application Modal */}
      <Dialog open={showLeaveModal} onOpenChange={setShowLeaveModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
            <DialogDescription>Submit a new leave request</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Employee</Label>
              <Select value={leaveForm.employee_id} onValueChange={(value) => setLeaveForm({...leaveForm, employee_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Leave Type</Label>
              <Select value={leaveForm.leave_type} onValueChange={(value) => setLeaveForm({...leaveForm, leave_type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual Leave</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="earned">Earned Leave</SelectItem>
                  <SelectItem value="emergency">Emergency Leave</SelectItem>
                  <SelectItem value="maternity">Maternity Leave</SelectItem>
                  <SelectItem value="paternity">Paternity Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input 
                  type="date" 
                  value={leaveForm.start_date}
                  onChange={(e) => setLeaveForm({...leaveForm, start_date: e.target.value})}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input 
                  type="date" 
                  value={leaveForm.end_date}
                  onChange={(e) => setLeaveForm({...leaveForm, end_date: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label>Reason</Label>
              <Textarea 
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                placeholder="Reason for leave..."
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleLeaveRequest} disabled={loading || !leaveForm.employee_id || !leaveForm.start_date}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
              <Button variant="outline" onClick={() => setShowLeaveModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Generation Modal */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
            <DialogDescription>Create detailed reports for analysis</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Report Type</Label>
              <Select value={reportFilters.report_type} onValueChange={(value) => setReportFilters({...reportFilters, report_type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attendance">Attendance Report</SelectItem>
                  <SelectItem value="leave">Leave Report</SelectItem>
                  <SelectItem value="performance">Performance Report</SelectItem>
                  <SelectItem value="payroll">Payroll Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date Range</Label>
              <Select value={reportFilters.date_range} onValueChange={(value) => setReportFilters({...reportFilters, date_range: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Employee (Optional)</Label>
              <Select value={reportFilters.employee_id} onValueChange={(value) => setReportFilters({...reportFilters, employee_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Employees</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2">
              <Button onClick={generateReport} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
              <Button variant="outline" onClick={() => setShowReportModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedHRMSSystem;