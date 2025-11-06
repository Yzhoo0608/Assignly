# Assignly - Task Management


**Project overview:**

Assignly is an Ionic Framework (Angular) cross-platform mobile web application.
Users can create, view, update, and delete tasks in real time using the application, which functions as a task management system. Besides, this application ensures that users can access their previously loaded data even in out of an internet connection, offering an accurate and smooth experience in both online and offline settings. The project's goal is to create a digital task management system that deal with the inefficiencies of manual recording techniques.  Real-time synchronization and Firebase connection allow the system to improve workflow efficiency, ensure data consistency, and allow transparent progress tracking for all users. 

---

**Application feature:**

- **Create function** - Users can add new tasks with subject, deadline, and status fields.

- **View Tasks (Real-Time)** - Tasks are automatically updated in real time from Firebase Firestore without page refresh. 
- **Update Tasks** - Allows users to modify existing task details (such as name, due date, or status). Changes are instantly updated in the Firestore database. 
- **Remove Tasks** - Provides a quick way to remove unwanted tasks from the list. Once deleted, the task is immediately removed from Firestore and the live display. 
- **Offline Caching** - Uses Ionic Storage to temporarily save task data locally on the device. When offline, users can still view their last synced task list. Once the connection is restored, live data syncs automatically. 
- **Automatic Synchronization** - The app continuously synchronizes Firestore data with the local cache to ensure a smooth and consistent user experience. 
- **Firebase intergration** - Securely connects to Firebase Firestore for data management, with test-mode access configured for assignment development.

---

**Installation and Setup intructions:**

**Step 1:** Before starting make sure it have Nodejs with version 16 or above, npm (Node Package Manager) and Ionic CLI.
- npm install -g @ionic/cli

You can verify the installation by using:
- node -v
- npm -v
- ionic -v

<br>

**Step 2:** Clone the repository:
- git clone https://github.com/Yzhoo0608/Assignly.git

Then navigate into the project folder:
- cd Assignly

<br>

 **Step 3:** Install project dependencies:
 - npm install

This command will download and set up all the libraries and modules.

<br>

**Step 4:** Run the application:
- ionic serve
Once the compilation completes, the terminal will display a local URL such as:

Local: http://localhost:8600/

Now you may open the URL in your browser to view the application.

<br>

**Step 5:** If you want to stop the server:
- Ctrl + C
Then comfirm with:
- Y

