# StudyWise 🎓

StudyWise is an AI-powered placement preparation platform designed to help students prepare for technical interviews and placement exams through interactive quizzes, performance analytics, study resources, and an AI Coach.

## 🚀 Live Project

https://study-wise-nu.vercel.app/

## 📌 About the Project

StudyWise was developed as part of the **IBM SkillsBuild Gen AI & Cloud Computing Internship**.

The project focuses on using Generative AI and modern web technologies to create a practical placement preparation platform for students.

Users can practice different technical subjects, select difficulty levels, track their performance, access learning resources, and use AI-powered features to improve their preparation.

## ✨ Features

* 🧠 AI-powered explanations and AI Coach
* 📝 Interactive placement quizzes
* 📚 Multiple technical subjects
* 🎯 Easy, Medium, and Hard difficulty levels
* 🔢 5, 10, and 15 question quiz options
* 📊 Performance analytics
* 📈 Accuracy and subject-wise performance tracking
* 📖 Curated learning resources
* 🔌 Frontend and backend API integration
* 🗄️ Persistent database integration
* ☁️ Cloud deployment

## 📚 Subjects

StudyWise currently includes:

* Java
* Data Structures & Algorithms
* DBMS
* SQL
* Operating Systems
* Computer Networks
* Aptitude

## 🤖 Generative AI

Generative AI was used as a key part of the project to provide AI-powered explanations and coaching features.

The goal was to make the platform more interactive and useful than a traditional static quiz application.

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* HTML
* CSS

### Backend

* Node.js
* API-based backend architecture

### Database

* Neon PostgreSQL

### AI

* Generative AI / AI API integration

### Deployment

* Vercel — Frontend
* Render — Backend
* Neon — Database

### Development & Tools

* Git
* GitHub
* Docker
* VS Code

## 🏗️ Project Structure

```text
StudyWise/
│
├── backend/
│   └── Backend source code
│
├── public/
│   └── Public assets
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── ...
│
├── Dockerfile
├── docker-compose.yml
├── package.json
├── vite.config.ts
└── README.md
```

## ⚙️ Environment Variables

The application uses environment variables for sensitive configuration.

Create a `.env` file locally and configure the required variables.

Example:

```env
DATABASE_URL=your_database_connection_string
AI_API_KEY=your_ai_api_key
```

**Never commit `.env` files, passwords, database credentials, or API keys to GitHub.**

## 💻 Running Locally

Clone the repository:

```bash
git clone https://github.com/meetkatlana/StudyWise.git
```

Move into the project directory:

```bash
cd StudyWise
```

Install dependencies:

```bash
npm install
```

Configure the required environment variables in your local `.env` file.

Start the development server:

```bash
npm run dev
```

The application will then be available on the local development URL shown in the terminal.

## 🌐 Deployment

### Frontend

The frontend is deployed using Vercel.

Live application:

https://study-wise-nu.vercel.app/

### Backend

The backend is deployed using Render.

Backend deployment:

https://studywise-backend-24kv.onrender.com/

### Database

The application uses Neon PostgreSQL for database storage.

## 🔐 Security

Sensitive credentials are stored using environment variables and should never be committed to the public repository.

Do not expose:

* API keys
* Database passwords
* Database connection strings
* Authentication secrets
* `.env` files

## 📈 Future Improvements

Some possible future improvements include:

* More AI-powered personalized recommendations
* More placement subjects and question banks
* Improved adaptive quiz generation
* Better analytics and progress tracking
* User authentication improvements
* Mobile-responsive enhancements
* Additional AI learning tools

## 👨‍💻 Developer

**Meet Katlana**

B.Tech Computer Science & Engineering Student

GitHub:
https://github.com/meetkatlana

## 📜 Internship

This project was developed as part of the **IBM SkillsBuild Gen AI & Cloud Computing Internship**, conducted by BharatCares in association with AICTE and IBM SkillsBuild.

---

⭐ If you find StudyWise useful, consider giving the repository a star!
