'use client';

import { useState, useMemo } from 'react';
import { IAttendance } from "@/models/attendance.model";
import { IUser } from "@/models/user.model";
import { format } from 'date-fns';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Download, FilterX } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import Papa from 'papaparse';

interface PopulatedAttendance extends Omit<IAttendance, 'employeeId'> {
    employeeId: Pick<IUser, '_id' | 'name' | 'department'>;
}

type AttendanceTableProps = {
    initialData: PopulatedAttendance[];
    isAdmin: boolean;
    employees: Pick<IUser, '_id' | 'name'>[];
    departments: string[];
}

const RECORDS_PER_PAGE = 10;

export function AttendanceTable({ initialData, isAdmin, employees, departments }: AttendanceTableProps) {
    const [data, setData] = useState(initialData);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    const getStatus = (item: PopulatedAttendance) => {
        if (item.checkOut) return 'Completed';
        if (item.checkIn) return 'Working';
        return 'Absent';
    }

    const filteredData = useMemo(() => {
        return data.filter(item => {
            const isEmployeeMatch = !isAdmin || selectedEmployee === 'all' || item.employeeId?._id === selectedEmployee;
            const isDepartmentMatch = !isAdmin || selectedDepartment === 'all' || item.employeeId?.department === selectedDepartment;
            const isStatusMatch = selectedStatus === 'all' || getStatus(item) === selectedStatus;

            return isEmployeeMatch && isDepartmentMatch && isStatusMatch;
        });
    }, [data, selectedEmployee, selectedDepartment, selectedStatus, isAdmin]);

    const totalPages = Math.ceil(filteredData.length / RECORDS_PER_PAGE);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
        return filteredData.slice(startIndex, startIndex + RECORDS_PER_PAGE);
    }, [filteredData, currentPage]);
    
    const formatTime = (date: Date | string | null) => {
        if (!date) return 'N/A';
        return format(new Date(date), 'p');
    };
    
    const formatDuration = (hours: number) => {
        if (hours === 0 || !hours) return 'N/A';
        const h = Math.floor(hours);
        const m = Math.round((hours * 60) % 60);
        return `${h}h ${m}m`;
    };

    const handleClearFilters = () => {
        setSelectedEmployee('all');
        setSelectedDepartment('all');
        setSelectedStatus('all');
        setCurrentPage(1);
    }
    
    const exportToCSV = () => {
        const csvData = filteredData.map(item => {
            const baseData: any = {
                'Date': format(new Date(item.date), "PPP"),
                'Check In': formatTime(item.checkIn),
                'Check Out': formatTime(item.checkOut),
                'Total Hours': formatDuration(item.totalHours),
                'Status': getStatus(item)
            };

            if (isAdmin) {
                return {
                    'Employee': item.employeeId.name,
                    'Department': item.employeeId.department || 'N/A',
                    ...baseData
                }
            }
            return baseData;
        });

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `attendance_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const hasFilters = selectedEmployee !== 'all' || selectedDepartment !== 'all' || selectedStatus !== 'all';

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 rounded-lg border p-4">
                {isAdmin && (
                    <>
                         <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by Employee" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Employees</SelectItem>
                                {employees.map(emp => (
                                    <SelectItem key={emp._id} value={emp._id}>{emp.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {departments.map(dep => (
                                    <SelectItem key={dep} value={dep}>{dep}</SelectItem>

                                ))}
                            </SelectContent>
                        </Select>
                    </>
                )}

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Working">Working</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Absent">Absent</SelectItem>
                    </SelectContent>
                </Select>

                {hasFilters && (
                    <Button variant="ghost" onClick={handleClearFilters}>
                        <FilterX className="mr-2 h-4 w-4" />
                        Clear Filters
                    </Button>
                )}

                <div className="flex-grow" />
                
                <Button onClick={exportToCSV} variant="outline" disabled={filteredData.length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                {paginatedData.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {isAdmin && <TableHead>Employee</TableHead>}
                                <TableHead>Date</TableHead>
                                <TableHead>Check In</TableHead>
                                <TableHead>Check Out</TableHead>
                                <TableHead>Total Hours</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.map((item) => (
                                <TableRow key={item._id as string}>
                                    {isAdmin && <TableCell>{item.employeeId.name}</TableCell>}
                                    <TableCell>{format(new Date(item.date), "PPP")}</TableCell>
                                    <TableCell>{formatTime(item.checkIn)}</TableCell>
                                    <TableCell>{formatTime(item.checkOut)}</TableCell>
                                    <TableCell>{formatDuration(item.totalHours)}</TableCell>
                                    <TableCell>
                                        {getStatus(item) === 'Completed' && <Badge variant="secondary">Completed</Badge>}
                                        {getStatus(item) === 'Working' && <Badge className="bg-green-600 text-white">Working</Badge>}
                                        {getStatus(item) === 'Absent' && <Badge variant="outline">Absent</Badge>}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="p-8 text-center text-muted-foreground">
                        <p>No attendance records found for the selected filters.</p>
                    </div>
                )}
            </div>
            {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                     <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
