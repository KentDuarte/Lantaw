# CMSC_129_Documentation (1)

RFID-based Student Attendance System

---

### DOCUMENTATION

Submitted in Partial Fulfillment of the Requirements

in CMSC129 Software Engineering 2

Benitez, Hannah Lorraine Herbieto, Kermichil Obado, Shygfred Christian Olavides, Mary Yzabel Salvador, Priscilla

1
## Contents

1 Introduction 3

1.1 Problem / Opportunity . . . . . . . . . . . . . . . . . . . . . . . . . . . . 3

1.2 Solution . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 3

2 Technical Documentation 4

2.1 Architecture Design . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 4

2.1.1 Frontend . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 5

2.1.2 Backend . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 5

2.2 Database . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 5

2.3 Deployment . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 6

2.4 User Guide . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 7

2.4.1 Admin . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 8

2.4.1.1 Creating the School Year, Instructor, and RFID Machine

Registration . . . . . . . . . . . . . . . . . . . . . . . . . 8

2.4.1.2 Creating, Reading, Updating and Deleting (CRUD) the

User, Subject and Section . . . . . . . . . . . . . . . . . 10

2.4.2 Adviser . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 17

2.4.2.1 View Attendance . . . . . . . . . . . . . . . . . . . . . . 18

2.4.2.2 Editing Attendance . . . . . . . . . . . . . . . . . . . . . 18

2.4.2.3 Tagging a Student . . . . . . . . . . . . . . . . . . . . . 19

2.4.2.4 Form 2 Printing . . . . . . . . . . . . . . . . . . . . . . . 20

2.4.3 Student . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 22

2.4.3.1 RFID-Login . . . . . . . . . . . . . . . . . . . . . . . . . 22

2
## 1 Introduction

1.1 Problem / Opportunity

Attendance is one common problem that was raised by instructors in educational institutions. Not only because they hold the responsibility of ensuring that their students would attend classes, but also because attendance would be one key factor that contributes to student performance. However, advisers are burdened with facilitating manual attendance while also having to generate a Form 2 which would be given to DepEd. This adds to the already heavy task as a teacher.

An existing solution here is that attendance would be relegated through proxy such as a class monitor which solves the issue advisers face in facilitating manual attendance.
However, this still leaves the problem of transferring the attendance to a spreadsheet in order to be processed into a Form 2. A similar solution would require the students to login themselves, but that would also raise the issue of honesty, as well as the previous burden of transferring the information to a spreadsheet. Therefore, there is a potential opportunity to solve this problem that can help advisers facilitate attendance.

1.2 Solution

With all of these in mind, we propose Project RSAS or RFID-based Student Attendance System. This product aims to lessen the burden of advisers in facilitating attendance by using a device for student attendance, allowing them to see the attendance of their students at a particular day, and facilitates the generation of a Form 2, all while preserving the security and quality of its information.

The project will be a web-based application with IoT functionalities. We believe that this would make the product accessible to everyone where the features in it can be understandable to people who are not too familiar with technology.

3
## 2 Technical Documentation

2.1 Architecture Design

For this project, we used a layered architecture for web applications, specifically the Laravel 10 Architecture. It is a web application framework that is elegant, expressive, modular, and an all-in-one package. This helps web development beginners who have little to no experience setting up a project from scratch by providing an already established development environment. Furthermore, it also has functions that allow us to achieve the project’s goals. Throughout the development stage, we paired Laravel with the XAMPP cross-platform software package as well.

Figure 1: Project RSAS Software Architecture

Laravel 10 has the Model-View-Controller already part of its framework, making it easier to create, extend, and integrate components into the project moving forward.
Models act as interfaces of data storage that mainly communicate with the database, while Controllers are the main components that manage the project’s main business logic and user actions. Controllers interact with Models in order to communicate with the database. Views are the web interfaces that the Client receives and interacts with.
Specific views are sent to the Web Browser via Routes depending on the specific Controller that the user interacts with.
Laravel also allows the RFID machine to communicate with the web application through its existing API Routes. Laravel 10 also has built-in testing in the form of component testing, which helps debug the code after each branch merge.

4 2.1.1 Frontend

For the frontend side of the project, a number of languages were used:

- HTML was used to create the structure and layout of the web application.

- CSS was used to enhance the visual appearance of the web application by controlling
the layout, colors, fonts, and other design elements of the pages and modals.

- Bootstrap 5 was used to further enhance both visual appeal and user experience in
the input fields, and the modal animations in the application.

- JavaScript was used in controlling the appearance of appropriate input fields needed
by the user according to their specific roles.

- Ajax was used to submit input field values and to display any validation errors
detected by the server.

- JQuery was used to integrate client-side validation in the input fields, and prevent
erroneous input from entering the database.

- Blade was used to establish templates that can be extended and reused throughout
the web application.

- Font Awesome icons were used to give the users additional visual guide in using the
web application.

2.1.2 Backend

PHP is the programming language used in creating the backend side of the project, and to work together with Laravel’s Controllers, Models, and Routes.

2.2 Database

The database used in the project is based on the MySQL relational database management system. We have determined that MySQL provides features such as reliable performance, scalability, ability to handle large amounts of data, and our previous experience with it in the past semester, which meant that it would be suitable for our project. Below is the class diagram of our project database.

5 Figure 2: Project RSAS Entity Relationship Diagram

2.3 Deployment

To deploy our project, we used a combination of Amazon Web Services (AWS) products under the free tier such as AWS Elastic Beanstalk as our deployment platform and AWS Relational Database Service (RDS) as our project’s database instance. A domain name from .Tech Domains was registered, and the project can be accessed through the rsas.tech link.

6 2.4 User Guide

This section describes the features that are found in our product. In the following sections, we will be describing the functionalities that are found exclusively for each type of user (Admin or Adviser).
All users have to go through the landing (Fig 3) and login (Fig 4) pages that will serve as the fork that differentiates the Admin and Adviser functionalities. Users are prompted to enter their designated User ID and Password in order to enter the system.

Figure 3: Landing Page

Figure 4: Login Page

7 2.4.1 Admin

This section is allocated for defining the functions that are found in the Admin side of the program.

Figure 5: Administrator Homepage

2.4.1.1 Creating the School Year, Instructor, and RFID Machine Registration

Creating a School Year, adding an Instructor, and registering a new RFID Machine is accessible only to an Admin user. This serves as the initial creation of the information as most of the parts of the product such as creating a new section and/or subject would require a school year and instructor before being added into the database.

Figure 6: New School Year Modal

8 Figure 7: Register New Machine

(a) When all input is correct, the create button (b) When erroneous input is detected, the appears create button is hidden

Figure 8: Create Instructor Modal

Methods These are modals that allow the Admin to type in information that will be sent to the database. Once the Admin clicks the Create button, the values that are contained in the input fields are then sent to a controller where they will be validated and inserted into their respective database tables. In creating a new instructor, there are validation rules that prevent the user from duplicating an existing instructor in the database. In creating a new school year, users are only allowed to create school years starting from 1900 to 2099. For all modals, the Create button will not appear if any input is missing or found to be erroneous to protect that system from any errors as shown in Figure 8.

9 2.4.1.2 Creating, Reading, Updating and Deleting (CRUD) the User, Subject and Section

Admins are also able to access CRUD functionalities for aspects that are needed in the system and Form 2 generation, particularly Users, Subjects, and Sections.

User

(a) Student (b) Adviser

Figure 9: Create New User

Figure 10: View User List

10 (a) Student (b) Adviser

Figure 11: Edit Existing User

Figure 12: Delete Existing User

11 Section

(a) Choose Unenrolled Students

(b) Add Student

Figure 13: Create New Section

12 (a) Choose Sections under a specific Grade Level and School Year

(b) Section Page

Figure 14: View Section

13 Figure 15: Edit Section

Figure 16: Delete Section

14 Subject

Figure 17: Create Subject

Figure 18: View Subjects

15 Figure 19: Edit Subject

Figure 20: Delete Subject

Methods These are the CRUD modals that visualize the addition, modification, and removal of data from the database. Field validation, both client-side using JavaScript and server-side using Laravel’s validation feature, has also been implemented to show whether an erroneous or an existing input for a primary key has been entered in the modal.
In creating users, the Admin is prompted to choose user roles, with specific fields appearing according to specific roles being selected (students need an additional RFID

16 field to be registered in the system). Once the Admin clicks on the Create button, the values that are contained in the input fields are then sent to the controller for serverside validation. If all inputs have been successfully validated, they are inserted into the database. For users, they are immediately inserted into the user table. Users who have the Student role are also inserted into the student table, with their RFID number as the primary key.
Creating a section works similarly, except dropdown options are shown to allow the Admin to choose available users into the respective fields. Advisers that are not currently assigned to a section are shown in the Advisers dropdown field, while Students who do not currently belong to a section are shown in the Students dropdown field. The Admin can also choose from a dropdown list of school years to assign the section to.
When creating subjects, the Admin is given the ability to choose different date and time schedules for the subject, which will then be inserted into the schedule table.
The users, sections, and subjects registered in the system are shown in their respective View pages. This is where options to update or to delete their entry in the database are displayed.

2.4.2 Adviser

This section is allocated for defining the functions that are found in the Adviser side of the product.

Figure 21: Adviser Homepage

17 2.4.2.1 View Attendance

The View Attendance feature is accessible by the Adviser. It views the attendance of their advisory section on a particular day, for a specific subject.

Figure 22: View Advisory Class Attendance

Methods For the product to get the data that is attached to the adviser, the AdviserController would need to store the AdviserID in a session. That way, the AdviserID will be accessible to all parts of the Adviser Views without having the need to always call a proprietary function communicating to the database.
When the Blade page is loaded in, the controller calls the stored AdviserID and gets all the students that are under the adviser. It also gets the student’s status for that subject. Both of these values are placed alongside each other through an array. This array is returned to the views and generates the appropriate number of rows for the table.
Alongside this, subjects and school years are also called from the controller which would then be given to the views page.

2.4.2.2 Editing Attendance

The Edit Attendance feature is accessible by the adviser. It edits the attendance of a student at the specific subject, in the event that there are mistakes in the system in terms of attendance in a specific subject. A button is found next to the student name in the View Attendance page where the adviser can edit the attendance of the student.

18 Figure 23: Change Student Attendance

Methods This feature is an extension of the View Attendance feature. During the creation of the rows, the StudentID is attached to the button. When we want to change the attendance, the button will call upon the EditAttendance Views. We then store the Student ID, Subject ID and the Date that our attendance will be using in a session so that it can communicate the information throughout multiple Blade.PHP files.
The EditAttendance page will send the new status into the controller. Once the adviser has chosen the new attendance status and confirms it, the controller would then go to the corresponding Attendance Model and delete the student in their corresponding status table. It would then create a new row and insert it into the new status table thereby “moving” the information from one table to another.

2.4.2.3 Tagging a Student

Tagging a student is another feature unique to the adviser. It edits the enrollment status of the student enrolled in the adviser’s respective section. A button is found next to the student name in the View Students page where the adviser can edit the enrollment status of the student.

Figure 24: View Advisory Class’ Enrolment Status

19 Figure 25: Change Student Enrolment Status

Methods The Tagging feature works similarly to how the Change Attendance works.
When the tagging button is clicked, we then store the Student ID as a session so that the Tag Blade.PHP can use the information. Once the adviser confirms the tag of the student, the controller will get the row of the said student in the User model and change the is enrolled value accordingly where a value of 1 signifies Enrolled and a value of 0 signifies Dropped.

2.4.2.4 Form 2 Printing

The Creation of the Form 2 is the main feature of the adviser, which can be accessed in the adviser home page. Every month, student attendance information is compiled and inserted into the Form 2 template for the adviser’s convenience. The Adviser can generate their Form 2 by clicking on the Form 2 button in the home page.

Figure 26: Generate Form 2

20 Figure 27: Print Generated Form 2

Methods When the Form 2 button is clicked, it calls upon the Form2Controller to get the following information: month, section[‘name’] , section[‘grade level’] , male attendance array , female attendance array , male query , female query , lineLabel and lineNumber .
lineLabel and lineNumber contain the days of the week and the corresponding days respectively. male query and female query are used to get the number of users to loop on. Finally, the male attendance array and female attendance array contains the information of the student that has its name, the attendance, the number of times he is late and absent.
Once that information is called from the controller, it then calls the form2.blade.php file where the information is then placed into their appropriate locations in the Form 2.

21 2.4.3 Student

This section is allocated for defining the functions that are found in the Student side of the product.

2.4.3.1 RFID-Login

The RFID-Login feature is the main way for our system to determine the attendance of the student. The student will use their RFIDs and “tap” it on the machine.

Figure 28: RFID Machine

22 Figure 29: RFID Machine Deconstructed

Methods The machine will be in a waiting state where it waits for an RFID input.
When an RFID tag has been tapped near or on the scanner, a Python script running within the Raspberry Pi sends a POST request to the API and calls the tap function in the RFIDController . This tap function is responsible for retrieving the corresponding row from the Model and adding its corresponding attendance. If the API determines that the RFID tag is not registered to any student, or if there are no classes scheduled within the day, no data will be inserted into the database. If the student logs in before a class, they are considered present. If the student logs in during a class, they are considered late. Otherwise, they are considered absent. The green LED near the scanner will light up for three seconds if the student’s attendance log has been successfully inserted into the database.

23