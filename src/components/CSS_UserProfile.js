const styles = {
    container: {
        fontFamily: 'Kumbh Sans',
        maxWidth: '600px',
        margin: '20px auto',
        padding: '20px',
        backgroundColor: '#fff',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        borderRadius: '10px',
        marginTop: '90px',
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
    profileHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
    },
    profilePhoto: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        objectFit: 'cover',
    },
    initialsCircle: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        backgroundColor: '#2c3e50',
        color: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '36px',
        fontWeight: 'bold',
    },
    profileDetails: {
        flex: 1,
        marginLeft: '20px',
        position: 'relative',
    },
    nameContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    name: {
        fontSize: '22px',
        fontWeight: '600',
        color: '#2c3e50',
    },
    editButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        color: '#007bff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.3s ease',
        opacity: 1,
    },
    editNameContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    nameInput: {
        fontSize: '16px',
        padding: '5px',
        border: '1px solid #ddd',
        borderRadius: '4px',
    },
    saveButton: {
        padding: '5px 10px',
        fontSize: '14px',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '15px',
        cursor: 'pointer',
    },
    email: {
        fontSize: '16px',
        color: '#555',
    },
    addLabelButton: {
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: '25px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        marginLeft: 'auto',
    },
    labelsHeader: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    arrowButton: {
        background: 'none',
        border: 'none',
        fontSize: '18px',
        cursor: 'pointer',
        color: '#007bff',
    },
    labelList: {
        listStyle: 'none',
        padding: '0',
    },
    labelItem: {
        backgroundColor: '#f7f7f7',
        marginBottom: '10px',
        padding: '10px',
        borderRadius: '5px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    labelItemRow: {
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    labelText: {
        fontSize: '16px',
        fontWeight: '500',
    },
    deleteButton: {
        backgroundColor: '#db2316',
        color: '#fff',
        border: 'none',
        padding: '5px 10px',
        borderRadius: '50px',
        cursor: 'pointer',
    },
    noLabels: {
        fontSize: '16px',
        color: '#555',
    },
    loading: {
        fontSize: '18px',
        textAlign: 'center',
    },
    noData: {
        fontSize: '18px',
        textAlign: 'center',
        color: '#555',
    },
    logoutButtonContainer: {
        position: 'absolute',
        top: '20px',
        right: '20px',
    },
    logoutButton: {
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
    logoutButtonHover: {
        backgroundColor: '#e05a00',
        transform: 'translateY(-3px)',
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
    authLogsContainer: {
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
    },
    logsHeader: {
        marginBottom: '16px',
        fontSize: '1.5rem',
        color: '#333',
        textAlign: 'center',
    },
    logsList: {
        listStyleType: 'none',
        padding: '0',
        margin: '0',
    },
    logItem: {
        marginBottom: '12px',
        padding: '10px',
        backgroundColor: '#fff',
        borderRadius: '6px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    logText: {
        display: 'block',
        fontSize: '1rem',
        color: '#555',
        marginBottom: '4px',
    },
    logDate: {
        display: 'block',
        fontSize: '0.9rem',
        color: '#777',
    },
    noLogs: {
        fontSize: '1rem',
        color: '#888',
        textAlign: 'center',
        marginTop: '16px',
    },
    viewHistoryButton: {
        padding: '10px 20px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '20px',
        textAlign: 'center',
    },

    // Responsive styles for smaller screens
    '@media (max-width: 768px)': {
        container: {
            padding: '15px',
        },
        profileTitle: {
            fontSize: '20px',
        },
        profileHeader: {
            flexDirection: 'column',
            alignItems: 'center',
        },
        profilePhoto: {
            width: '80px',
            height: '80px',
        },
        name: {
            fontSize: '18px',
        },
        email: {
            fontSize: '14px',
        },
        saveButton: {
            fontSize: '12px',
        },
        addLabelButton: {
            fontSize: '14px',
            padding: '8px 16px',
        },
        labelsHeader: {
            fontSize: '16px',
        },
        labelItem: {
            padding: '8px',
            fontSize: '14px',
        },
        backButton: {
            width: '5rem',
            padding: '6px 12px',
        },
        logoutButton: {
            width: '5rem',
            padding: '6px 12px',
        },
    },
    '@media (max-width: 480px)': {
        profileTitle: {
            fontSize: '18px',
        },
        profilePhoto: {
            width: '60px',
            height: '60px',
        },
        name: {
            fontSize: '16px',
        },
        email: {
            fontSize: '12px',
        },
        saveButton: {
            fontSize: '10px',
        },
        labelsHeader: {
            fontSize: '14px',
        },
        labelItem: {
            padding: '6px',
            fontSize: '12px',
        },
        addLabelButton: {
            fontSize: '12px',
            padding: '6px 12px',
        },
        backButton: {
            width: '4.5rem',
            padding: '4px 10px',
        },
        logoutButton: {
            width: '4.5rem',
            padding: '4px 10px',
        },
    },
};




export default styles;