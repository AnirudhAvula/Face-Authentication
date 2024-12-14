import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './CSS_History'; // Import styles from styles.js
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom';

const History = () => {
    const [verificationData, setVerificationData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false);
    const [dateToggle, setDateToggle] = useState('today');
    const navigate = useNavigate();
    useEffect(() => {
        const fetchVerificationData = async () => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }

                const response = await axios.get('http://localhost:5000/api/face/verification-history', {
                    headers: {
                        'auth-token': token,
                    },
                });

                const sortedData = response.data.history.sort(
                    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                );
                setVerificationData(sortedData);
            } catch (error) {
                console.error('Error fetching verification data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVerificationData();
    }, []);

    const groupByDate = (data) => {
        const groupedData = {
            today: [],
            yesterday: [],
            selectedDate: [],
        };
    
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
    
        // Function to normalize the date (remove time part for comparison)
        const normalizeDate = (date) => {
            const normalizedDate = new Date(date);
            normalizedDate.setHours(0, 0, 0, 0); // Set time to 00:00:00 to ignore the time part
            return normalizedDate;
        };
    
        // Normalize selectedDate to ignore time part
        const normalizedSelectedDate = normalizeDate(selectedDate);
        const normalizedToday = normalizeDate(today);
        const normalizedYesterday = normalizeDate(yesterday);
    
        data.forEach((entry) => {
            const entryDate = new Date(entry.createdAt);
            const normalizedEntryDate = normalizeDate(entryDate); // Normalize the entry's date
    
            if (normalizedEntryDate.getTime() === normalizedToday.getTime()) {
                groupedData.today.push(entry);
            } else if (normalizedEntryDate.getTime() === normalizedYesterday.getTime()) {
                groupedData.yesterday.push(entry);
            } else if (normalizedEntryDate.getTime() === normalizedSelectedDate.getTime()) {
                groupedData.selectedDate.push(entry);
            }
        });
    
        return groupedData;
    };
    

    // Function to format the date to dd-mm-yyyy
    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    if (loading) {
        return <p style={styles.loading}>Loading verification history...</p>;
    }

    const groupedData = groupByDate(verificationData);

    const getPeriodTitleWithDate = (period) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (period === 'today') return `Today (${formatDate(today)})`;
        if (period === 'yesterday') return `Yesterday (${formatDate(yesterday)})`;
        return `Selected Date (${formatDate(selectedDate)})`;
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        setDateToggle('selectedDate');
        setShowCalendar(false);
    };
    const handleBack = () => {
        navigate("/userprofile"); // Navigate back to the dashboard
    };

    return (
        <div style={styles.container}>
            <button
                onClick={handleBack}
                style={styles.backButton}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.backButtonHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, styles.backButton)}
            >
                &lt; Back
            </button>
            <div style={styles.profileTitle}>Verification History</div>

            {/* Date Selection and Toggle */}
            <div style={styles.dateToggleContainer}>
                <button
                    style={styles.dateToggleButton}
                    onClick={() => setDateToggle('today')}
                >
                    Today
                </button>
                <button
                    style={styles.dateToggleButton}
                    onClick={() => setDateToggle('yesterday')}
                >
                    Yesterday
                </button>
                <button
                    style={styles.selectDateToggleButton}
                    onClick={() => setShowCalendar(!showCalendar)}
                >
                    📅 Select Date
                </button>
            </div>

            {/* Calendar for Date Selection (Positioned top-right inside the card) */}
            {showCalendar && (
                <div style={styles.calendarWrapper}>
                    <Calendar
                        onChange={handleDateChange}
                        value={selectedDate}
                        minDate={new Date('2024-08-30')} // You can change this to any start date
                        maxDate={new Date()} // Current date as max date
                    />
                </div>
            )}

            {/* Display Verification Data */}
            <div style={styles.historySection}>
                <h3 style={styles.historyTitle}>{getPeriodTitleWithDate(dateToggle)}</h3>
                {groupedData[dateToggle].length > 0 ? (
                    <ul style={styles.labelList}>
                        {groupedData[dateToggle].map((entry, index) => (
                            <li key={index} style={styles.labelItem}>
                                <div style={styles.labelTextWrapper}>
                                    <p style={styles.labelText}>
                                        <strong>Label:</strong> {entry.labelName}
                                    </p>
                                    <p style={styles.labelTime}>
                                        <strong>Time:</strong>{' '}
                                        {new Date(entry.createdAt).toLocaleTimeString()}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={styles.noData}>
                        No verifications for this period.
                    </p>
                )}
            </div>
        </div>
    );
};

export default History;
