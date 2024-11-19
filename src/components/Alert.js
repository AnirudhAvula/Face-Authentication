import React from 'react'



const Alert = (props) => {
    
    const capitalize = (word)=>{
        if( word === 'danger'){
            word = "error"
        }
        const lower = word.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1)
    }
    return (
        props.alert && (
        <div>
            <div className={`alert alert-${props.alert.type} alert-dismissible fade show position-fixed w-100`} style={{height:'50px', zIndex: 9999}}  role="alert">
               <strong>{capitalize(props.alert.type)}</strong>: {props.alert.msg}
            </div>
        </div>
        )
    )
}

export default Alert
