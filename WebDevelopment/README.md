### Mountainland Technaical College - Capstone Project
Made by Garrett Brunner and Chase Olson

Client Side uses NextJS and is hosted on Vercel
Server Side uses Express and CORS and is hosted on Render, server side is authicated, and passwords are hashed using bycyrpt
PostgreSQL Database is stored on Supabase

### Student Registration App
Synopsis: A web app to register and view courses. Users that are signed in can apply for courses and see what Courses they have, they can remove courses at anytime. 

If the user has an admin account they can view all student accounts, all courses available. They can also create students and register courses to the database


## DEV ENVIRONMENT
```bash
git clone https://github.com/GBBrunner/student_registration_app
cd student_registration_app
npm i
```
### Run Client Side in terminal
```bash
cd client
npm i
npm run dev
```
### Run Server in a second terminal
```bash
cd server
npm i
npm run dev
```
### Local PostgreSQL (development)
In production you would use a 3rd party to store your data
This project Supabase, but Render and firebase work as well
- Docker (recommended):
```bash
docker run --name student-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=postgres -p 5432:5432 -d postgres:15
```

- Notes: The app's default connection string is `postgresql://postgres:postgres@localhost:5432/postgres`. To use a different database or credentials, set the `DB_URL` or `SUPABASE_DB_URL` environment variable before starting the server. Run the SQL files in the `PostgreSQL/schemas` directory to create required tables when needed.

### Schemas
Schemas of the tables created can be found in the directory /PostgreSQL. It has proper prameters to stage proper values being accepted by the database.

- user table: Stores all the user information. Passwords are not kept in the database but are hashed for greater security> This table contains all users, so students and admins. All users have two unique idenifers, student_id (6 digit number), and user_Id (UUID)
- courses table: Contains all the information for the courses, courses also include 2 unique idenfiers, Course_Code (Small string (eg. ABC-123)), and course_id (UUID)
- Student_Courses: When a user enrolls for a course it stores it in a many-to-many table. It stores the the user_id (UUID) and the course_id (UUID) So it creates a new row for every course every student enrolls in.
The smaller unique idenifiers are for the convience of adding or search for students and courses

## Student-Side
When a user signs up, it automatically assigns the role 'student' to them they have access to the list of courses. They can select any of the courses and enroll in them. They can then view the courses and remove them if needed. For each course ethey can see
* Course Code
* Course Description
* Room Number
* Capacity 
* Credits
* Tuition Cost (USD)
* Created At
* Updated AT
* Instructor
On their dashboard page they can view their Username, student_id and user_id. (student Ids are no longer randomly generated, but rather sequential instead)

## Admin-Side
If you have access to the PostgreSQL database (on Supabase) you can manually update a user's role to Admin. The project uses protected routes so only admins can see
An Admin can create course, view/edit student info (WIP), and Create a student account (WIP). Admins can also unenroll a student from a course if needed. (WIP)