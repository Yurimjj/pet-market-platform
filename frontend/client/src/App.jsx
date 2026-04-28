import './App.css'
import { RouterProvider } from 'react-router-dom'
import root from './router/root'
import React from 'react';

function App() {

  return (
    <RouterProvider router={root} />
  )
}

export default App
