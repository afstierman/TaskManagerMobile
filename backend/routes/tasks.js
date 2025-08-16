const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

// Get all tasks for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new task
router.post('/', auth, async (req, res) => {
  const { title, description, status, dueDate, notifications } = req.body;

  // Only allow notifications with absolute times
  let notificationTimes = [];
  if (Array.isArray(notifications)) {
    notificationTimes = notifications
      .filter(n => n && n.time)
      .map(n => ({ time: new Date(n.time) }));
    // Require dueDate if notifications are present
    if (notificationTimes.length > 0 && !dueDate) {
      return res.status(400).json({ message: 'A due date is required when notifications are present.' });
    }
  }

  try {
    const newTask = new Task({
      user: req.user,
      title,
      description,
      status,
      dueDate,
      notifications: notificationTimes,
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a task by ID
router.put('/:id', auth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }

  const { title, description, status, dueDate, notifications } = req.body;

  // Convert notification offsets to absolute times
  let notificationTimes = [];
  if (Array.isArray(notifications)) {
    notificationTimes = notifications
      .filter(n => n && n.time)
      .map(n => ({ time: new Date(n.time) }));
    // Require dueDate if notifications are present
    if (notificationTimes.length > 0 && !dueDate) {
      return res.status(400).json({ message: 'A due date is required when notifications are present.' });
    }
  }

  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    task.title = title !== undefined ? title : task.title;
    task.description = description !== undefined ? description : task.description;
    task.status = status !== undefined ? status : task.status;
    task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
    task.notifications = notificationTimes;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a task by ID
router.delete('/:id', auth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }

  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
