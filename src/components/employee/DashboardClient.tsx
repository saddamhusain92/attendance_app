'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Briefcase, Calendar, Timer } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { Button } from "../ui/button";
import { checkIn, checkOut } from "@/lib/actions/employee.actions";
import { useToast } from "@/hooks/use-toast";
import { IAttendance } from "@/models/attendance.model";

type DashboardData = {
    today: IAttendance | null;
    weekStats: {
        totalHours: number;
        daysPresent: number;
    }
}

export function DashboardClient({ initialData }: { initialData: string }) {
    const [isClient, setIsClient] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [data, setData] = useState<DashboardData>(JSON.parse(initialData, (key, value) => {
        if (key === 'checkIn' || key === 'checkOut') {
            return value ? new Date(value) : null;
        }
        return value;
    }));
    const [workingTime, setWorkingTime] = useState(0);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    useEffect(() => {
        setIsClient(true);
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    
    useEffect(() => {
      let interval: NodeJS.Timeout | undefined = undefined;
      if (data.today?.checkIn && !data.today?.checkOut) {
        const checkInTime = new Date(data.today.checkIn).getTime();
        
        const updateTimer = () => {
          const now = Date.now();
          setWorkingTime(now - checkInTime);
        };
        
        updateTimer();
        interval = setInterval(updateTimer, 1000);
      } else if (data.today?.checkIn && data.today?.checkOut) {
        const checkInTime = new Date(data.today.checkIn).getTime();
        const checkOutTime = new Date(data.today.checkOut).getTime();
        setWorkingTime(checkOutTime - checkInTime);
      } else {
        setWorkingTime(0);
      }
  
      return () => {
        if(interval) {
          clearInterval(interval);
        }
      }
    }, [data.today]);

    const formatTime = (date: Date | string | null) => {
        if (!date) return 'Not yet';
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    
    const formatDuration = (ms: number) => {
        if (ms < 0) ms = 0;
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const handleCheckIn = () => {
        startTransition(async () => {
            const result = await checkIn();
            if (result.error || !result.success) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else if (result.success && result.data) {
                toast({ title: 'Success', description: 'Checked in successfully.' });
                setData(prev => ({ ...prev, today: result.data as IAttendance }));
            }
        });
    }

    const handleCheckOut = () => {
        startTransition(async () => {
            const result = await checkOut();
            if (result.error || !result.success) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else if (result.success && result.data) {
                toast({ title: 'Success', description: 'Checked out successfully.' });
                setData(prev => ({ ...prev, today: result.data as IAttendance }));
            }
        });
    }

    const hasCheckedIn = !!data.today?.checkIn;
    const hasCheckedOut = !!data.today?.checkOut;

    return (
        <div className="mt-8 space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Live Clock</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isClient ? (
                            <>
                                <div className="text-2xl font-bold">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                                <p className="text-xs text-muted-foreground">{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </>
                        ) : (
                            <>
                                <div className="text-2xl font-bold">--:-- --</div>
                                <p className="text-xs text-muted-foreground">Loading...</p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Weekly Hours</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.weekStats.totalHours.toFixed(2)}h</div>
                        <p className="text-xs text-muted-foreground">Total hours worked this week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Weekly Presence</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.weekStats.daysPresent} / 6 days</div>
                        <p className="text-xs text-muted-foreground">Days present this week</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle className="font-headline">Today's Attendance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-center">
                        <div className="text-center">
                            <Timer className="mx-auto h-12 w-12 text-primary" />
                            <p className="text-5xl font-bold font-mono mt-2">{formatDuration(workingTime)}</p>
                            <p className="text-muted-foreground">Current Working Time</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-sm text-muted-foreground">Check-in Time</p>
                            <p className="text-lg font-semibold">{isClient ? formatTime(data.today?.checkIn) : '...'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <p className={`text-lg font-semibold ${hasCheckedIn && !hasCheckedOut ? 'text-green-500' : 'text-gray-500'}`}>
                                {hasCheckedIn && !hasCheckedOut ? 'Working' : (hasCheckedOut ? 'Completed' : 'Not Checked In')}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Check-out Time</p>
                            <p className="text-lg font-semibold">{isClient ? formatTime(data.today?.checkOut) : '...'}</p>
                        </div>
                    </div>

                    <div className="flex justify-center pt-4">
                        {!hasCheckedIn ? (
                            <Button onClick={handleCheckIn} disabled={isPending} size="lg" className="bg-green-600 hover:bg-green-700 text-white min-w-[150px]">
                                {isPending ? 'Checking In...' : 'Check In'}
                            </Button>
                        ) : !hasCheckedOut ? (
                             <Button onClick={handleCheckOut} disabled={isPending} size="lg" variant="destructive" className="min-w-[150px]">
                                {isPending ? 'Checking Out...' : 'Check Out'}
                            </Button>
                        ) : (
                            <p className="font-semibold text-green-500">Your attendance for today is complete!</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
