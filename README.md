# Q&A Platform

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16.x-green)](https://nodejs.org/)

A full-stack question-and-answer platform inspired by Stack Overflow with real-time voting, tagging, and answer acceptance features.

## 📌 Features

- **Question Management**: Post, view, and search questions
- **Answer System**: Submit and accept answers
- **Tagging**: Categorize questions with tags
- **Voting**: Upvote/downvote questions and answers
- **User Profiles**: Track user activity and reputation
- **Notifications**: Real-time updates for answers and accepts

## 📸 Screenshots

### Dashboard
![Dashboard Screenshot](./screenshots/dashboard.png) <!-- Replace with your actual screenshot path -->

## 📊 System Architecture

### Application Flow
```mermaid
flowchart TD
    A[User] --> B[Auth]
    B --> C[Home/Questions]
    C --> D[Question Detail]
    D --> E[Post Answer]
    C --> F[Ask Question]
    C --> G[Browse Tags]
