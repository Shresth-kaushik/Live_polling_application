
## The login credential for a teacher are  :
Email : teacher@gmail.com / abc@gmail.com
Password : teacher@123 / 121212

## Setup Instructions
### 1. Clone the Repository

```bash
git clone <repo-url>
cd Live_polling
```

### 2. Firebase Setup

- Create a Firebase project.
- Enable **Authentication** (Email/Password).
- Create a **Firestore** database.
- Download the service account key and save as `server/private.json`.
- Update `client/src/firebase.js` with your Firebase config.

### 3. Install Dependencies

#### Client

```bash
cd client
npm install
```

#### Server

```bash
cd ../server
npm install
```

### 4. Run the Application

#### Start the Backend

```bash
cd server
npm start
```

#### Start the Frontend

```bash
cd ../client
npm start
```

- The React app runs on [http://localhost:3000](http://localhost:3000)
- The backend runs on [http://localhost:5001](http://localhost:5001)

## Usage

- **Teacher:** Log in, create polls, monitor responses, chat, and manage participants.
- **Student:** Join with your name, answer polls, and chat.

## Environment Variables

- `server/private.json`: Firebase Admin credentials (keep this file secret).
- `client/src/firebase.js`: Firebase web config.
  
**Note:** This project is for educational/demo purposes. Do not expose sensitive keys in production.


## SCREENSHOTS ##
<img width="1428" alt="Screenshot 2025-06-20 at 11 57 35 AM" src="https://github.com/user-attachments/assets/d46d59bf-7cfd-4e49-928b-29eec59e9744" />
<img width="1428" alt="Screenshot 2025-06-20 at 11 57 53 AM" src="https://github.com/user-attachments/assets/c57231de-d252-4d9b-a959-715d5412a53d" />
<img width="1428" alt="Screenshot 2025-06-20 at 11 58 31 AM" src="https://github.com/user-attachments/assets/59d9e12e-965d-4992-93ba-37a4c17ac9d6" />
<img width="1428" alt="Screenshot 2025-06-20 at 11 58 38 AM" src="https://github.com/user-attachments/assets/7e5797e1-dce4-4dfe-ac3e-483e495ddfea" />
<img width="1428" alt="Screenshot 2025-06-20 at 11 59 14 AM" src="https://github.com/user-attachments/assets/a20f43ed-9047-4aee-a277-069136b235a6" />
<img width="1428" alt="Screenshot 2025-06-20 at 11 59 19 AM" src="https://github.com/user-attachments/assets/d5cd86bb-d260-4db5-9e05-f085b74e6311" />
<img width="1428" alt="Screenshot 2025-06-20 at 11 59 44 AM" src="https://github.com/user-attachments/assets/033d394e-426a-441d-ba0f-5768689c2701" />
<img width="1428" alt="Screenshot 2025-06-20 at 11 59 51 AM" src="https://github.com/user-attachments/assets/a464cd39-4c31-497d-9f57-25547d0373e5" />
<img width="633" alt="Screenshot 2025-06-20 at 12 00 17 PM" src="https://github.com/user-attachments/assets/ab812382-fb72-4ac3-895f-f2cb426da116" />

<img width="633" alt="Screenshot 2025-06-20 at 12 00 30 PM" src="https://github.com/user-attachments/assets/10b4e815-868c-4a68-8867-5325f60992cd" />
<img width="390" alt="Screenshot 2025-06-20 at 12 00 56 PM" src="https://github.com/user-attachments/assets/60425cf6-92db-4947-949d-82b50cdd1f71" />
<img width="390" alt="Screenshot 2025-06-20 at 12 01 04 PM" src="https://github.com/user-attachments/assets/e3cd109e-6adb-460b-810c-a92cdd860e0d" />
<img width="1425" alt="Screenshot 2025-06-20 at 12 01 23 PM" src="https://github.com/user-attachments/assets/86b082fb-e728-461b-86cb-5f729ed62353" />
<img width="1425" alt="Screenshot 2025-06-20 at 12 02 19 PM" src="https://github.com/user-attachments/assets/f0273c34-c52b-4049-ac27-d6b1fb62a766" />
<img width="1425" alt="Screenshot 2025-06-20 at 12 02 53 PM" src="https://github.com/user-attachments/assets/708bc256-928f-412a-b4e1-4a5fcec30938" />















