import React from 'react'
import individualImage from '../images/individual.jpg'
import GroupImage from '../images/crowd.jpeg'
import CrowdImage from '../images/crowd1.jpeg'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
    let navigate = useNavigate();
const handleIndiRegister =()=>{
 navigate('/individualregistration')   
}
const handleIndiRegisterCNN =()=>{
 navigate('/individualregistrationcnn')   
}

const handleIndiAuth =()=>{
    navigate('/individualauthentication')   
   }

const handleIndiAuthCNN = ()=>{
    navigate('/individualauthenticationcnn')
}

const handleGroupAuth =()=>{
    navigate('/groupauthentication')
}

    
  return (
    <>
    <div><h1>Dashboard</h1></div>
    {/* <div className="container mt-5"> */}
    <div className="row justify-content-around">
        {/* Individual Face Authentication Card */}
        <div className="col-md-3 mb-4">
            <div className="card text-center shadow-sm p-3">
                <div className="card-body">
                    <h5 className="card-title mb-3">Individual Face Authentication</h5>
                    <img
                        src={individualImage}
                        alt="Individual Face"
                        className="rounded-circle mb-3"
                        style={{ width: '120px', height: '120px' }}
                    />
                    <button className="btn btn-primary m-2" onClick={handleIndiRegister}>Register</button>
                    <button className="btn btn-dark m-2" onClick={handleIndiRegisterCNN}>Register using our custom model</button>
                    <button className="btn btn-secondary m-2" onClick={handleIndiAuth}>Verify</button>
                    <button className="btn btn-dark m-2" onClick={handleIndiAuthCNN}>Verify using our custom model</button>
                    
                </div>
            </div>
        </div>

        {/* Group Authentication Card */}
        <div className="col-md-3 mb-4">
            <div className="card text-center shadow-sm p-3">
                <div className="card-body">
                    <h5 className="card-title mb-3">Group Authentication</h5>
                    <img
                        src={GroupImage}
                        alt="Group Authentication"
                        className="rounded-circle mb-3"
                        style={{ width: '120px', height: '120px' }}
                    />
                    
                    <button onClick={handleGroupAuth} className="btn btn-outline-success m-2">Verify</button>
                </div>
            </div>
        </div>

        {/* Crowd Analysis Card */}
        <div className="col-md-3 mb-4">
            <div className="card text-center shadow-sm p-3">
                <div className="card-body">
                    <h5 className="card-title mb-3">Crowd Analysis</h5>
                    <img
                        src={CrowdImage}
                        alt="Crowd Analysis"
                        className="rounded-circle mb-3"
                        style={{ width: '120px', height: '120px' }}
                    />
                    <button className="btn btn-primary m-2">Start</button>
                </div>
            </div>
        </div>
    </div>
{/* </div> */}

    </>
    

  )
}

export default Dashboard