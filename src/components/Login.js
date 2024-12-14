import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Signup.css';
import './Login.css';
import Backgroundvideo from '../images/background1.mp4';

const Login = (props) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  let navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const json = await response.json();
      console.log(json);

      if (json.success) {
        sessionStorage.setItem('token', json.authToken); // Store token in sessionStorage
        props.onLogin(); // Update login state in App.js
        props.showAlert('Logged in Successfully', 'success');
        navigate('/Dashboard'); // Navigate after successful login
      } else {
        props.showAlert('Invalid Credentials', 'danger');
      }
    } catch (error) {
      console.error('Login error:', error);
      props.showAlert('Something went wrong. Please try again.', 'danger');
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <>
      <div className="facerecs-video-background">
  <video autoPlay muted loop id="facerecs-background-video">
    <source src={Backgroundvideo} type="video/mp4" />
    Your browser does not support the video tag.
  </video>
</div>
<div className="facerecs-login-container">
  <h1 className="facerecs-login-heading" style={{ fontFamily: 'Orbitron' }}>FaceRecs</h1>
  <form onSubmit={handleSubmit}>
    <div className="facerecs-form-group">
      <label htmlFor="email" className="facerecs-form-label">Email address</label>
      <input
        type="email"
        className="facerecs-form-input"
        id="email"
        name="email"
        value={credentials.email}
        onChange={onChange}
        required
      />
      <small id="emailHelp" className="facerecs-form-text">We'll never share your email with anyone else.</small>
    </div>
    <div className="facerecs-form-group">
      <label htmlFor="password" className="facerecs-form-label">Password</label>
      <input
        type="password"
        className="facerecs-form-input"
        id="password"
        name="password"
        value={credentials.password}
        onChange={onChange}
        required
      />
    </div>
    <button type="submit" className="facerecs-btn">Login</button>
  </form>
  <p className="facerecs-signup-text">
    Don't have an account? <Link to="/" className="facerecs-signup-link">Signup</Link>
  </p>
</div>

    </>
  );
};

export default Login;
