import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Modal from './Modal'; 
import './App.css';

function App() {
  const API_URL = process.env.REACT_APP_API_URL;
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async (filterValue) => {
    setIsLoading(true);
    try {
      const endpoint = filterValue === 'all' ? '/tasks' : `/tasks/status/${filterValue}`;
      const response = await axios.get(`${API_URL}${endpoint}`);
      setTasks(response.data.tasks);
    } catch (error) {
      alert('Error fetching tasks. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(filter);
  }, [filter, API_URL]);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleSaveTask = useCallback(
    (taskId, taskData) => {
      if (taskId) {
        editTask(taskId, taskData);
      } else {
        createTask(taskData);
      }
    }, []
  );

  const createTask = async (newTaskData) => {
    try {
      const response = await axios.post(`${API_URL}/tasks`, newTaskData);
      setTasks(prevTasks => [...prevTasks, response.data.task]);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const toggleTaskStatus = async (task) => {
    try {
      const newStatus = task.status === 'pending' ? 'completed' : 'pending';
      const response = await axios.put(`${API_URL}/tasks/${task._id}`, {
        status: newStatus,
      });
      setTasks(tasks.map((t) => (t._id === task._id ? response.data.task : t)));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const editTask = async (taskId, updatedTaskData) => {
    try {
      const response = await axios.put(`${API_URL}/tasks/${taskId}`, updatedTaskData);
      setTasks(prevTasks => prevTasks.map(task => task._id === taskId ? response.data.task : task));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_URL}/tasks/${taskId}`);
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEditClick = (task) => {
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentTask(null);
  };

  const handleCreateTaskClick = () => {
    setCurrentTask({ title: '', description: '', status: 'pending' });
    setIsModalOpen(true);
  };

  return (
    isLoading ? (
      <p className="flex justify-center items-center h-screen">Loading tasks...</p>
    ) : (
      <div className="App flex flex-col min-h-screen">
        <header className="bg-white shadow">
          <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Welcome Back, User!</h1>
                <p className="mt-1.5 text-sm text-gray-500">Let's write a new task! 🎉</p>
              </div>
              <div className="mt-4 flex flex-col gap-4 sm:mt-0 sm:flex-row sm:items-center">
              <button
                className="block rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring"
                type="button"
                onClick={() => {
                  setCurrentTask(null);
                  setIsModalOpen(true);
                }}
              >
                Create Task
              </button>
              </div>
            </div>
          </div>
        </header>
    
        <main className="flex-grow">
          <div className="mb-4 mt-8">
            <select
              className="border-gray-300 rounded-lg text-gray-700 p-2 focus:border-indigo-500"
              onChange={handleFilterChange}
              value={filter}
            >
              <option value="all">All Tasks</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
  
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {/* Iterar sobre las tareas y crear una tarjeta para cada una */}
            {tasks.map((task) => (
              <div key={task._id} className="bg-white shadow rounded-lg p-4">
                <h2 className="font-bold text-lg">{task.title}</h2>
                <p className="text-gray-600">{task.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <button
                    className="text-white bg-green-500 hover:bg-green-600 rounded px-4 py-2 transition"
                    onClick={() => toggleTaskStatus(task)}
                  >
                    {task.status === 'pending' ? 'Complete' : 'Uncomplete'}
                  </button>
                  {task.status === 'pending' && (
                    <button
                      className="text-white bg-blue-500 hover:bg-blue-600 rounded px-4 py-2 transition"
                      onClick={() => handleEditClick(task)}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    className="text-white bg-red-500 hover:bg-red-600 rounded px-4 py-2 transition"
                    onClick={() => deleteTask(task._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
    
        {/* Componente Modal */}
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            task={currentTask}
            onSave={handleSaveTask}
          />
        )}
    
        <footer className="bg-white">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500 text-sm">
              © 2023 Task Manager. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    )
  );
}

export default App;
