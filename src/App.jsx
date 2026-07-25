import {useState} from 'react'

export default function App(){

const [username, setUsername] = useState('')

  return(
    <div className='container mt-5'>
      <h1 className='text-center mb-4'>Leetcode Progress Explorer</h1>

      <div className='input-group mb-3'>
        <input
        className='form-control'
        type='text'
        placeholder='Enter leetcode username'
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        
        />
        <button className='btn btn-dark' type='button'> Search </button>
      </div>
    </div>
  
  )
}