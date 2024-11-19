import React, { useState } from 'react'
import {  useNavigate,Link } from 'react-router-dom'
import './Signup.css'
import './Login.css'
import Backgroundvideo from '../images/background1.mp4'
const Login = (props) => {

    const [credentials, setCredentials] = useState({email: "", password: ""})
    let navigate = useNavigate();
    const handleSubmit= async (e)=>{
        e.preventDefault()
        const success = true; // Assume login was successful
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method : 'POST',
            headers: {
                'Content-Type' : 'application/json' ,
            },
            body: JSON.stringify({email : credentials.email, password: credentials.password})  //sends values from frontend JS to backend by converting them into JSON object
        });
        const json =  await response.json()
        console.log(json)
        if (json.success){
            props.onLogin()
            //Save the token and redirect
            localStorage.setItem('token', json.authToken);
            props.showAlert("Logged in Successfully", "success")
            navigate('/')
        }else{
            props.showAlert("Invalid Credentials", "danger")
        }
    }

    const onChange = (e) =>{
        setCredentials({...credentials, [e.target.name]: e.target.value})
    }

    return (
        <>
        <div className='video-background'>
            <video autoPlay muted loop id='background-video'><source src={Backgroundvideo} type='video/mp4'/>Your browser does not support video tag</video>
        </div>
        <div className='container mx-10 my-5'>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input type="email" className="form-control" id="email" onChange={onChange} value={credentials.email} name='email' aria-describedby="emailHelp" />
                    <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="password" className="form-control" name="password" onChange={onChange} value={credentials.password} id="password" />
                </div>

                <button type="submit" className="btn btn-primary" >Login</button>
            </form>
            <br/>
           <p style={{textAlign: 'center'}}> Don't have an account? <Link to='/signup'>Signup</Link> </p>
        </div>
        </>
    )
}

export default Login
