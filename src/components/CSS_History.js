const styles = {
    container: {
        fontFamily: 'Kumbh Sans, sans-serif',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px 20px 20px 20px', // Make sure padding values are defined for all sides
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        marginTop: '90px',
        width: '100%',
        paddingTop: '30px', // Adds internal padding at the top
    },
    
    profileTitle: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#2c3e50',
        textAlign: 'center',
        marginBottom: '20px',
        borderBottom: '4px solid #3498db',
        textTransform: 'uppercase',
        letterSpacing: '2px',
    },
    dateToggleContainer: {
        display: 'flex',
        justifyContent: 'flex-start',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap', // This ensures buttons stack when space is limited
    },
    dateToggleButton: {
        padding: '8px 15px',
        backgroundColor: '#0b76e9e7',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'background-color 0.3s',
        minWidth: '100px', // Ensure buttons don't shrink too small
        textAlign: 'center',
    },
    selectDateToggleButton: {
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#079364c0',
        color: '#fff',
        border: 'none',
        borderRadius: '25px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        marginLeft: 'auto', // Align button to the right
        minWidth: '150px', // Minimum width for select button
    },
    dateToggleButtonHover: {
        backgroundColor: '#45a049',
    },
    calendarWrapper: {
        marginTop: '10px',
        position: 'relative',
    },
    historySection: {
        marginTop: '30px',
        padding: '15px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    historyTitle: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: '15px',
        borderBottom: '2px solid #ddd',
        paddingBottom: '5px',
    },
    labelList: {
        listStyleType: 'none',
        padding: '0',
        margin: '0',
    },
    labelItem: {
        backgroundColor: '#f7f7f7',
        marginBottom: '10px',
        padding: '15px',
        borderRadius: '5px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    labelText: {
        fontSize: '16px',
        fontWeight: '500',
        color: '#333',
        marginBottom: '5px',
    },
    noData: {
        fontSize: '16px',
        fontStyle: 'italic',
        color: '#999',
        textAlign: 'center',
        marginTop: '10px',
    },
    loading: {
        fontSize: '18px',
        fontWeight: '600',
        textAlign: 'center',
        color: '#007bff',
    },
    calendarButton: {
        padding: '10px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        borderRadius: '5px',
        marginTop: '10px',
        width: '100%', // Full width for better responsiveness
    },
    calendarButtonHover: {
        backgroundColor: '#0056b3',
    },
    labelTextWrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    labelTime: {
        fontSize: '14px',
        color: '#333',
        marginLeft: '10px',
    },
    backButton: {
        position: 'absolute',
        top: '20px',
        left: '20px',
        width: '6rem',
        backgroundColor: '#ff6200',
        color: 'white',
        border: 'none',
        borderRadius: '30px',
        fontSize: '16px',
        padding: '8px 16px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease, transform 0.2s ease',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
        transform: 'translateY(3px)',
    },
    backButtonHover: {
        backgroundColor: '#e05a00',
        transform: 'translateY(-3px)',
    },

    // Media Queries for Responsiveness
    '@media (max-width: 768px)': {
        container: {
            maxWidth: '90%',
            padding: '15px',
        },
        profileTitle: {
            fontSize: '20px',
        },
        historyTitle: {
            fontSize: '18px',
        },
        dateToggleContainer: {
            flexDirection: 'column',
            alignItems: 'flex-start',
        },
        selectDateToggleButton: {
            marginLeft: '0',
            marginTop: '10px',
        },
        backButton: {
            width: '5rem',
            fontSize: '14px',
            padding: '6px 12px',
        },
        calendarButton: {
            width: 'auto', // Allow the button to adjust based on content
            fontSize: '14px',
            padding: '8px 16px',
        },
    },
    '@media (max-width: 480px)': {
        container: {
            maxWidth: '100%',
            padding: '10px',
        },
        profileTitle: {
            fontSize: '18px',
        },
        historyTitle: {
            fontSize: '16px',
        },
        labelItem: {
            padding: '10px',
        },
        dateToggleButton: {
            fontSize: '14px',
            padding: '6px 12px',
        },
        backButton: {
            width: '4rem',
            fontSize: '12px',
            padding: '6px 10px',
        },
        calendarButton: {
            padding: '6px 12px',
            fontSize: '12px',
        },
    },
};

export default styles;
