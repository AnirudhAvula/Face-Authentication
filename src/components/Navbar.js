import React from 'react'
import { useNavigate } from 'react-router-dom'

const Navbar = (props) => {
    let navigate = useNavigate();
    const handleLogout=()=>{
        let success = false
        localStorage.removeItem('token')
        navigate('/login')
        props.onLogout()
    }
  return (
    <>
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
  <div className="container-fluid">
    <a className="navbar-brand" href="/">FaceRecs</a>
    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse" id="navbarSupportedContent">
      <ul className="navbar-nav me-auto mb-2 mb-lg-0">
        <li className="nav-item">
          <a className="nav-link active" aria-current="page" href="/">Home</a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="/about">About</a>
        </li>
      </ul>
      <div>
        <button className="btn btn-outline-danger" type="submit" onClick={handleLogout}>Logout</button>
        </div>
    </div>
  </div>
</nav>
    </>
  )
}

export default Navbar