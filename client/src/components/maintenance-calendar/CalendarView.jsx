import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

const CalendarView = ({ selectedDate, onDateSelect, scheduledDates = [] }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const daysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const hasScheduledDate = (day) => {
        return scheduledDates.some(d => 
            d.getDate() === day &&
            d.getMonth() === currentMonth.getMonth() &&
            d.getFullYear() === currentMonth.getFullYear()
        );
    };

    const isSelected = (day) => {
        return selectedDate.getDate() === day &&
               selectedDate.getMonth() === currentMonth.getMonth() &&
               selectedDate.getFullYear() === currentMonth.getFullYear();
    };

    const isToday = (day) => {
        const today = new Date();
        return day === today.getDate() &&
               currentMonth.getMonth() === today.getMonth() &&
               currentMonth.getFullYear() === today.getFullYear();
    };

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const handleSelectDate = (day) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        onDateSelect(newDate);
    };

    const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const totalDays = daysInMonth(currentMonth);
    const firstDay = firstDayOfMonth(currentMonth);
    const calendarDays = [];

    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
        calendarDays.push(i);
    }

    return (
        <div className="space-y-4">
            {/* Month Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm" style={{ color: 'rgb(30, 33, 40)' }}>
                    {monthName}
                </h3>
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePrevMonth}
                        className="h-8 w-8"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleNextMonth}
                        className="h-8 w-8"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {days.map(day => (
                    <div
                        key={day}
                        className="text-center text-xs font-semibold py-2"
                        style={{ color: 'rgb(90, 94, 105)' }}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                    const hasScheduled = day ? hasScheduledDate(day) : false;
                    const selected = day ? isSelected(day) : false;
                    const today = day ? isToday(day) : false;

                    return (
                        <button
                            key={index}
                            onClick={() => day && handleSelectDate(day)}
                            disabled={!day}
                            className="aspect-square text-xs font-medium rounded-lg transition-all"
                            style={{
                                backgroundColor: selected
                                    ? 'rgb(42, 112, 255)'
                                    : hasScheduled
                                    ? 'rgb(245, 246, 249)'
                                    : 'transparent',
                                color: selected
                                    ? 'white'
                                    : today
                                    ? 'rgb(42, 112, 255)'
                                    : day
                                    ? 'rgb(30, 33, 40)'
                                    : 'rgb(130, 134, 145)',
                                border: today && !selected ? '2px solid rgb(42, 112, 255)' : 'none',
                                fontWeight: today ? 'bold' : 'normal',
                                cursor: day ? 'pointer' : 'default',
                                opacity: !day ? 0.3 : 1
                            }}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(0, 0, 0, 0.08)' }}>
                <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                        <div
                            className="h-3 w-3 rounded"
                            style={{ backgroundColor: 'rgb(42, 112, 255)' }}
                        ></div>
                        <span style={{ color: 'rgb(90, 94, 105)' }}>Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            className="h-3 w-3 rounded"
                            style={{ backgroundColor: 'rgb(245, 246, 249)', border: '1px solid rgba(0, 0, 0, 0.08)' }}
                        ></div>
                        <span style={{ color: 'rgb(90, 94, 105)' }}>Has Schedule</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
