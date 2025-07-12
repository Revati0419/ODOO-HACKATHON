# Q&A Platform

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16.x-green)](https://nodejs.org/)

A full-stack question-and-answer platform inspired by **Stack Overflow** with real-time voting, tagging, rich text editing, and answer acceptance features.

---

## 👥 Team

**Team Name:** **PMP**

---

## 🚀 Core Features

### ✅ Ask Questions  
Users can submit new questions with:
- **Title** – Short and descriptive  
- **Description** – Written using a rich text editor  
- **Tags** – Multi-select input (e.g., React, JWT)

### ✅ Rich Text Editor  
Supports:
- Bold, Italic, Strikethrough
- Numbered & bullet lists
- Emoji insertion
- Hyperlinks
- Image upload
- Text alignment (Left, Center, Right)

### ✅ Answer Questions  
- Users can post answers to any question
- Answers support full rich text formatting
- Only logged-in users can post answers

### ✅ Voting & Accepting Answers  
- Users can upvote or downvote answers
- Question owners can mark an answer as accepted

### ✅ Tagging  
- Questions must include relevant tags for better search and organization

### ✅ Notifications  
- A notification icon (bell) appears in the top navigation bar
- Users are notified when:
  - Someone answers their question
  - Someone comments on their answer
  - Someone mentions them using `@username`
- The icon shows unread notification count
- Clicking the icon shows a dropdown with recent notifications

---

## 🛠️ Admin Role

Admins can:
- Reject inappropriate or spammy questions/skill descriptions
- Ban users who violate platform policies
- Monitor pending, accepted, or cancelled items
- Send platform-wide messages (feature updates, downtime alerts)
- Download reports of user activity, feedback logs, and statistics

---

## 📸 Sneak Peek

### 🏷️ Tags  
<img width="1730" height="942" alt="Tags Screenshot" src="https://github.com/user-attachments/assets/6e4fa01d-6ea1-49c6-ba5e-157710152f66" />

### ✍️ Ask Your Question  
<img width="1730" height="942" alt="Ask Question Screenshot" src="https://github.com/user-attachments/assets/1daef779-4ac7-41ee-a86c-f7d77a9de892" />

---

## ⚙️ System Architecture

The platform follows a typical **MERN** stack architecture:

- **Frontend**: React 18 (with Tailwind CSS for styling)
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (or MySQL if used)
- **Authentication**: JWT-based authentication
- **Rich Text Editor**: e.g., [Quill](https://quilljs.com/) or [Draft.js](https://draftjs.org/)

---

<img width="2850" height="2709" alt="System Architecture Diagram" src="https://github.com/user-attachments/assets/0d0ca8a8-cc5c-462b-a20c-aa9f97dff87a" />

---

## 🗂️ Database Design

<img width="4955" height="5445" alt="Database Design Diagram" src="https://github.com/user-attachments/assets/53ccc5f0-5194-4fa7-88ce-8d1fd8b2e970" />

---

## 👥 Contributors

- **Revati Patare**
- **Mukta Naik**
- **Tanuja Patil**

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
