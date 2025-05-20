🧆 Arab-Food-Market   


Arab Food Market is a full-stack web app that helps Arab home chefs in the U.S. sell homemade food to nearby customers. It bridges the gap between talented home cooks and people looking for authentic Arab meals. This platform allows chefs to showcase their dishes, set prices, and manage orders, while customers can browse, message, and place orders directly.

**Live Website:** [ArabFoodMarket.com](http://ArabFoodMarket.com)

🚀 Features

- Users can sign up as chefs or customers
- Chefs can post meals with images and prices to set up their Menu
- Customers can browse chefs and order food
- Real-time messaging between chefs and customers
- Order management dashboard for both users


🧱 Tech Stack

Frontend:
React
Axios
Socket.IO (for real-time messaging)


Backend:
Node.js
Express.js
JWT for authentication
Bcrypt for password hashing
Socket.IO (for real-time messaging)


Database:
MySQL (for users, orders, etc.)
MongoDB (for messages)

DevOps & Tools:
Docker
Git & GitHub
Postman (for API testing)

Testing:
Jest
Supertest
Cypress

Deployment:
AWS EC2

🛠️ Installation

1- Clone the repo:

git clone https://github.com/AbdelrahmanAbudayyah/Arab-Food-Market
cd Arab-Food-Market

2- Set up environment variables:
Create .env files for both backend and frontend with appropriate credentials.

frontend .env
REACT_APP_API_URL="your backend url"

backend .env
MYSQL_HOST=""
MYSQL_USER=""
MYSQL_PASSWORD=""
MYSQL_DATABASE=""
MYSQL_TEST_DATABASE="" # Your test database for running tests
MYSQL_PORT=""
JWT_SECRET=""
JWT_REFRESH_SECRET=""
MONGO_URI=""
NODE_ENV=dev
FRONTEND_URL=""

3- Run with Docker
docker-compose up --build

4-Visit the app
Frontend: http://localhost:3000

